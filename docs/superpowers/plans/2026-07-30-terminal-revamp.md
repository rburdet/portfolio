# Terminal Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skinear rburdet.com como terminal moderna (paleta zinc) con un chat AI real (`ask>`) respaldado por Workers AI.

**Architecture:** Route group `app/(terminal)/` con layout de marco de terminal para home/about/projects/contact; componentes terminal en `components/terminal/`; endpoint edge `POST /api/ask` con binding de Workers AI y rate limit en KV; `lib/ai-context.ts` genera el system prompt desde `lib/projects.ts`.

**Tech Stack:** Next.js 14 (App Router) + @cloudflare/next-on-pages, Tailwind, Workers AI (`@cf/meta/llama-3.1-8b-instruct`), Cloudflare KV.

**Spec:** `docs/superpowers/specs/2026-07-30-terminal-revamp-design.md`

## Global Constraints

- **Pre-requisito (una sola vez, antes de Task 1):** el repo tiene WIP sin commitear que TOCA archivos de este plan (`app/page.tsx`, `tailwind.config.ts`, `wrangler.jsonc`, etc.). Commitear TODO el WIP primero: `git add -A ':!.superpowers' && git commit -m "WIP: workout tracker + workers experiments"`. Rodrigo ya lo aprobó. Después de eso, cada task commitea solo sus archivos.
- Paleta (valores exactos): fondo `#09090b`, superficie `#111113`, borde `#27272a`, texto `zinc-100/400/500`, verde `#34d399`, celeste `#7dd3fc`, rojo stderr `#f87171`.
- Tipografía: JetBrains Mono vía `next/font/google` en todo el body.
- Dark permanente: `className="dark"` en `<html>`; no hay toggle.
- NO tocar: `app/exercises/`, `app/projects/tictactoe/`, `app/projects/[id]/`, `app/projects/autocomplete|constellation|gym-routine|takehome-project/`, `app/api/workout/`, `workers/`, `public/sw.js`. Esas rutas deben seguir respondiendo 200.
- Reglas de link de cards (ya existentes, conservar): `status: "code"` sin `repoUrl` → título sin link; `code` con `repoUrl` → link al repo; resto → `externalUrl` o fallback interno `/projects/<id>`.
- Sin framework de tests (no agregar vitest/jest); verificación = `npm run build` + curl + screenshots.
- Modelo AI: `@cf/meta/llama-3.1-8b-instruct`. Rate limit: 20/día/IP, KV `ASK_RATELIMIT`, TTL 86400.
- Textos del sitio en inglés.

---

### Task 1: Fundación del tema (fuente, paleta zinc, dark permanente)

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (bloque `body` y variables `.dark`)
- Modify: `tailwind.config.ts` (agregar colores `term` en `theme.extend.colors`)

**Interfaces:**
- Produces: clases Tailwind `text-term-green`, `text-term-cyan`, `text-term-red`, `bg-term-green`, `animate-blink`; fuente mono global; html en dark. Tasks 2–6 las usan.

- [ ] **Step 1: Reescribir `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Rodrigo Burdet | Portfolio',
  description: 'Personal portfolio of Rodrigo Burdet, Software Engineer and Problem Solver',
  generator: 'v0.dev',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${jetbrainsMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body className="font-mono">
        {children}
        <Script
          id="register-service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(error) {
                      console.log('Service Worker registration failed: ', error);
                    }
                  );
                });
              }
            `,
          }}
        />
        <Script src="/pwa-status.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Actualizar `app/globals.css`**

Reemplazar el bloque `body { font-family: Arial... }` por:

```css
body {
  font-family: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

Reemplazar el bloque `.dark { ... }` COMPLETO por (valores zinc del spec, en HSL):

```css
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 240 5% 96%;
    --card: 240 6% 7%;
    --card-foreground: 240 5% 96%;
    --popover: 240 6% 7%;
    --popover-foreground: 240 5% 96%;
    --primary: 158 64% 52%;
    --primary-foreground: 240 10% 3.9%;
    --secondary: 240 4% 16%;
    --secondary-foreground: 240 5% 96%;
    --muted: 240 4% 16%;
    --muted-foreground: 240 5% 65%;
    --accent: 240 4% 16%;
    --accent-foreground: 240 5% 96%;
    --destructive: 0 91% 71%;
    --destructive-foreground: 240 10% 3.9%;
    --border: 240 4% 16%;
    --input: 240 4% 16%;
    --ring: 158 64% 52%;
    --chart-1: 158 64% 52%;
    --chart-2: 199 89% 74%;
    --chart-3: 0 91% 71%;
    --chart-4: 43 74% 66%;
    --chart-5: 240 5% 65%;
    --radius: 0.375rem;
  }
