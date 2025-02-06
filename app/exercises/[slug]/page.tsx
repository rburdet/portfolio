import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import problems from "@/lib/leetcode-problems.json"

export default function ProblemPage({ params }: { params: { slug: string } }) {
  const problem = problems.find((p) => p.titleSlug === params.slug)

  if (!problem) {
    notFound()
  }

  return (
    <div className="container px-4 py-16 md:py-24">
      <Link href="/exercises" className="text-muted-foreground hover:text-foreground mb-8 inline-block">
        ← Back to exercises
      </Link>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-mono text-3xl">
            {problem.questionFrontendId}. {problem.questionTitle}
          </CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mr-2">
              Difficulty: {problem.difficulty}
            </Badge>
            <Link
              href={problem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View on LeetCode
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {problem.topicTags.map((tag) => (
              <Badge key={tag.slug} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-mono">Problem Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            dangerouslySetInnerHTML={{ __html: problem.question }}
            className="prose dark:prose-invert max-w-none mb-6"
          />
          {problem.hints && problem.hints.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mb-2 mt-6">Hints:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {problem.hints.map((hint, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: hint }} />
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

