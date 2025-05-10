"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConstellationPage() {
  return (
    <div className="container px-4 py-16 md:py-24">
      <Link href="/projects" className="text-muted-foreground hover:text-foreground mb-8 inline-block">
        ← Back to all projects
      </Link>
      <h1 className="text-4xl font-mono tracking-tight md:text-5xl mb-8">Constellation Project</h1>

      <div className="grid gap-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Development in Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interactive star visualization and constellation mapping tool.
                Currently under development.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
} 