```

(Si el `.dark` actual tiene variables `--sidebar-*`, conservarlas tal cual al final del bloque.)

Al final del archivo agregar el keyframe del cursor:

```css
@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
```

- [ ] **Step 3: Agregar colores `term` y animación en `tailwind.config.ts`**

Dentro de `theme.extend.colors` (junto a `background`, `foreground`, etc.) agregar:

```ts
  			term: {
  				green: '#34d399',
  				cyan: '#7dd3fc',
  				red: '#f87171',
  				surface: '#111113',
  				border: '#27272a'
  			},
```

Dentro de `theme.extend` (al mismo nivel que `colors`) agregar:

```ts
  		animation: {
  			blink: 'blink 1s step-end infinite'
  		},
```

- [ ] **Step 4: Build y verificación visual**

```bash
cd /Users/rodrigoburdet/hobby/portfolio && npm run build
npm run dev > /tmp/dev.log 2>&1 & echo $! > /tmp/dev.pid
sleep 8
curl -s http://localhost:3000 | grep -c 'class="dark'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/exercises
kill "$(cat /tmp/dev.pid)"
```

Expected: build OK; `1` (html con clase dark); `200` en /exercises.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css tailwind.config.ts
git commit -m "feat: dark zinc terminal theme foundation (JetBrains Mono, permanent dark)"
```

---

### Task 2: Marco de terminal + route group `(terminal)`

**Files:**
- Create: `components/terminal/prompt.tsx`
- Create: `app/(terminal)/layout.tsx`
- Move (git mv): `app/page.tsx` → `app/(terminal)/page.tsx`; `app/about/page.tsx` → `app/(terminal)/about/page.tsx`; `app/contact/page.tsx` → `app/(terminal)/contact/page.tsx`; `app/projects/page.tsx` → `app/(terminal)/projects/page.tsx`

**Interfaces:**
- Consumes: clases `term` y tema de Task 1.
- Produces: `Prompt` (`{ command: string; className?: string }`) — heading `$ <command>`. El layout `(terminal)` que envuelve las 4 páginas. Task 6 lo modifica para montar `AskBar`.

- [ ] **Step 1: Crear `components/terminal/prompt.tsx`**

```tsx
interface PromptProps {
	command: string;
	className?: string;
}

export default function Prompt({ command, className = "" }: PromptProps) {
	return (
		<div className={`text-base md:text-lg ${className}`}>
			<span className="text-term-green">$</span>{" "}
			<span className="text-zinc-100">{command}</span>
		</div>
	);
}
```

- [ ] **Step 2: Crear `app/(terminal)/layout.tsx`**

```tsx
import Link from "next/link";

export default function TerminalLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
			<div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col rounded-lg border border-term-border bg-background shadow-2xl">
				<header className="flex items-center gap-3 border-b border-term-border px-4 py-3">
					<div className="flex gap-1.5" aria-hidden>
						<span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
						<span className="h-3 w-3 rounded-full bg-[#febc2e]" />
						<span className="h-3 w-3 rounded-full bg-[#28c840]" />
					</div>
					<Link
						href="/"
						className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
					>
						rodrigo@rburdet.com:~
					</Link>
					<nav className="ml-auto flex gap-4 text-xs">
						<Link href="/about" className="text-zinc-400 transition-colors hover:text-term-cyan">
							about
						</Link>
						<Link href="/projects" className="text-zinc-400 transition-colors hover:text-term-cyan">
							projects
						</Link>
						<Link href="/contact" className="text-zinc-400 transition-colors hover:text-term-cyan">
							contact
						</Link>
					</nav>
				</header>
				<div className="flex-1 px-4 py-8 pb-24 md:px-8">{children}</div>
			</div>
		</div>
	);
}
```

- [ ] **Step 3: Mover las 4 páginas al route group**

```bash
cd /Users/rodrigoburdet/hobby/portfolio
mkdir -p "app/(terminal)/about" "app/(terminal)/contact" "app/(terminal)/projects"
git mv app/page.tsx "app/(terminal)/page.tsx"
git mv app/about/page.tsx "app/(terminal)/about/page.tsx"
git mv app/contact/page.tsx "app/(terminal)/contact/page.tsx"
git mv app/projects/page.tsx "app/(terminal)/projects/page.tsx"
rmdir app/about app/contact
```

NO tocar `app/projects/` (quedan sus subdirectorios: tictactoe, [id], etc.).
En las páginas movidas, borrar los links "← Back to home" (la nav del marco los reemplaza) y los wrappers `<main className="min-h-screen bg-background">`/`container` redundantes solo si rompen el layout — el reskin completo llega en Tasks 3–4; en este task alcanza con que compile y renderice dentro del marco.

