import Prompt from "@/components/terminal/prompt";
import Typing from "@/components/terminal/typing";
import ProjectGrid from "@/components/project-grid";
import { projects } from "@/lib/projects";

export default function Home() {
	return (
		<main>
			<section className="mb-12 md:mb-16">
				<Prompt command="whoami" className="mb-4" />
				<h1 className="mb-3 text-3xl tracking-tight text-zinc-100 md:text-5xl">
					<Typing text="Rodrigo Burdet" />
				</h1>
				<p className="text-sm text-zinc-400 md:text-base">
					Software Engineer. Problem Solver. Builder.
				</p>
				<div className="mt-4 space-y-1 text-xs text-zinc-500 md:text-sm">
					<p>
						<span className="text-zinc-400">location:</span> Buenos Aires, Argentina
					</p>
					<p>
						<span className="text-zinc-400">github:</span>{" "}
						<a
							href="https://github.com/rburdet"
							target="_blank"
							rel="noopener noreferrer"
							className="text-term-cyan hover:underline"
						>
							github.com/rburdet
						</a>
					</p>
				</div>
			</section>

			<section>
				<Prompt command="ls projects/" className="mb-6" />
				<ProjectGrid projects={projects} />
			</section>
		</main>
	);
}
