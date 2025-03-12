"use client"
export const runtime = 'edge';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Autocomplete from "../[id]/autocomplete/components/Autocomplete"

export default function AutocompletePage() {
  return (
    <div className="container px-4 py-16 md:py-24">
      <Link href="/projects" className="text-muted-foreground hover:text-foreground mb-8 inline-block">
        ← Back to all projects
      </Link>
      <h1 className="text-4xl font-mono tracking-tight md:text-5xl mb-8">Autocomplete Project</h1>

      <div className="grid gap-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Autocomplete Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <Autocomplete />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