- [ ] **Step 4: Verificar rutas**

```bash
npm run build
npm run dev > /tmp/dev.log 2>&1 & echo $! > /tmp/dev.pid
sleep 8
for p in / /about /contact /projects /projects/tictactoe /exercises; do echo "$p: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)"; done
curl -s http://localhost:3000 | grep -c "rodrigo@rburdet.com"
kill "$(cat /tmp/dev.pid)"
```

Expected: todas 200; `1` (marco presente en home).

- [ ] **Step 5: Commit**

```bash
git add -A app components/terminal
git commit -m "feat: terminal frame layout and (terminal) route group"
```

(Acá `git add -A app` es seguro: el WIP ya quedó commiteado en el pre-requisito.)

---

### Task 3: Home reskin (`$ whoami` con typing + `$ ls projects/`)

**Files:**
- Create: `components/terminal/typing.tsx`
- Modify: `app/(terminal)/page.tsx` (reescritura completa)
- Modify: `components/project-grid.tsx` (reescritura completa)

**Interfaces:**
- Consumes: `Prompt` de Task 2; interfaz `Project` de `lib/projects.ts` (campos `id,title,description,technologies,externalUrl?,repoUrl?,status?`).
- Produces: `Typing` (`{ text: string; speed?: number }`).

- [ ] **Step 1: Crear `components/terminal/typing.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";

interface TypingProps {
	text: string;
	speed?: number;
}

export default function Typing({ text, speed = 55 }: TypingProps) {
	const [chars, setChars] = useState(0);

	useEffect(() => {
		if (chars >= text.length) return;
		const t = setTimeout(() => setChars((c) => c + 1), speed);
		return () => clearTimeout(t);
	}, [chars, text.length, speed]);

	return (
		<span aria-label={text}>
			<span aria-hidden>{text.slice(0, chars)}</span>
			<span
				aria-hidden
				className="ml-0.5 inline-block h-[1em] w-[0.55ch] translate-y-[0.1em] bg-term-green animate-blink"
			/>
		</span>
	);
}
```

- [ ] **Step 2: Reescribir `app/(terminal)/page.tsx`**

```tsx
import Prompt from "@/components/terminal/prompt";
import Typing from "@/components/terminal/typing";
import ProjectGrid from "@/components/project-grid";
import { projects } from "@/lib/projects";

export default function Home() {
	return (
		<main>
			<section className="mb-12 md:mb-16">
				<Prompt command="whoami" className="mb-4" />
				<h1 className="mb-3 text-3xl tracking-tight text-zinc-100 md:text-5xl">
					<Typing text="Rodrigo Burdet" />
				</h1>
				<p className="text-sm text-zinc-400 md:text-base">
					Software Engineer. Problem Solver. Builder.
				</p>
				<div className="mt-4 space-y-1 text-xs text-zinc-500 md:text-sm">
					<p>
						<span className="text-zinc-400">location:</span> Buenos Aires, Argentina
					</p>
					<p>
						<span className="text-zinc-400">github:</span>{" "}
						<a
							href="https://github.com/rburdet"
							target="_blank"
							rel="noopener noreferrer"
							className="text-term-cyan hover:underline"
						>
							github.com/rburdet
						</a>
					</p>
				</div>
			</section>

			<section>
				<Prompt command="ls projects/" className="mb-6" />
				<ProjectGrid projects={projects} />
			</section>
		</main>
	);
}
```

- [ ] **Step 3: Reescribir `components/project-grid.tsx`**

Conserva EXACTAMENTE las reglas de link actuales; cambia solo la piel:

```tsx
import Link from "next/link";
import type { Project } from "@/lib/projects";

interface ProjectGridProps {
	projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{projects.map((project) => {
				const isCode = project.status === "code";
				const href = isCode
					? project.repoUrl
					: project.externalUrl || `/projects/${project.id}`;
				const isExternal = !!project.externalUrl || (isCode && !!project.repoUrl);

				const title = (
					<span className="text-sm">
						{isCode ? (
							<span className="text-zinc-300">{project.id}</span>
						) : (
							<span className="text-term-cyan">{project.id}/</span>
						)}
					</span>
				);

				return (
					<div
						key={project.id}
						className="group rounded border border-term-border bg-term-surface p-4 transition-colors hover:border-zinc-600"
					>
						<div className="mb-2 flex items-baseline justify-between gap-2">
							{href ? (
								<Link
									href={href}
									className="hover:underline"
									target={isExternal ? "_blank" : undefined}
									rel={isExternal ? "noopener noreferrer" : undefined}
								>
									{title}
								</Link>
							) : (
								title
							)}
							{isCode && <span className="text-[10px] text-zinc-600"># source-only</span>}
						</div>
						<p className="mb-3 text-xs leading-relaxed text-zinc-400">
							{project.description}
						</p>
						<div className="flex flex-wrap gap-x-2 gap-y-1">
							{project.technologies.map((tech) => (
								<span key={tech} className="text-[10px] text-zinc-500">
									[{tech.toLowerCase()}]
								</span>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
```

