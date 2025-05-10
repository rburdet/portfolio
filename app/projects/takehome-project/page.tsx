"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TakeHomeProjectPage() {
  return (
    <div className="container px-4 py-16 md:py-24">
      <Link href="/projects" className="text-muted-foreground hover:text-foreground mb-8 inline-block">
        ← Back to all projects
      </Link>
      <h1 className="text-4xl font-mono tracking-tight md:text-5xl mb-8">Future Take Home Project</h1>

      <div className="grid gap-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A technical assessment project for a job application.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
} 