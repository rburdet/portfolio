import Link from "next/link";
import Prompt from "@/components/terminal/prompt";
import { projects } from "@/lib/projects";

export default function ProjectsPage() {
	return (
		<main>
			<Prompt command="ls -la projects/" className="mb-6" />
			<p className="mb-4 text-xs text-zinc-500">total {projects.length}</p>
			<div className="space-y-1 overflow-x-auto">
				{projects.map((project) => {
					const isCode = project.status === "code";
					const href = isCode
						? project.repoUrl
						: project.externalUrl || `/projects/${project.id}`;
					const isExternal =
						!!project.externalUrl || (isCode && !!project.repoUrl);

					const name = isCode ? (
						<span className="text-zinc-300">{project.id}</span>
					) : (
						<span className="text-term-cyan">{project.id}/</span>
					);

					return (
						<div
							key={project.id}
							className="flex flex-col gap-0.5 rounded px-2 py-1.5 text-xs hover:bg-term-surface sm:flex-row sm:items-baseline sm:gap-3"
						>
							<span className="shrink-0 text-zinc-600">
								{isCode ? "-rw-r--r--" : "drwxr-xr-x"} rodrigo
							</span>
							<span className="w-40 shrink-0">
								{href ? (
									<Link
										href={href}
										className="hover:underline"
										target={isExternal ? "_blank" : undefined}
										rel={isExternal ? "noopener noreferrer" : undefined}
									>
										{name}
									</Link>
								) : (
									name
								)}
							</span>
							<span className="text-zinc-500"># {project.description}</span>
						</div>
					);
				})}
			</div>
		</main>
	);
}