Nota: el título de la card pasa a mostrar `project.id` (estilo directorio); `project.title` completo sigue en la descripción de la data — verificar que quede legible; si algún `id` es críptico, mantener la línea del título con `project.title` en zinc-300 debajo del id, a criterio del implementador PERO sin tocar `lib/projects.ts`.

- [ ] **Step 4: Verificar**

```bash
npm run build
npm run dev > /tmp/dev.log 2>&1 & echo $! > /tmp/dev.pid
sleep 8
curl -s http://localhost:3000 | grep -o "whoami\|ls projects/\|expensas/\|# source-only" | sort -u
kill "$(cat /tmp/dev.pid)"
```

Expected: aparecen `whoami`, `ls projects/`, `expensas/`, `# source-only`. Verificar a ojo (screenshot) el typing effect y el hover.

- [ ] **Step 5: Commit**

```bash
git add "app/(terminal)/page.tsx" components/terminal/typing.tsx components/project-grid.tsx
git commit -m "feat: terminal home with typing whoami and ls-style project grid"
```

---

### Task 4: About / Projects / Contact reskin

**Files:**
- Modify: `app/(terminal)/about/page.tsx` (reescritura completa)
- Modify: `app/(terminal)/projects/page.tsx` (reescritura completa)
- Modify: `app/(terminal)/contact/page.tsx` (reescritura completa)

**Interfaces:**
- Consumes: `Prompt` de Task 2; `projects` de `lib/projects.ts`.

- [ ] **Step 1: Reescribir `app/(terminal)/about/page.tsx`**

Conservar TODO el copy actual (bio, experiencia Ring/Indeed/Rappi, skills, resider.com, educación, link al CV). Formato `$ cat about.md`:

```tsx
import Prompt from "@/components/terminal/prompt";

const EXPERIENCE = [
	{
		role: "Full stack engineer",
		company: "Ring",
		period: "2022-2025",
		location: "Remote",
		items: [
			"Built a web application to setup and monitor a subscription plan. From the design doc to thousands of users. Implementation of security and accessibility best practices.",
			"Worked alongside the product team to improve the onboarding experience at the company, which consisted in a long and cumbersome experience to a one click experience, increasing our correct signups by 60%, and from 1 minute to 10 seconds.",
		],
	},
	{
		role: "Full stack engineer",
		company: "Indeed",
		period: "2020-2022",
		location: "Remote",
		items: [
			"Built an internal tool for data analytics, consuming internal data with a custom UI that satisfied the company's need. We ingested 100GB of data daily that needed to be available for reports and business intelligence.",
		],
	},
	{
		role: "Full stack engineer",
		company: "Rappi",
		period: "2018-2020",
		location: "Argentina",
		items: [
			"We first built some ETLs processes to have our data indexed in an advertising platform, once we started creating revenue we built our own platform. Built the whole system to provision and show ads in less than 50ms.",
			"Developed a new product catalog to have consistency across the board. Rappi's Catalog consisted in millions of products that needed a single source of truth.",
		],
	},
];

const SKILLS = ["Typescript", "Javascript", "React", "NodeJS", "NextJS", "AWS"];

export default function AboutPage() {
	return (
		<main className="max-w-3xl">
			<Prompt command="cat about.md" className="mb-8" />

			<section className="mb-10 text-sm leading-relaxed text-zinc-400">
				<h2 className="mb-3 text-lg text-zinc-100"># Rodrigo Burdet</h2>
				<p>
					Built lots of products in top notch companies in Latam (Mercadolibre,
					Rappi) and US (Ring, Indeed). Also built a real state platform for
					renting www.resider.com. Looking to keep building amazing products,
					making life easier and more convenient for my users!
				</p>
				<p className="mt-3 text-xs text-zinc-500">
					Buenos Aires, Argentina ·{" "}
					<a href="mailto:rodrigoburdet@gmail.com" className="text-term-cyan hover:underline">
						rodrigoburdet@gmail.com
					</a>{" "}
					·{" "}
					<a href="/Rodrigo_Burdet_CV.pdf" download className="text-term-cyan hover:underline">
						download CV ↓
					</a>
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-lg text-zinc-100">## Experience</h2>
				<div className="space-y-6">
					{EXPERIENCE.map((job) => (
						<div key={job.company} className="border-l border-term-border pl-4">
							<p className="text-sm text-zinc-100">
								{job.role} @ <span className="text-term-cyan">{job.company}</span>{" "}
								<span className="text-xs text-zinc-500">
									({job.period} · {job.location})
								</span>
							</p>
							<ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-zinc-400">
								{job.items.map((item, i) => (
									<li key={i}>- {item}</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-lg text-zinc-100">## Skills</h2>
				<p className="text-xs text-zinc-500">
					{SKILLS.map((s) => `[${s.toLowerCase()}]`).join(" ")}
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-lg text-zinc-100">## Side projects</h2>
				<div className="border-l border-term-border pl-4 text-sm">
					<a
						href="https://resider.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-term-cyan hover:underline"
					>
						resider.com
					</a>{" "}
					<span className="text-xs text-zinc-500">(2019)</span>
					<p className="mt-1 text-xs text-zinc-400">
						Built a real state platform to rent your ideal condo in Chicago
					</p>
				</div>
			</section>

			<section>
				<h2 className="mb-4 text-lg text-zinc-100">## Education</h2>
				<div className="border-l border-term-border pl-4 text-sm">
					<p className="text-zinc-100">
						University of Buenos Aires{" "}
						<span className="text-xs text-zinc-500">(2010-2018)</span>
					</p>
					<p className="mt-1 text-xs text-zinc-400">Software Engineering</p>
				</div>
			</section>
		</main>
	);
}
```

