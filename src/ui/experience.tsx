import type { ReactElement } from "react";

import type { Demo, Experience, Role } from "../content";
import { demoSrc } from "../work";

function DemoVideo({ demo }: { demo: Demo }): ReactElement {
  return (
    <video
      aria-label={`${demo.title}, ${demo.event.toLowerCase()}`}
      className="block w-full h-auto"
      controls
      height={demo.height}
      muted
      playsInline
      poster={demoSrc(demo.poster)}
      preload="none"
      width={demo.width}
    >
      <source src={demoSrc(demo.clip)} type="video/mp4" />
    </video>
  );
}

function DemoTile({ demo }: { demo: Demo }): ReactElement {
  return (
    <figure className="reveal m-0 flex flex-col" id={demo.slug}>
      <div className="relative overflow-hidden rounded-[18px] border border-line bg-[#0b0a09]">
        <DemoVideo demo={demo} />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[rgba(10,9,8,0.72)] backdrop-blur px-3 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[#f3f0ea]">
          {demo.event}
        </span>
      </div>
      <figcaption className="mt-5">
        <h4 className="m-0 text-[1.2rem] tracking-[-0.02em] font-medium">{demo.title}</h4>
        <p className="m-0 mt-2 text-muted leading-relaxed">{demo.summary}</p>
        {demo.points.length === 0 ? null : (
          <ul className="m-0 mt-4 p-0 list-none flex flex-col gap-2 text-[0.95rem] text-ink-2">
            {demo.points.map((point) => (
              <li className="flex gap-3" key={point}>
                <span className="text-accent" aria-hidden="true">
                  —
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
        {demo.full === undefined ? null : (
          <a className="link-underline inline-block mt-4 font-medium" href={demoSrc(demo.full)}>
            Watch the full demo, with sound
          </a>
        )}
      </figcaption>
    </figure>
  );
}

function RoleBlock({ role, showTitle }: { role: Role; showTitle: boolean }): ReactElement {
  return (
    <div className="border-l border-line pl-5">
      {showTitle ? <h4 className="m-0 text-[1.05rem] tracking-[-0.01em] font-medium">{role.title}</h4> : null}
      {role.points.length === 0 ? null : (
        <ul className={`m-0 p-0 list-none flex flex-col gap-2.5 text-ink-2 leading-relaxed ${showTitle ? "mt-3" : ""}`}>
          {role.points.map((point) => (
            <li className="flex gap-3" key={point}>
              <span className="text-accent shrink-0" aria-hidden="true">
                —
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CompanyName({ item, size }: { item: Experience; size: string }): ReactElement {
  return (
    <h3 className={`m-0 leading-[0.95] tracking-[-0.045em] font-medium ${size}`}>
      {item.url === undefined ? (
        item.company
      ) : (
        <a className="link-underline" href={item.url} rel="noopener">
          {item.company}
        </a>
      )}
    </h3>
  );
}

function CompactRow({ item }: { item: Experience }): ReactElement {
  return (
    <li className="reveal grid gap-3 md:grid-cols-12 border-t border-line py-7">
      <div className="md:col-span-4 flex flex-col gap-2">
        <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{item.period ?? "Before"}</p>
        <CompanyName item={item} size="text-[clamp(1.4rem,2.2vw,1.8rem)]" />
        {item.role === undefined ? null : <p className="m-0 text-ink-2">{item.role}</p>}
      </div>
      <p className="md:col-span-8 m-0 text-muted leading-relaxed max-w-[40rem] md:pt-6">{item.description}</p>
    </li>
  );
}

function ExperienceRow({ item }: { item: Experience }): ReactElement {
  if (item.compact) return <CompactRow item={item} />;
  const multipleRoles = item.roles.length > 1;
  return (
    <li className="reveal grid gap-6 md:grid-cols-12 border-t border-line py-10 sm:py-12">
      <div className="md:col-span-4 flex flex-col gap-3">
        <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted flex items-center gap-2">
          {item.current ? (
            <span className="relative inline-flex w-2 h-2" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-accent-bright opacity-60 motion-safe:animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-accent-bright" />
            </span>
          ) : null}
          {item.period ?? (item.current ? "Now" : "Before")}
        </p>
        <CompanyName item={item} size="text-[clamp(2rem,4.4vw,3.6rem)]" />
        {item.role === undefined ? null : <p className="m-0 text-ink-2">{item.role}</p>}
        {multipleRoles ? <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{item.roles.length} roles</p> : null}
      </div>
      <div className="md:col-span-8 flex flex-col gap-10">
        <p className="m-0 text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.4] tracking-[-0.015em] max-w-[40rem] [text-wrap:pretty]">
          {item.description}
        </p>
        {item.roles.length === 0 ? null : (
          <div className="flex flex-col gap-8 max-w-[44rem]">
            {item.roles.map((role) => (
              <RoleBlock key={role.title} role={role} showTitle={multipleRoles} />
            ))}
          </div>
        )}
        {item.html.trim() === "" ? null : <div className="prose max-w-[40rem]" dangerouslySetInnerHTML={{ __html: item.html }} />}
        {item.demos.length === 0 ? null : (
          <div>
            <p className="m-0 mb-6 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">Experiments · built solo</p>
            <div className="grid gap-10 lg:grid-cols-2">
              {item.demos.map((demo) => (
                <DemoTile demo={demo} key={demo.slug} />
              ))}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

export const SKILLS = [
  { group: "Frontend", items: ["React", "TypeScript", "Next.js", "CSS Modules", "Tailwind", "shadcn/ui", "Radix", "Vite", "Storybook"] },
  { group: "Backend", items: ["Node.js", "Postgres", "Express", "GraphQL", "Apollo", "Nest.js", "Prisma", "Drizzle"] },
  { group: "Infrastructure", items: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Vercel", "Argo CD"] },
  { group: "Tools", items: ["Git", "Nx and monorepos", "Playwright", "Artillery", "Postman"] },
] as const;

export function SkillsRow(): ReactElement {
  return (
    <div className="grid gap-8 md:grid-cols-12">
      <p className="md:col-span-4 m-0 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">Skills</p>
      <dl className="md:col-span-8 m-0 grid gap-6 sm:grid-cols-2">
        {SKILLS.map((skill) => (
          <div key={skill.group}>
            <dt className="text-[0.95rem] font-medium">{skill.group}</dt>
            <dd className="m-0 mt-3 flex flex-wrap gap-2">
              {skill.items.map((item) => (
                <span className="rounded-full border border-line px-3 py-1 text-[0.85rem] text-ink-2" key={item}>
                  {item}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ExperienceTimeline({ items }: { items: readonly Experience[] }): ReactElement {
  return (
    <ol className="m-0 p-0 list-none border-b border-line">
      {items.map((item) => (
        <ExperienceRow item={item} key={item.slug} />
      ))}
    </ol>
  );
}
