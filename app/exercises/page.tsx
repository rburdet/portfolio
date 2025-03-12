export const runtime = 'edge';

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import problems from "@/lib/leetcode-problems.json"

export default function ExercisesPage() {
  return (
    <div className="container px-4 py-16 md:py-24">
      <h1 className="text-4xl font-mono tracking-tight md:text-5xl mb-8">Coding Exercises</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {problems.map((problem) => (
          <Card key={problem.questionId}>
            <CardHeader>
              <CardTitle className="font-mono">
                <Link href={`/exercises/${problem.titleSlug}`} className="hover:underline">
                  {problem.questionFrontendId}. {problem.questionTitle}
                </Link>
              </CardTitle>
              <CardDescription>Difficulty: {problem.difficulty}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-2">
                {problem.topicTags.map((tag) => (
                  <Badge key={tag.slug} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <Link
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                View on LeetCode
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