- [ ] **Step 2: Reescribir `app/(terminal)/projects/page.tsx`**

```tsx
import Link from "next/link";
import Prompt from "@/components/terminal/prompt";
import { projects } from "@/lib/projects";

export default function ProjectsPage() {
	return (
		<main>
			<Prompt command="ls -la projects/" className="mb-6" />
			<p className="mb-4 text-xs text-zinc-500">total {projects.length}</p>
			<div className="space-y-1 overflow-x-auto">
				{projects.map((project) => {
					const isCode = project.status === "code";
					const href = isCode
						? project.repoUrl
						: project.externalUrl || `/projects/${project.id}`;
					const isExternal =
						!!project.externalUrl || (isCode && !!project.repoUrl);

					const name = isCode ? (
						<span className="text-zinc-300">{project.id}</span>
					) : (
						<span className="text-term-cyan">{project.id}/</span>
					);

					return (
						<div
							key={project.id}
							className="flex flex-col gap-0.5 rounded px-2 py-1.5 text-xs hover:bg-term-surface sm:flex-row sm:items-baseline sm:gap-3"
						>
							<span className="shrink-0 text-zinc-600">
								{isCode ? "-rw-r--r--" : "drwxr-xr-x"} rodrigo
							</span>
							<span className="w-40 shrink-0">
								{href ? (
									<Link
										href={href}
										className="hover:underline"
										target={isExternal ? "_blank" : undefined}
										rel={isExternal ? "noopener noreferrer" : undefined}
									>
										{name}
									</Link>
								) : (
									name
								)}
							</span>
							<span className="text-zinc-500"># {project.description}</span>
						</div>
					);
				})}
			</div>
		</main>
	);
}
```

- [ ] **Step 3: Reescribir `app/(terminal)/contact/page.tsx`**

El form actual no manda nada (hace `console.log`) — se elimina (YAGNI). Salida de `cat contact`:

```tsx
import Prompt from "@/components/terminal/prompt";

const LINKS = [
	{ label: "email", value: "rodrigoburdet@gmail.com", href: "mailto:rodrigoburdet@gmail.com" },
	{ label: "github", value: "github.com/rburdet", href: "https://github.com/rburdet" },
	{
		label: "linkedin",
		value: "linkedin.com/in/rodrigo-burdet-7081616a",
		href: "https://linkedin.com/in/rodrigo-burdet-7081616a",
	},
	{ label: "cv", value: "Rodrigo_Burdet_CV.pdf", href: "/Rodrigo_Burdet_CV.pdf" },
];

export default function ContactPage() {
	return (
		<main className="max-w-3xl">
			<Prompt command="cat contact" className="mb-8" />
			<div className="space-y-2 text-sm">
				{LINKS.map((link) => (
					<p key={link.label}>
						<span className="inline-block w-24 text-zinc-500">{link.label}:</span>
						<a
							href={link.href}
							target={link.href.startsWith("http") ? "_blank" : undefined}
							rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
							className="text-term-cyan hover:underline"
						>
							{link.value}
						</a>
					</p>
				))}
			</div>
			<p className="mt-8 text-xs text-zinc-600">
				# fastest response via email — usually within a day
			</p>
		</main>
	);
}
```

- [ ] **Step 4: Verificar**

