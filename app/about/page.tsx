import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MapPin, Calendar, ExternalLink } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 py-16 md:py-24">
        <div className="mb-8">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <div className="mb-16">
          <h1 className="mb-6 text-4xl font-mono tracking-tight md:text-5xl">About Me</h1>
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <p className="text-xl text-muted-foreground">
                Built lots of products in top notch companies in Latam (Mercadolibre, Rappi) and US (Ring, Indeed). Also
                built a real state platform for renting www.resider.com. Looking to keep building amazing products,
                making life easier and more convenient for my users!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <a href="/Rodrigo_Burdet_CV.pdf" download>
                    Download CV
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:rodrigoburdet@gmail.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Me
                  </a>
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Buenos Aires, Argentina</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href="mailto:rodrigoburdet@gmail.com" className="hover:underline">
                      rodrigoburdet@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Last updated: July 3, 2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-mono">Experience</h2>
          <div className="space-y-8">
            <ExperienceCard
              title="Full stack engineer"
              company="Ring"
              period="2022-2025"
              location="Remote"
              responsibilities={[
                "Built a web application to setup and monitor a subscription plan. From the design doc to thousands of users. Implementation of security and accessibility best practices.",
                "Worked alongside the product team to improve the onboarding experience at the company, which consisted in a long and cumbersome experience to a one click experience, increasing our correct signups by 60%, and from 1 minute to 10 seconds.",
              ]}
            />

            <ExperienceCard
              title="Full stack engineer"
              company="Indeed"
              period="2020-2022"
              location="Remote"
              responsibilities={[
                "Built an internal tool for data analytics, consuming internal data with a custom UI that satisfied the company's need. We ingested 100GB of data daily that needed to be available for reports and business intelligence.",
              ]}
            />

            <ExperienceCard
              title="Full stack engineer"
              company="Rappi"
              period="2018-2020"
              location="Argentina"
              responsibilities={[
                "We first built some ETLs processes to have our data indexed in an advertising platform, once we started creating revenue we built our own platform. Built the whole system to provision and show ads in less than 50ms.",
                "Developed a new product catalog to have consistency across the board. Rappi's Catalog consisted in millions of products that needed a single source of truth.",
              ]}
            />
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-mono">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {["Typescript", "Javascript", "React", "NodeJS", "NextJS", "AWS"].map((skill) => (
              <Badge key={skill} variant="secondary" className="text-base py-1.5 px-3">
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-mono">Projects</h2>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono">resider.com</CardTitle>
                <Badge>2019</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p>Built a real state platform to rent your ideal condo in Chicago</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://resider.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-mono">Education</h2>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono">University of Buenos Aires, Argentina</CardTitle>
                <Badge>2010-2018</Badge>
              </div>
              <CardDescription>Software Engineering</CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div>
    </main>
  )
}

interface ExperienceCardProps {
  title: string
  company: string
  period: string
  location: string
  responsibilities: string[]
}

function ExperienceCard({ title, company, period, location, responsibilities }: ExperienceCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-mono">
              {title} at {company}
            </CardTitle>
            <CardDescription>{location}</CardDescription>
          </div>
          <Badge>{period}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc list-inside">
          {responsibilities.map((responsibility, index) => (
            <li key={index}>{responsibility}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

