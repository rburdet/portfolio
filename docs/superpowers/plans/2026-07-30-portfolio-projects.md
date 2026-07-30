# Proyectos de ~/hobby en el portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar los proyectos de `~/hobby` en el portfolio: 3 deploys nuevos a Cloudflare (clavos, expensas, classic), cards para lo ya deployado (tuyairbnb, guardiapp) y cards sin demo (etiquetas, facturador-zalva, harvester, hasura-json), más el apex `rburdet.com`.

**Architecture:** El portfolio (Next.js en Cloudflare Pages, `/Users/rodrigoburdet/hobby/portfolio`) lista proyectos desde `lib/projects.ts`. Cada proyecto A se deploya desde su propio repo con `wrangler deploy` y custom domain en su config. Su card se agrega recién cuando el deploy está verificado con `curl`.

**Tech Stack:** Next.js, TypeScript, Cloudflare Workers/Pages, wrangler, D1.

**Spec:** `docs/superpowers/specs/2026-07-30-portfolio-projects-design.md`

## Global Constraints

- El repo del portfolio tiene **cambios WIP sin commitear** ajenos a este trabajo. En cada commit del portfolio: `git add` SOLO los archivos que el task toca — nunca `git add -A` ni `git commit -a`.
- Dominios: todos en la zona `rburdet.com` (Cloudflare). Custom domains declarados en el wrangler config de cada proyecto, no a mano en el dashboard DNS.
- El portfolio no tiene framework de tests; la verificación es `npm run build` + `curl` contra el dev server o la URL productiva. No agregar vitest/jest para esto (YAGNI).
- Cards en inglés, mismo tono que las existentes.
- Los proyectos `clavos` y `classic` tienen repo git propio: commitear los cambios de config en su repo. `expensas` no es repo git: se inicializa en su task.
- No tocar la VPS ni el setup de guardiapp/tuyairbnb (ya están live).

---

### Task 1: Modelo `Project` + cards de lo ya live y las cards sin demo

**Files:**
- Modify: `lib/projects.ts`
- Modify: `components/project-grid.tsx`

**Interfaces:**
- Consumes: nada (primer task).
- Produces: `Project` con campos nuevos `repoUrl?: string` y `status?: "live" | "code"`. Task 5 agrega más entradas a `projects` con esta misma forma.

- [ ] **Step 1: Reescribir `lib/projects.ts`**

Contenido completo del archivo:

