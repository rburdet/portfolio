"use client";

import { useRef, useState } from "react";

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

type TranscriptEntry = ChatMessage | { role: "error"; content: string };

export default function AskBar() {
	const [input, setInput] = useState("");
	const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
	const [busy, setBusy] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		requestAnimationFrame(() => {
			panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight });
		});
	};

	async function ask(question: string) {
		setBusy(true);
		const history = transcript
			.filter((m): m is ChatMessage => m.role !== "error")
			.slice(-6);
		setTranscript((t) => [...t, { role: "user", content: question }]);
		scrollToBottom();

		try {
			const res = await fetch("/api/ask", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ question, history }),
			});

			if (res.status === 429) {
				setTranscript((t) => [
					...t,
					{ role: "error", content: "rate limit exceeded — try tomorrow" },
				]);
				return;
			}
			if (!res.ok || !res.body) {
				setTranscript((t) => [
					...t,
					{ role: "error", content: "error: model unavailable" },
				]);
				return;
			}

			setTranscript((t) => [...t, { role: "assistant", content: "" }]);
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";
				for (const line of lines) {
					if (!line.startsWith("data: ")) continue;
					const payload = line.slice(6).trim();
					if (payload === "[DONE]") continue;
					try {
						const parsed = JSON.parse(payload) as { response?: string };
						if (parsed.response) {
							setTranscript((t) => {
								const next = [...t];
								const last = next[next.length - 1];
								if (last?.role === "assistant") {
									next[next.length - 1] = {
										role: "assistant",
										content: last.content + parsed.response,
									};
								}
								return next;
							});
							scrollToBottom();
						}
					} catch {
						// línea SSE parcial/no-JSON: ignorar
					}
				}
			}
		} catch {
			setTranscript((t) => {
				const last = t[t.length - 1];
				if (last?.role === "assistant") {
					if (last.content === "") {
						return [
							...t.slice(0, -1),
							{ role: "error", content: "error: model unavailable" },
						];
					}
					return [
						...t.slice(0, -1),
						{ role: "assistant", content: last.content + " [truncated]" },
						{ role: "error", content: "error: model unavailable" },
					];
				}
				return [...t, { role: "error", content: "error: model unavailable" }];
			});
		} finally {
			setBusy(false);
			scrollToBottom();
		}
	}

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		const q = input.trim();
		if (!q || busy) return;
		setInput("");
		void ask(q);
	}

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
			<div className="mx-auto max-w-4xl px-2 pb-2 sm:px-4 md:px-6">
				{transcript.length > 0 && (
					<div
						ref={panelRef}
						className="pointer-events-auto mb-1 max-h-[50vh] overflow-y-auto rounded-t border border-b-0 border-term-border bg-term-surface/95 p-3 text-xs backdrop-blur"
					>
						{transcript.map((entry, i) => (
							<p
								key={i}
								className={
									entry.role === "user"
										? "mt-2 text-zinc-100 first:mt-0"
										: entry.role === "error"
											? "mt-1 text-term-red"
											: "mt-1 whitespace-pre-wrap text-zinc-400"
								}
							>
								{entry.role === "user" ? (
									<>
										<span className="text-term-green">ask&gt;</span>{" "}
										{entry.content}
									</>
								) : (
									entry.content
								)}
							</p>
						))}
						{busy && <p className="mt-1 animate-pulse text-zinc-600">…</p>}
					</div>
				)}
				<form
					onSubmit={onSubmit}
					className="pointer-events-auto flex items-center gap-2 rounded border border-term-border bg-term-surface px-3 py-2"
				>
					<span className="text-sm text-term-green">ask&gt;</span>
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="anything about me or my projects — powered by Workers AI"
						maxLength={500}
						disabled={busy}
						aria-label="Ask the AI about Rodrigo"
						className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
					/>
				</form>
			</div>
		</div>
	);
}
