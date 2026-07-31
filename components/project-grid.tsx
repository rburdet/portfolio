import Link from "next/link";
import type { Project } from "@/lib/projects";

interface ProjectGridProps {
	projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{projects.map((project) => {
				const isCode = project.status === "code";
				const href = isCode
					? project.repoUrl
					: project.externalUrl || `/projects/${project.id}`;
				const isExternal = !!project.externalUrl || (isCode && !!project.repoUrl);

				const title = (
					<span className="text-sm">
						{isCode ? (
							<span className="text-zinc-300">{project.id}</span>
						) : (
							<span className="text-term-cyan">{`${project.id}/`}</span>
						)}
					</span>
				);

				return (
					<div
						key={project.id}
						className="group rounded border border-term-border bg-term-surface p-4 transition-colors hover:border-zinc-600"
					>
						<div className="mb-2 flex items-baseline justify-between gap-2">
							{href ? (
								<Link
									href={href}
									className="hover:underline"
									target={isExternal ? "_blank" : undefined}
									rel={isExternal ? "noopener noreferrer" : undefined}
								>
									{title}
								</Link>
							) : (
								title
							)}
							{isCode && <span className="text-[10px] text-zinc-600"># source-only</span>}
						</div>
						<p className="mb-3 text-xs leading-relaxed text-zinc-400">
							{project.description}
						</p>
						<div className="flex flex-wrap gap-x-2 gap-y-1">
							{project.technologies.map((tech) => (
								<span key={tech} className="text-[10px] text-zinc-500">
									[{tech.toLowerCase()}]
								</span>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
