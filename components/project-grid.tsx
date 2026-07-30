import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/projects";

interface ProjectGridProps {
	projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<div className="grid gap-6 sm:grid-cols-2">
			{projects.map((project) => {
				const isCode = project.status === "code";
				const href = isCode
					? project.repoUrl
					: project.externalUrl || `/projects/${project.id}`;
				const isExternal = !!project.externalUrl || (isCode && !!project.repoUrl);

				return (
					<Card key={project.id} className="flex flex-col">
						<CardHeader>
							<CardTitle className="font-mono">
								{href ? (
									<Link
										href={href}
										className="hover:underline inline-flex items-center gap-2"
										target={isExternal ? "_blank" : undefined}
										rel={isExternal ? "noopener noreferrer" : undefined}
									>
										{project.title}
										{isExternal && <ExternalLink className="w-4 h-4" />}
									</Link>
								) : (
									project.title
								)}
							</CardTitle>
							<CardDescription>{project.description}</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col flex-1">
							<div className="flex flex-wrap gap-2 mb-4">
								{project.technologies.map((tech) => (
									<Badge key={tech} variant="secondary">
										{tech}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
