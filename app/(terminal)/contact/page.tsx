"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkedinIcon as LinkedIn } from "lucide-react"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log({ name, email, message })
    setSubmitted(true)
    // Reset form
    setName("")
    setEmail("")
    setMessage("")
  }

  return (
    <div className="container px-4 py-16 md:py-24">
      <h1 className="text-4xl font-mono tracking-tight md:text-5xl mb-8">Contact Me</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Send me a message</CardTitle>
            <CardDescription>I'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <p className="text-green-600">Thank you for your message. I'll respond shortly!</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <Button type="submit">Send Message</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Connect with me</CardTitle>
            <CardDescription>Find me on professional networks.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="https://linkedin.com/in/rodrigo-burdet-7081616a" target="_blank" rel="noopener noreferrer">
                <LinkedIn className="w-5 h-5 mr-2" />
                LinkedIn Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

