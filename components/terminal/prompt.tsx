interface PromptProps {
	command: string;
	className?: string;
}

export default function Prompt({ command, className = "" }: PromptProps) {
	return (
		<div className={`text-base md:text-lg ${className}`}>
			<span className="text-term-green">$</span>{" "}
			<span className="text-zinc-100">{command}</span>
		</div>
	);
}