```bash
npm run build
npm run dev > /tmp/dev.log 2>&1 & echo $! > /tmp/dev.pid
sleep 8
curl -s http://localhost:3000/about | grep -c "cat about.md"
curl -s http://localhost:3000/projects | grep -c "ls -la projects/"
curl -s http://localhost:3000/contact | grep -c "cat contact"
kill "$(cat /tmp/dev.pid)"
```

Expected: `1` en cada una.

- [ ] **Step 5: Commit**

```bash
git add "app/(terminal)/about/page.tsx" "app/(terminal)/projects/page.tsx" "app/(terminal)/contact/page.tsx"
git commit -m "feat: terminal skin for about, projects and contact pages"
```

---

### Task 5: Backend del chat (`POST /api/ask` con Workers AI + KV rate limit)

**Files:**
- Create: `lib/ai-context.ts`
- Create: `app/api/ask/route.ts`
- Modify: `wrangler.jsonc` (binding `ai` + KV `ASK_RATELIMIT`)

**Interfaces:**
- Consumes: `projects` de `lib/projects.ts`.
- Produces: `buildSystemPrompt(): string`; endpoint `POST /api/ask` con body `{ question: string, history: Array<{role:"user"|"assistant", content:string}> }` → 200 con SSE (`data: {"response":"…"}` líneas, termina con `data: [DONE]`), 400 `{error:"bad_request"}`, 429 `{error:"rate_limit"}`, 502 `{error:"model_unavailable"}`. Task 6 (AskBar) consume este contrato.

- [ ] **Step 1: Crear el KV namespace**

```bash
cd /Users/rodrigoburdet/hobby/portfolio && npx wrangler kv namespace create ASK_RATELIMIT
```

Expected: imprime un `id` — copiarlo para el Step 2.

- [ ] **Step 2: Actualizar `wrangler.jsonc`**

Agregar al objeto raíz (junto a `kv_namespaces` existente) el binding de AI, y el namespace nuevo al array `kv_namespaces` (conservar el de WORKOUT_DATA y cualquier otro binding que el WIP haya agregado):

```jsonc
  "ai": {
    "binding": "AI"
  },
```

y dentro de `kv_namespaces`:

```jsonc
    {
      "binding": "ASK_RATELIMIT",
      "id": "<ID-DEL-STEP-1>"
    }
```

(`<ID-DEL-STEP-1>` se reemplaza por el id real impreso en Step 1 — es el único valor no literal de este plan.)

- [ ] **Step 3: Crear `lib/ai-context.ts`**

```ts
import { projects } from "./projects";

const BIO = `Rodrigo Burdet is a software engineer based in Buenos Aires, Argentina.
He has built products at top companies in Latam (Mercadolibre, Rappi) and the US (Ring, Indeed), and built resider.com, a real estate rental platform for Chicago.
Experience: Full stack engineer at Ring (2022-2025, remote): subscription management web app, onboarding revamp that increased correct signups by 60%. Full stack engineer at Indeed (2020-2022, remote): internal data analytics tool ingesting 100GB daily. Full stack engineer at Rappi (2018-2020, Argentina): ads platform serving ads in under 50ms, product catalog with millions of products.
Education: Software Engineering, University of Buenos Aires (2010-2018).
Skills: TypeScript, JavaScript, React, NodeJS, NextJS, AWS, Cloudflare Workers, Python.
Contact: rodrigoburdet@gmail.com · github.com/rburdet · linkedin.com/in/rodrigo-burdet-7081616a`;

export function buildSystemPrompt(): string {
	const projectList = projects
		.map((p) => {
			const live = p.externalUrl ? ` Live at ${p.externalUrl}.` : "";
			const repo = p.repoUrl ? ` Source: ${p.repoUrl}.` : "";
			return `- ${p.title}: ${p.description}. Tech: ${p.technologies.join(", ")}.${live}${repo}`;
		})
		.join("\n");

	return `You are the AI assistant embedded in Rodrigo Burdet's portfolio site, which looks like a terminal.
Answer ONLY questions about Rodrigo, his projects, skills, experience and how to contact him.
If asked about anything else, reply briefly that you only answer questions about Rodrigo and his work.
Answer in the same language as the question. Keep answers under 120 words. Plain text only, no markdown.

## Bio
${BIO}

## Projects
${projectList}`;
}
```

- [ ] **Step 4: Crear `app/api/ask/route.ts`**

