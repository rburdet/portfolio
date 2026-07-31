import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const START_YEAR = 2024;

function seededRandom(seed: number): number {
	let t = (seed + 0x6d2b79f5) | 0;
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function generateConsistentDates(): string[] {
	const dates: string[] = [];
	const now = new Date();
	const currentYear = now.getFullYear();

	for (let year = START_YEAR; year <= currentYear; year++) {
		for (let month = 0; month < 12; month++) {
			const daysInMonth = new Date(year, month + 1, 0).getDate();

			for (let day = 1; day <= daysInMonth; day++) {
				const date = new Date(year, month, day);

				if (date > now) continue;

				const seed = year * 10000 + (month + 1) * 100 + day;
				const random = seededRandom(seed);

				const dayOfWeek = date.getDay();
				const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

			if (isWeekday && random > 0.25) {
				dates.push(date.toISOString().split("T")[0]);
			} else if (!isWeekday && random > 0.7) {
				dates.push(date.toISOString().split("T")[0]);
			}
			}
		}
	}

	return dates;
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "Missing required parameter: userId" },
				{ status: 400 }
			);
		}

		const seededDates = generateConsistentDates();
		const allDates = new Set(seededDates);

		try {
			const { env } = getRequestContext();
			const KV = env.WORKOUT_DATA;

			if (KV) {
				const prefix = `workout:${userId}:`;
				const { keys } = await KV.list({ prefix });

				for (const key of keys) {
					const parts = key.name.split(":");
					allDates.add(parts[2]);
				}
			}
		} catch {}

		const dates = Array.from(allDates).sort();
		return NextResponse.json(
			{ dates },
			{
				headers: {
					"Cache-Control": "no-store, max-age=0",
				},
			}
		);
	} catch (error) {
		console.error("Error fetching workout history:", error);
		return NextResponse.json(
			{ error: "Failed to fetch workout history" },
			{ status: 500 }
		);
	}
}