```ts
export interface DemoLink {
	title: string;
	path: string;
	external?: boolean;
}

export interface Project {
	id: string;
	title: string;
	description: string;
	technologies: string[];
	demoLinks?: DemoLink[];
	externalUrl?: string;
	repoUrl?: string;
	status?: "live" | "code";
}

export const projects: Project[] = [
	{
		id: "gym-routine",
		title: "Gym Routine Tracker",
		description:
			"Personal workout tracker with activity heatmap and daily exercise routines",
		technologies: [
			"Next.js",
			"TypeScript",
			"Cloudflare Workers",
			"KV Storage",
		],
		externalUrl: "https://gym.rburdet.com",
	},
	{
		id: "tictactoe",
		title: "Multiplayer Tic Tac Toe",
		description:
			"Real-time multiplayer game using WebSockets and Cloudflare Durable Objects",
		technologies: [
			"Next.js",
			"WebSockets",
			"Cloudflare Durable Objects",
			"TypeScript",
		],
	},
	{
		id: "wind",
		title: "Wind Conditions",
		description:
			"Real-time wind conditions for Port Olímpic with configurable web-push alerts",
		technologies: [
			"React",
			"TypeScript",
			"Cloudflare Workers",
			"KV Storage",
			"Web Push",
		],
		externalUrl: "https://wind.rburdet.com",
	},
	{
		id: "mareas",
		title: "Tide Tables",
		description: "Tide predictions with high/low tide times and levels",
		technologies: ["React", "TypeScript", "Data Visualization"],
		externalUrl: "https://mareas.rburdet.com",
	},
	{
		id: "encarta",
		title: "Encarta",
		description: "Knowledge exploration tool with interactive content",
		technologies: ["React", "TypeScript"],
		externalUrl: "https://encarta.rburdet.com",
	},
	{
		id: "guardiapp",
		title: "GuardiApp",
		description:
			"Shift scheduling for medical residents: deterministic monthly rosters built with a constraint-optimization engine",
		technologies: ["Python", "FastAPI", "OR-Tools", "Next.js"],
		externalUrl: "https://guardias.rburdet.com",
	},
	{
		id: "tuyairbnb",
		title: "Airbnb Lock Sync",
		description:
			"Syncs Airbnb reservations with Tuya smart-lock codes so each guest gets a door code scoped to their stay (demo behind login)",
		technologies: ["Hono", "Cloudflare Workers", "D1", "Cron Triggers"],
		externalUrl: "https://airbnb.rburdet.com",
	},
	{
		id: "etiquetas",
		title: "QR Label Printer",
		description:
			"Desktop app and Chrome extension that generate and print QR product labels from a Tiendanube store on a Brother QL-800",
		technologies: ["Electron", "Node.js", "Chrome Extension"],
		status: "code",
	},
	{
		id: "facturador-zalva",
		title: "Facturador Zalva",
		description:
			"Invoicing tool with a Cloudflare Workers backend and a React client",
		technologies: ["Cloudflare Workers", "React", "TypeScript"],
		status: "code",
	},
	{
		id: "harvester",
		title: "Harvester",
		description:
			"Auto-fills Harvest timesheets from your git commits, then generates monthly client reports and invoice PDFs",
		technologies: ["Python", "GitHub CLI", "Harvest API"],
		repoUrl: "https://github.com/rburdet/harvester",
		status: "code",
	},
	{
		id: "hasura-json",
		title: "Hasura JSON Viewer",
		description:
			"Chrome extension that turns cramped JSON cells in the Hasura console into a formatted, collapsible, searchable viewer",
		technologies: ["Chrome Extension", "JavaScript"],
		status: "code",
	},
];
```

- [ ] **Step 2: Actualizar `components/project-grid.tsx`**

Reglas: las cards `status: "code"` no linkean a `/projects/<id>`; si tienen `repoUrl` el título linkea ahí, si no, el título no es link. Las demás cards mantienen el comportamiento actual. Contenido completo:

```tsx
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/projects";

interface ProjectGridProps {
	projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<div className="grid gap-6 sm:grid-cols-2">
			{projects.map((project) => {
				const isCode = project.status === "code";
				const href = isCode
					? project.repoUrl
					: project.externalUrl || `/projects/${project.id}`;
				const isExternal = !!project.externalUrl || (isCode && !!project.repoUrl);

				return (
					<Card key={project.id} className="flex flex-col">
						<CardHeader>
							<CardTitle className="font-mono">
								{href ? (
									<Link
										href={href}
										className="hover:underline inline-flex items-center gap-2"
										target={isExternal ? "_blank" : undefined}
										rel={isExternal ? "noopener noreferrer" : undefined}
									>
										{project.title}
										{isExternal && <ExternalLink className="w-4 h-4" />}
									</Link>
								) : (
									project.title
								)}
							</CardTitle>
							<CardDescription>{project.description}</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col flex-1">
							<div className="flex flex-wrap gap-2 mb-4">
								{project.technologies.map((tech) => (
									<Badge key={tech} variant="secondary">
										{tech}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
```

- [ ] **Step 3: Build**

Run: `cd /Users/rodrigoburdet/hobby/portfolio && npm run build`
Expected: build exitoso, sin errores de tipos.

- [ ] **Step 4: Verificar render**

```bash
cd /Users/rodrigoburdet/hobby/portfolio
npm run dev > /tmp/portfolio-dev.log 2>&1 & echo $! > /tmp/portfolio-dev.pid
sleep 8
curl -s http://localhost:3000 | grep -o "GuardiApp\|Airbnb Lock Sync\|QR Label Printer\|Harvester\|Hasura JSON Viewer\|Facturador Zalva" | sort -u
kill "$(cat /tmp/portfolio-dev.pid)"
```

