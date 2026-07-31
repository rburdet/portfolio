import Link from "next/link";

export default function TerminalLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
			<div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col rounded-lg border border-term-border bg-background shadow-2xl">
				<header className="flex items-center gap-3 border-b border-term-border px-4 py-3">
					<div className="flex gap-1.5" aria-hidden>
						<span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
						<span className="h-3 w-3 rounded-full bg-[#febc2e]" />
						<span className="h-3 w-3 rounded-full bg-[#28c840]" />
					</div>
					<Link
						href="/"
						className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
					>
						rodrigo@rburdet.com:~
					</Link>
					<nav className="ml-auto flex gap-4 text-xs">
						<Link href="/about" className="text-zinc-400 transition-colors hover:text-term-cyan">
							about
						</Link>
						<Link href="/projects" className="text-zinc-400 transition-colors hover:text-term-cyan">
							projects
						</Link>
						<Link href="/contact" className="text-zinc-400 transition-colors hover:text-term-cyan">
							contact
						</Link>
					</nav>
				</header>
				<div className="flex-1 px-4 py-8 pb-24 md:px-8">{children}</div>
			</div>
		</div>
	);
}
