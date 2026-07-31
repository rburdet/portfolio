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