Expected: aparecen los 6 títulos nuevos. Verificar también que "Harvester" tenga link a GitHub y que "QR Label Printer" NO sea link (`curl -s http://localhost:3000 | grep -A2 "QR Label Printer"` no debe mostrar `<a` envolviendo el título).

- [ ] **Step 5: Commit (solo estos archivos)**

```bash
cd /Users/rodrigoburdet/hobby/portfolio
git add lib/projects.ts components/project-grid.tsx
git commit -m "Add code-only project cards and already-live projects (guardiapp, tuyairbnb)"
```

---

### Task 2: Deploy de clavos → clavos.rburdet.com

**Files:**
- Modify: `/Users/rodrigoburdet/hobby/clavos/wrangler.toml`

**Interfaces:**
- Consumes: nada.
- Produces: `https://clavos.rburdet.com` respondiendo 200. Task 5 agrega su card.

- [ ] **Step 1: Agregar custom domain al wrangler.toml**

En `/Users/rodrigoburdet/hobby/clavos/wrangler.toml`, después de la línea `compatibility_flags = ["nodejs_compat"]` (bloque top-level, NO dentro de `[env.production]`), agregar:

```toml
workers_dev = false
routes = [
  { pattern = "clavos.rburdet.com", custom_domain = true }
]
```

- [ ] **Step 2: Deploy**

Run: `cd /Users/rodrigoburdet/hobby/clavos && npm run deploy`
Expected: `opennextjs-cloudflare build` compila y `deploy` publica el worker `clavos` con el custom domain. Si falla por dependencias, correr `npm install` primero y reintentar.

- [ ] **Step 3: Verificar**

Run: `sleep 30 && curl -s -o /dev/null -w '%{http_code}' https://clavos.rburdet.com`
Expected: `200` (el custom domain puede tardar ~1 min en propagar; reintentar si da 522/530).

- [ ] **Step 4: Commit en el repo de clavos**

```bash
cd /Users/rodrigoburdet/hobby/clavos
git add wrangler.toml
git commit -m "Add clavos.rburdet.com custom domain"
```

---

### Task 3: Deploy de expensas → expensas.rburdet.com

**Files:**
- Modify: `/Users/rodrigoburdet/hobby/expensas/wrangler.jsonc`

**Interfaces:**
- Consumes: nada.
- Produces: `https://expensas.rburdet.com` respondiendo 200. Task 5 agrega su card.

- [ ] **Step 1: Inicializar git (no es repo)**

```bash
cd /Users/rodrigoburdet/hobby/expensas
git init
git add -A ':!node_modules'
git commit -m "Initial commit"
```

Nota: si `.gitignore` no existe, crearlo antes del `git add` con:

```
node_modules
build
.wrangler
*.tsbuildinfo
```

- [ ] **Step 2: Renombrar worker y agregar custom domain**

Reemplazar el contenido de `/Users/rodrigoburdet/hobby/expensas/wrangler.jsonc` por:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "expensas",
  "compatibility_date": "2025-04-04",
  "main": "./workers/app.ts",
  "workers_dev": false,
  "routes": [
    { "pattern": "expensas.rburdet.com", "custom_domain": true }
  ],
  "vars": {
    "VALUE_FROM_CLOUDFLARE": "Hello from Cloudflare",
  },
}
```

(Se conserva `VALUE_FROM_CLOUDFLARE` por si el template lo referencia; no romper el build por limpiarlo.)

- [ ] **Step 3: Deploy**

Run: `cd /Users/rodrigoburdet/hobby/expensas && npm run deploy`
Expected: `react-router build && wrangler deploy` publica el worker `expensas` con el custom domain.

- [ ] **Step 4: Verificar**

Run: `sleep 30 && curl -s -o /dev/null -w '%{http_code}' https://expensas.rburdet.com`
Expected: `200`. Verificar también contenido: `curl -s https://expensas.rburdet.com | grep -io "expensa" | head -1` → `expensa`.

- [ ] **Step 5: Commit**

```bash
cd /Users/rodrigoburdet/hobby/expensas
git add wrangler.jsonc .gitignore
git commit -m "Rename worker to expensas and add custom domain"
```

