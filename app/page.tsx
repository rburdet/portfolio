import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectGrid from "@/components/project-grid";
import { projects } from "@/lib/projects";

export default function Home() {
	return (
		<main className="min-h-screen bg-background">
			<div className="container px-4 py-16 md:py-24">
				<div className="mb-16 md:mb-24">
					<div className="flex items-center gap-4 mb-6">
						<div className="grid w-12 h-12 bg-primary place-items-center">
							<span className="text-2xl font-mono text-primary-foreground">
								RB
							</span>
						</div>
						<h1 className="text-4xl font-mono tracking-tight md:text-5xl">
							Rodrigo Burdet
						</h1>
					</div>
					<p className="text-xl font-mono text-muted-foreground md:text-2xl">
						Software Engineer. Problem Solver. Builder.
					</p>
				</div>

				<nav className="grid gap-4 mb-16 md:mb-24 sm:grid-cols-4">
					<Button variant="outline" className="w-full" asChild>
						<Link href="/about">ABOUT</Link>
					</Button>
					<Button variant="outline" className="w-full" asChild>
						<Link href="/projects">PROJECTS</Link>
					</Button>
					<Button variant="outline" className="w-full" asChild>
						<Link href="https://github.com/rburdet" target="_blank">
							<Github className="w-4 h-4 mr-2" />
							GITHUB
						</Link>
					</Button>
					<Button variant="outline" className="w-full" asChild>
						<Link href="/contact">CONTACT</Link>
					</Button>
				</nav>

				<section className="mb-16 md:mb-24">
					<h2 className="mb-8 text-2xl font-mono">Projects</h2>
					<ProjectGrid projects={projects} />
				</section>
			</div>
		</main>
	);
}