```ts
import { getRequestContext } from "@cloudflare/next-on-pages";
import { buildSystemPrompt } from "@/lib/ai-context";

export const runtime = "edge";

const DAILY_LIMIT = 20;
const MODEL = "@cf/meta/llama-3.1-8b-instruct";

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

interface AskEnv {
	AI: {
		run(
			model: string,
			options: Record<string, unknown>,
		): Promise<ReadableStream>;
	};
	ASK_RATELIMIT: {
		get(key: string): Promise<string | null>;
		put(
			key: string,
			value: string,
			options?: { expirationTtl?: number },
		): Promise<void>;
	};
}

function json(body: unknown, status: number) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

export async function POST(request: Request) {
	let body: { question?: unknown; history?: unknown };
	try {
		body = await request.json();
	} catch {
		return json({ error: "bad_request" }, 400);
	}

	const question =
		typeof body.question === "string" ? body.question.trim() : "";
	const rawHistory = Array.isArray(body.history) ? body.history : [];
	if (!question || question.length > 500 || rawHistory.length > 6) {
		return json({ error: "bad_request" }, 400);
	}

	const history: ChatMessage[] = rawHistory
		.filter(
			(m): m is ChatMessage =>
				!!m &&
				typeof m === "object" &&
				((m as ChatMessage).role === "user" ||
					(m as ChatMessage).role === "assistant") &&
				typeof (m as ChatMessage).content === "string",
		)
		.map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

	const env = getRequestContext().env as unknown as AskEnv;

	const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
	const day = new Date().toISOString().slice(0, 10);
	const key = `ask:${ip}:${day}`;
	const count = parseInt((await env.ASK_RATELIMIT.get(key)) ?? "0", 10);
	if (count >= DAILY_LIMIT) {
		return json({ error: "rate_limit" }, 429);
	}
	await env.ASK_RATELIMIT.put(key, String(count + 1), {
		expirationTtl: 60 * 60 * 24,
	});

	const messages = [
		{ role: "system", content: buildSystemPrompt() },
		...history,
		{ role: "user", content: question },
	];

	try {
		const stream = await env.AI.run(MODEL, {
			messages,
			stream: true,
			max_tokens: 512,
		});
		return new Response(stream, {
			headers: {
				"content-type": "text/event-stream",
				"cache-control": "no-cache",
			},
		});
	} catch {
		return json({ error: "model_unavailable" }, 502);
	}
}
```

- [ ] **Step 5: Verificar con preview local (bindings reales)**

```bash
npm run preview > /tmp/preview.log 2>&1 & echo $! > /tmp/preview.pid
sleep 25
grep -o "http://.*:8788" /tmp/preview.log | head -1   # confirmar puerto
curl -s -X POST http://localhost:8788/api/ask -H 'content-type: application/json' -d '{"question":"what did rodrigo build with AI?","history":[]}' | head -c 400
echo
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:8788/api/ask -H 'content-type: application/json' -d '{"question":""}'
kill "$(cat /tmp/preview.pid)"
```

Expected: primera respuesta con líneas `data: {...}` mencionando algo de los proyectos (Workers AI local proxya al servicio real — requiere la sesión de wrangler ya logueada); segunda `400`. Si el binding AI falla localmente por auth, anotarlo y diferir la verificación al deploy (Task 7 la repite en prod).

- [ ] **Step 6: Commit**

```bash
git add lib/ai-context.ts app/api/ask/route.ts wrangler.jsonc
git commit -m "feat: /api/ask endpoint with Workers AI and KV rate limiting"
```

---

### Task 6: AskBar (UI del chat con streaming)

**Files:**
- Create: `components/terminal/ask-bar.tsx`
- Modify: `app/(terminal)/layout.tsx` (montar AskBar)

**Interfaces:**
- Consumes: contrato de `POST /api/ask` de Task 5 (SSE `data: {"response":"…"}`, errores 429/502/400).

