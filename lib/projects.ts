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
];
