import Link from "next/link"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProjectGrid from "@/components/project-grid"
import { projects } from "@/lib/projects"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 py-16 md:py-24">
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-6">
            <div className="grid w-12 h-12 bg-primary place-items-center">
              <span className="text-2xl font-mono text-primary-foreground">RB</span>
            </div>
            <h1 className="text-4xl font-mono tracking-tight md:text-5xl">Rodrigo Burdet</h1>
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
          <h2 className="mb-8 text-2xl font-mono">Featured Work</h2>
          <ProjectGrid projects={projects.slice(0, 6)} />
        </section>

        <section className="grid gap-8 mb-16 md:mb-24 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-xl font-mono">Coding Exercises</h3>
            <p className="text-muted-foreground">
              Solutions to algorithmic challenges and data structure problems from LeetCode.
            </p>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/exercises">VIEW EXERCISES</Link>
            </Button>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-mono">Personal Projects</h3>
            <p className="text-muted-foreground">
              Side projects and experiments exploring new technologies and solving real-world problems.
            </p>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/projects">VIEW ALL PROJECTS</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}