- [ ] **Step 1: Crear `components/terminal/ask-bar.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

type TranscriptEntry = ChatMessage | { role: "error"; content: string };

export default function AskBar() {
	const [input, setInput] = useState("");
	const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
	const [busy, setBusy] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		requestAnimationFrame(() => {
			panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight });
		});
	};

	async function ask(question: string) {
		setBusy(true);
		const history = transcript
			.filter((m): m is ChatMessage => m.role !== "error")
			.slice(-6);
		setTranscript((t) => [...t, { role: "user", content: question }]);
		scrollToBottom();

		try {
			const res = await fetch("/api/ask", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ question, history }),
			});

			if (res.status === 429) {
				setTranscript((t) => [
					...t,
					{ role: "error", content: "rate limit exceeded — try tomorrow" },
				]);
				return;
			}
			if (!res.ok || !res.body) {
				setTranscript((t) => [
					...t,
					{ role: "error", content: "error: model unavailable" },
				]);
				return;
			}

			setTranscript((t) => [...t, { role: "assistant", content: "" }]);
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";
				for (const line of lines) {
					if (!line.startsWith("data: ")) continue;
					const payload = line.slice(6).trim();
					if (payload === "[DONE]") continue;
					try {
						const parsed = JSON.parse(payload) as { response?: string };
						if (parsed.response) {
							setTranscript((t) => {
								const next = [...t];
								const last = next[next.length - 1];
								if (last?.role === "assistant") {
									next[next.length - 1] = {
										role: "assistant",
										content: last.content + parsed.response,
									};
								}
								return next;
							});
							scrollToBottom();
						}
					} catch {
						// línea SSE parcial/no-JSON: ignorar
					}
				}
			}
		} catch {
			setTranscript((t) => [
				...t,
				{ role: "error", content: "error: model unavailable" },
			]);
		} finally {
			setBusy(false);
			scrollToBottom();
		}
	}

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		const q = input.trim();
		if (!q || busy) return;
		setInput("");
		void ask(q);
	}

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
			<div className="mx-auto max-w-4xl px-2 pb-2 sm:px-4 md:px-6">
				{transcript.length > 0 && (
					<div
						ref={panelRef}
						className="pointer-events-auto mb-1 max-h-[50vh] overflow-y-auto rounded-t border border-b-0 border-term-border bg-term-surface/95 p-3 text-xs backdrop-blur"
					>
						{transcript.map((entry, i) => (
							<p
								key={i}
								className={
									entry.role === "user"
										? "mt-2 text-zinc-100 first:mt-0"
										: entry.role === "error"
											? "mt-1 text-term-red"
											: "mt-1 whitespace-pre-wrap text-zinc-400"
								}
							>
								{entry.role === "user" ? (
									<>
										<span className="text-term-green">ask&gt;</span>{" "}
										{entry.content}
									</>
								) : (
									entry.content
								)}
							</p>
						))}
						{busy && <p className="mt-1 animate-pulse text-zinc-600">…</p>}
					</div>
				)}
				<form
					onSubmit={onSubmit}
					className="pointer-events-auto flex items-center gap-2 rounded border border-term-border bg-term-surface px-3 py-2"
				>
					<span className="text-sm text-term-green">ask&gt;</span>
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="anything about me or my projects — powered by Workers AI"
						maxLength={500}
						disabled={busy}
						aria-label="Ask the AI about Rodrigo"
						className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
					/>
				</form>
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Montar en `app/(terminal)/layout.tsx`**

Agregar el import y renderizarlo después del `<div className="flex-1 …">{children}</div>`, dentro del wrapper exterior:

```tsx
import AskBar from "@/components/terminal/ask-bar";
```

```tsx
				<div className="flex-1 px-4 py-8 pb-24 md:px-8">{children}</div>
			</div>
			<AskBar />
		</div>
	);
```

- [ ] **Step 3: Verificar end-to-end en preview**

```bash
npm run preview > /tmp/preview.log 2>&1 & echo $! > /tmp/preview.pid
sleep 25
curl -s http://localhost:8788 | grep -c "ask&gt;\|ask>"
kill "$(cat /tmp/preview.pid)"
```

Expected: ≥1 (ask bar presente en el HTML). Prueba manual del chat (pregunta + streaming + respuesta) a ojo en el navegador durante el preview, o diferida al smoke de Task 7.

- [ ] **Step 4: Commit**

```bash
git add components/terminal/ask-bar.tsx "app/(terminal)/layout.tsx"
git commit -m "feat: ask> AI chat bar with SSE streaming"
```

---

### Task 7: Deploy + smoke test en producción

**Files:** ninguno (deploy).

- [ ] **Step 1: Deploy**

```bash
cd /Users/rodrigoburdet/hobby/portfolio && npm run deploy:pages
```

Expected: build next-on-pages + `wrangler pages deploy` OK. Los bindings `ai` y `ASK_RATELIMIT` los toma de `wrangler.jsonc`.

- [ ] **Step 2: Smoke test**

```bash
for p in / /about /projects /contact /exercises /projects/tictactoe; do echo "$p: $(curl -s -o /dev/null -w '%{http_code}' https://www.rburdet.com$p)"; done
curl -s https://www.rburdet.com | grep -o "whoami\|rodrigo@rburdet.com" | sort -u
curl -s -X POST https://www.rburdet.com/api/ask -H 'content-type: application/json' -d '{"question":"what is ExPensa?","history":[]}' | head -c 300
```

Expected: todas 200; `whoami` y `rodrigo@rburdet.com` presentes; el POST devuelve `data: {...}` con contenido sobre ExPensa.

- [ ] **Step 3: Prueba visual final**

Abrir https://www.rburdet.com en el navegador: typing effect, hover de cards, navegación por tabs, una pregunta real al `ask>` con streaming visible. Reportar con screenshot.

- [ ] **Step 4: Commit de cierre (si hubo desvíos documentados)**

```bash
git add docs/superpowers/
git commit -m "docs: execution notes for terminal revamp" || true
```
