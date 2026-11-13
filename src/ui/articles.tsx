import type { ReactElement } from "react";

import { ARTICLES_ROUTE, type Article } from "../content";
import { CONTACT_EMAIL } from "../site";
import { Eyebrow, HEADING, LEDE, PAGE } from "./layout";
import { Signature } from "./signature";

export const ARTICLES_LEDE = "notes on websites, tools + running a small business online.";

export function formatArticleDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .toLowerCase();
}

function ArticleMeta({ article }: { article: Article }): ReactElement {
  return (
    <span className="font-mono text-[0.78rem] tracking-[0.04em] text-muted">
      <time dateTime={article.published}>{formatArticleDate(article.published)}</time> · {article.minutes} min read
      {article.draft ? " · draft" : ""}
    </span>
  );
}

export function ArticleList({ articles }: { articles: readonly Article[] }): ReactElement {
  return (
    <ol className="m-0 p-0 list-none border-b border-line">
      {articles.map((article) => (
        <li className="reveal" key={article.slug}>
          <a className="group grid gap-2 md:gap-8 md:grid-cols-12 border-t border-line py-8" href={article.route}>
            <span className="md:col-span-3 pt-1">
              <ArticleMeta article={article} />
            </span>
            <span className="md:col-span-9 flex flex-col gap-2">
              <span className="text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.1] tracking-[-0.03em] font-medium group-hover:underline underline-offset-4 decoration-1">
                {article.title}
              </span>
              <span className="text-muted leading-relaxed max-w-[40rem]">{article.summary}</span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

function ArticlesIndex({ articles }: { articles: readonly Article[] }): ReactElement {
  return (
    <main className={`${PAGE} pb-28`}>
      <Eyebrow>articles · {String(articles.length).padStart(2, "0")}</Eyebrow>
      <h1 className={`${HEADING} mt-8`}>articles</h1>
      <p className={`${LEDE} mt-8 mb-16`}>{ARTICLES_LEDE}</p>
      <ArticleList articles={articles} />
    </main>
  );
}

function ArticlePage({ article }: { article: Article }): ReactElement {
  return (
    <main className={`${PAGE} pb-28`}>
      <a className="inline-block py-2 font-mono text-[0.78rem] tracking-[0.04em] text-muted hover:text-ink" href={ARTICLES_ROUTE}>
        ← articles
      </a>
      <article className="mt-8">
        <header className="max-w-[52rem]">
          <ArticleMeta article={article} />
          <h1 className={`${HEADING} mt-6 max-w-[20ch] text-[clamp(2.4rem,6vw,5.2rem)]`}>{article.title}</h1>
          <p className={`${LEDE} mt-8`}>{article.summary}</p>
        </header>
        <div className="mt-16 md:ml-[calc(33.333%+0.5rem)] max-w-[42rem]">
          <div className="prose prose-article" dangerouslySetInnerHTML={{ __html: article.html }} />
          <footer className="mt-16 border-t border-line pt-8 flex flex-wrap items-end justify-between gap-6">
            <div className="text-ink">
              <Signature className="w-[140px]" />
            </div>
            <p className="m-0 text-muted max-w-[22rem]">
              questions or want help w/ this?{" "}
              <a className="link-underline text-ink" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(article.title)}`}>
                email me
              </a>
              .
            </p>
          </footer>
        </div>
      </article>
    </main>
  );
}

export function makeArticlesIndex(articles: readonly Article[]): () => ReactElement {
  return function BoundArticlesIndex(): ReactElement {
    return <ArticlesIndex articles={articles} />;
  };
}

export function makeArticle(article: Article): () => ReactElement {
  return function BoundArticle(): ReactElement {
    return <ArticlePage article={article} />;
  };
}
