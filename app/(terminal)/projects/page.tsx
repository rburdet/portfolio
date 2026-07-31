import ProjectGrid from "@/components/project-grid"
import { projects } from "@/lib/projects"

export default function ProjectsPage() {
  return (
    <div className="container px-4 py-16 md:py-24">
      <h1 className="text-4xl font-mono tracking-tight md:text-5xl mb-8">My Projects</h1>

      <ProjectGrid projects={projects} />
    </div>
  )
}