---

### Task 4: Deploy de classic (web + scraper + D1) → classic.rburdet.com

**Files:**
- Modify: `/Users/rodrigoburdet/hobby/classic/web/wrangler.jsonc`
- Read: `/Users/rodrigoburdet/hobby/classic/db/migrations/` (0001–0008)

**Interfaces:**
- Consumes: nada.
- Produces: `https://classic.rburdet.com` respondiendo 200 con listings. Task 5 agrega su card.

- [ ] **Step 1: Estado de la D1 remota**

Run: `cd /Users/rodrigoburdet/hobby/classic/scraper && npx wrangler d1 execute classic-cars-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'" --json`
Expected: lista de tablas. Si incluye `listings`, `categories`, `civac_vehicles` → saltar Step 2. Si la DB no existe o está vacía → Step 2.

- [ ] **Step 2 (condicional): Aplicar migraciones 0001–0008 en orden**

```bash
cd /Users/rodrigoburdet/hobby/classic/scraper
for f in ../db/migrations/0001_init.sql ../db/migrations/0002_api_fields.sql ../db/migrations/0003_all_cars.sql ../db/migrations/0004_civac_schema.sql ../db/migrations/0005_import_civac_junio_2025.sql ../db/migrations/0006_update_civac_preapproved.sql ../db/migrations/0007_fix_civac_matching.sql ../db/migrations/0008_listings_tags.sql; do
  npx wrangler d1 execute classic-cars-db --remote --file="$f" || break
done
```

Expected: cada migración termina OK. Si una falla por "already exists", la DB estaba parcialmente migrada: aplicar solo las que falten (comparar tablas/columnas del error contra el SQL).

- [ ] **Step 3: Deploy del scraper**

Run: `cd /Users/rodrigoburdet/hobby/classic/scraper && npm run deploy`
Expected: worker `classic-scraper` publicado con cron `0 */6 * * *`.

Después: `npx wrangler secret list` — si `CF_API_TOKEN` no está en la lista, **CHECKPOINT con Rodrigo**: pedirle el token (el wrangler.toml lo requiere como secret) y cargarlo con `npx wrangler secret put CF_API_TOKEN`. El deploy del web NO se bloquea por esto.

- [ ] **Step 4: Custom domain para el web**

En `/Users/rodrigoburdet/hobby/classic/web/wrangler.jsonc` agregar después de `"main": "worker/index.ts",`:

```jsonc
  "workers_dev": false,
  "routes": [
    { "pattern": "classic.rburdet.com", "custom_domain": true }
  ],
```

- [ ] **Step 5: Deploy del web**

Run: `cd /Users/rodrigoburdet/hobby/classic/web && npm run deploy`
Expected: `vinext deploy` publica el worker `classic-web` con el custom domain.

- [ ] **Step 6: Verificar sitio y datos**

```bash
sleep 30
curl -s -o /dev/null -w '%{http_code}\n' https://classic.rburdet.com
curl -s "https://classic.rburdet.com/api/listings?page=1" | head -c 300
```

Expected: `200` y JSON con listings. Si `/api/listings` devuelve vacío, disparar un sync manual: `curl -s -H "Authorization: Bearer mN5mDUiaLCnULpNgpYzHIPCEpPlFVeoprsKP15fy" "https://classic-scraper.<subdominio-workers-dev>/sync"` — el header exacto y la URL del scraper están en `scraper/src/index.ts` (leerlo antes de invocar; el scraper tiene `workers_dev` habilitado por defecto).

- [ ] **Step 7: Commit en el repo de classic**

```bash
cd /Users/rodrigoburdet/hobby/classic
git add web/wrangler.jsonc
git commit -m "Add classic.rburdet.com custom domain"
```

---

### Task 5: Cards de clavos, expensas y classic en el portfolio

**Files:**
- Modify: `lib/projects.ts`

**Interfaces:**
- Consumes: la interfaz `Project` de Task 1 y las URLs verificadas en Tasks 2–4.
- Produces: array `projects` completo (14 entradas).

