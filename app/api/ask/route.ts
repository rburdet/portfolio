import { getRequestContext } from "@cloudflare/next-on-pages";
import { buildSystemPrompt } from "@/lib/ai-context";

export const runtime = "edge";

const DAILY_LIMIT = 20;
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

interface AskEnv {
	AI: {
		run(
			model: string,
			options: Record<string, unknown>,
		): Promise<ReadableStream>;
	};
	ASK_RATELIMIT: {
		get(key: string): Promise<string | null>;
		put(
			key: string,
			value: string,
			options?: { expirationTtl?: number },
		): Promise<void>;
	};
}

function json(body: unknown, status: number) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

export async function POST(request: Request) {
	let body: { question?: unknown; history?: unknown };
	try {
		body = await request.json();
	} catch {
		return json({ error: "bad_request" }, 400);
	}

	const question =
		typeof body.question === "string" ? body.question.trim() : "";
	const rawHistory = Array.isArray(body.history) ? body.history : [];
	if (!question || question.length > 500 || rawHistory.length > 6) {
		return json({ error: "bad_request" }, 400);
	}

	const history: ChatMessage[] = rawHistory
		.filter(
			(m): m is ChatMessage =>
				!!m &&
				typeof m === "object" &&
				((m as ChatMessage).role === "user" ||
					(m as ChatMessage).role === "assistant") &&
				typeof (m as ChatMessage).content === "string",
		)
		.map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

	const env = getRequestContext().env as unknown as AskEnv;

	const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
	const day = new Date().toISOString().slice(0, 10);
	const key = `ask:${ip}:${day}`;
	const count = parseInt((await env.ASK_RATELIMIT.get(key)) ?? "0", 10);
	if (count >= DAILY_LIMIT) {
		return json({ error: "rate_limit" }, 429);
	}

	const messages = [
		{ role: "system", content: buildSystemPrompt() },
		...history,
		{ role: "user", content: question },
	];

	try {
		const stream = await env.AI.run(MODEL, {
			messages,
			stream: true,
			max_tokens: 512,
		});
		await env.ASK_RATELIMIT.put(key, String(count + 1), {
			expirationTtl: 60 * 60 * 24,
		});
		return new Response(stream, {
			headers: {
				"content-type": "text/event-stream",
				"cache-control": "no-cache",
			},
		});
	} catch {
		return json({ error: "model_unavailable" }, 502);
	}
}
