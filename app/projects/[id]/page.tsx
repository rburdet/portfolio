"use client"
export const runtime = 'edge';

import { useParams } from "next/navigation"
import Link from "next/link"
import { projects } from "@/lib/projects"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProjectPage() {
  const { id } = useParams()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div className="container px-4 py-16 md:py-24">
      <Link href="/projects" className="text-muted-foreground hover:text-foreground mb-8 inline-block">
        ← Back to all projects
      </Link>
      <h1 className="text-4xl font-mono tracking-tight md:text-5xl mb-8">{project.title}</h1>

      <div className="grid gap-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{project.longDescription}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Code Snippet</CardTitle>
              <CardDescription>A key part of the project's implementation</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md overflow-x-auto">
                <code>{project.codeSnippet}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {project.demoLinks && project.demoLinks.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="font-mono">Live Demos</CardTitle>
                <CardDescription>Interactive examples of this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {project.demoLinks.map((demo, index) => (
                    <Link
                      key={index}
                      href={`/projects/${demo.path}`}
                      className="text-primary hover:text-primary/80 underline underline-offset-4"
                    >
                      {demo.title}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  )
}

