"use client";

import { useEffect, useState } from "react";

interface TypingProps {
	text: string;
	speed?: number;
}

export default function Typing({ text, speed = 55 }: TypingProps) {
	const [chars, setChars] = useState(0);

	useEffect(() => {
		if (chars >= text.length) return;
		const t = setTimeout(() => setChars((c) => c + 1), speed);
		return () => clearTimeout(t);
	}, [chars, text.length, speed]);

	return (
		<span aria-label={text}>
			<span aria-hidden>{text.slice(0, chars)}</span>
			<span
				aria-hidden
				className="ml-0.5 inline-block h-[1em] w-[0.55ch] translate-y-[0.1em] bg-term-green animate-blink"
			/>
		</span>
	);
}
