import type { ReactElement } from "react";

import type { Demo, Experience } from "../content";
import { demoSrc } from "../work";

function DemoVideo({ demo, controls }: { demo: Demo; controls: boolean }): ReactElement {
  const common = {
    className: "block w-full h-auto",
    height: demo.height,
    muted: true,
    playsInline: true,
    poster: demoSrc(demo.poster),
    width: demo.width,
  };
  return controls ? (
    <video {...common} controls preload="none">
      <source src={demoSrc(demo.clip)} type="video/mp4" />
    </video>
  ) : (
    <video {...common} autoPlay loop preload="none" aria-hidden="true">
      <source src={demoSrc(demo.clip)} type="video/mp4" />
    </video>
  );
}

function DemoTile({ demo }: { demo: Demo }): ReactElement {
  return (
    <figure className="reveal m-0 flex flex-col" id={demo.slug}>
      <div className="relative overflow-hidden rounded-[18px] border border-line bg-[#0b0a09]">
        <div className="demo-motion-on">
          <DemoVideo controls={false} demo={demo} />
        </div>
        <div className="demo-motion-off">
          <DemoVideo controls demo={demo} />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-[rgba(10,9,8,0.72)] backdrop-blur px-3 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[#f3f0ea]">
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

function ExperienceRow({ item }: { item: Experience }): ReactElement {
  return (
    <li className="reveal grid gap-6 md:grid-cols-12 border-t border-line py-10 sm:py-12">
      <div className="md:col-span-4 flex flex-col gap-3">
        <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted flex items-center gap-2">
          {item.current ? (
            <>
              <span className="relative inline-flex w-2 h-2" aria-hidden="true">
                <span className="absolute inset-0 rounded-full bg-accent-bright opacity-60 motion-safe:animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-accent-bright" />
              </span>
              Now
            </>
          ) : (
            "Before"
          )}
          {item.period === undefined ? null : <span>· {item.period}</span>}
        </p>
        <h3 className="m-0 text-[clamp(2rem,4.4vw,3.6rem)] leading-[0.95] tracking-[-0.045em] font-medium">
          <a className="link-underline" href={item.url} rel="noopener">
            {item.company}
          </a>
        </h3>
        {item.role === undefined ? null : <p className="m-0 text-ink-2">{item.role}</p>}
      </div>
      <div className="md:col-span-8 flex flex-col gap-10">
        <p className="m-0 text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.4] tracking-[-0.015em] max-w-[40rem] [text-wrap:pretty]">
          {item.description}
        </p>
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

export function ExperienceTimeline({ items }: { items: readonly Experience[] }): ReactElement {
  return (
    <ol className="m-0 p-0 list-none border-b border-line">
      {items.map((item) => (
        <ExperienceRow item={item} key={item.slug} />
      ))}
    </ol>
  );
}