- [ ] **Step 1: Agregar las 3 entradas al final del array `projects` en `lib/projects.ts`**

```ts
	{
		id: "clavos",
		title: "Clavos Estilbieser",
		description:
			"Product site for a spiral-nail and pneumatic-tool manufacturer, with PDF quote generation",
		technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Cloudflare Workers"],
		externalUrl: "https://clavos.rburdet.com",
	},
	{
		id: "expensas",
		title: "ExPensa",
		description:
			"AI-audited building expense reports: spend breakdowns, delinquency and cash flow, with findings grounded in Argentine property law",
		technologies: ["React Router v7", "Cloudflare Workers", "Recharts", "Tailwind CSS"],
		externalUrl: "https://expensas.rburdet.com",
	},
	{
		id: "classic",
		title: "Clásicos AR",
		description:
			"Marketplace of CIVAC-preapproved classic American cars scraped from Hemmings, with an import cost calculator for Argentina",
		technologies: ["Next.js", "Cloudflare Workers", "D1", "Cron Triggers"],
		externalUrl: "https://classic.rburdet.com",
	},
```

**Importante:** solo agregar la card de cada proyecto cuyo deploy fue verificado (curl 200) en su task. Si algún deploy quedó pendiente, omitir esa card y anotarlo.

- [ ] **Step 2: Build**

Run: `cd /Users/rodrigoburdet/hobby/portfolio && npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
cd /Users/rodrigoburdet/hobby/portfolio
git add lib/projects.ts
git commit -m "Add clavos, expensas and classic project cards"
```

---

### Task 6: Deploy del portfolio + apex rburdet.com

**Files:**
- Ninguno nuevo (deploy + DNS).

**Interfaces:**
- Consumes: cards de Tasks 1 y 5.
- Produces: portfolio live con las 14 cards; `rburdet.com` (apex) resolviendo al portfolio.

- [ ] **Step 1: CHECKPOINT con Rodrigo antes de deployar**

El working tree del portfolio tiene cambios WIP sin commitear (`app/page.tsx`, `public/sw.js`, `workers/`, etc.). `npm run deploy:pages` publica el estado actual del árbol, WIP incluido. Preguntar a Rodrigo: ¿deployamos con el WIP tal cual, o commiteás/limpiás antes?

- [ ] **Step 2: Deploy del portfolio**

Run: `cd /Users/rodrigoburdet/hobby/portfolio && npm run deploy:pages`
Expected: build de next-on-pages + `wrangler pages deploy` OK.

- [ ] **Step 3: Verificar cards en producción**

Run: `curl -s https://www.rburdet.com | grep -o "GuardiApp\|Airbnb Lock Sync\|Clavos Estilbieser\|ExPensa\|Clásicos AR\|Harvester" | sort -u`
Expected: los títulos nuevos presentes.

- [ ] **Step 4: Apex rburdet.com → portfolio**

El apex hoy no resuelve. Agregar el custom domain al proyecto Pages:

Run: `cd /Users/rodrigoburdet/hobby/portfolio && npx wrangler pages project list` (confirmar nombre `portfolio`).

Intentar por API con el token de wrangler no es posible (OAuth); hacerlo por dashboard — **paso manual para Rodrigo** (≈1 min):
Cloudflare Dashboard → Workers & Pages → `portfolio` → Custom domains → "Set up a custom domain" → `rburdet.com`. Cloudflare crea el registro DNS solo.

- [ ] **Step 5: Verificar apex**

Run: `dig @1.1.1.1 +short rburdet.com A && curl -s -o /dev/null -w '%{http_code}' https://rburdet.com`
Expected: IPs de Cloudflare y `200` (puede tardar unos minutos en emitir el certificado; reintentar).

- [ ] **Step 6: Commit final de la spec/plan actualizados si hubo desvíos**

```bash
cd /Users/rodrigoburdet/hobby/portfolio
git add docs/superpowers/
git commit -m "Update spec/plan with execution notes" || true
```

---

## Fuera de alcance (recordatorio)

- world-tides: proyecto aparte, con su propio brainstorm/spec/plan.
- CI/CD, screenshots, cambios en la VPS.
