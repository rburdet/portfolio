import Prompt from "@/components/terminal/prompt";

const LINKS = [
	{ label: "email", value: "rodrigoburdet@gmail.com", href: "mailto:rodrigoburdet@gmail.com" },
	{ label: "github", value: "github.com/rburdet", href: "https://github.com/rburdet" },
	{
		label: "linkedin",
		value: "linkedin.com/in/rodrigo-burdet-7081616a",
		href: "https://linkedin.com/in/rodrigo-burdet-7081616a",
	},
	{ label: "cv", value: "Rodrigo_Burdet_CV.pdf", href: "/Rodrigo_Burdet_CV.pdf" },
];

export default function ContactPage() {
	return (
		<main className="max-w-3xl">
			<Prompt command="cat contact" className="mb-8" />
			<div className="space-y-2 text-sm">
				{LINKS.map((link) => (
					<p key={link.label}>
						<span className="inline-block w-24 text-zinc-500">{link.label}:</span>
						<a
							href={link.href}
							target={link.href.startsWith("http") ? "_blank" : undefined}
							rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
							className="text-term-cyan hover:underline"
						>
							{link.value}
						</a>
					</p>
				))}
			</div>
			<p className="mt-8 text-xs text-zinc-600">
				# fastest response via email — usually within a day
			</p>
		</main>
	);
}

