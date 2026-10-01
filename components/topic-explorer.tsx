'use client';

import { useEffect, useState } from 'react';
import { ArticleClientError, requestArticle } from '../lib/client/request-article';
import type { ExploreArticle } from '../lib/domain/topic-exploration';
import { normalizeLocale, otherLocale } from '../lib/i18n/copy';
import { getExploreCopy } from '../lib/i18n/explore-copy';
import { applyLocaleDocument, syncLocaleToUrl } from '../lib/i18n/locale-url';
import { SiteHeader } from './site-header';
import { TopicArticle } from './topic-article';

type ErrorState = { requestId: string; code: keyof ReturnType<typeof getExploreCopy>['errors'] };

export function TopicExplorer({ goal, initialLocale }: { goal: string; initialLocale?: string }) {
  const [locale, setLocale] = useState(() => normalizeLocale(initialLocale));
  const [attempt, setAttempt] = useState(0);
  const [articles, setArticles] = useState(() => new Map<string, ExploreArticle>());
  const [failure, setFailure] = useState<ErrorState | null>(null);
  const topic = goal.trim();
  const copy = getExploreCopy(locale);
  const requestId = `${topic}\u0000${locale}\u0000${attempt}`;
  const articleKey = `${topic}\u0000${locale}`;
  const article = articles.get(articleKey) ?? null;
  const errorCode = failure?.requestId === requestId ? failure.code : null;

  useEffect(() => {
    applyLocaleDocument(locale);
  }, [locale]);

  useEffect(() => {
    if (!topic || article) return;
    const controller = new AbortController();
    let active = true;
    requestArticle({ topic, locale }, { signal: controller.signal })
      .then((nextArticle) => {
        if (active) setArticles((current) => new Map(current).set(articleKey, nextArticle));
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof Error && error.name === 'AbortError')) return;
        setFailure({
          requestId,
          code: error instanceof ArticleClientError ? error.code : 'INTERNAL_ERROR',
        });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [topic, locale, requestId, articleKey, article]);

  function toggleLocale() {
    const next = otherLocale(locale);
    setLocale(next);
    syncLocaleToUrl(next);
  }

  return (
    <>
      <SiteHeader locale={locale} onToggleLocale={toggleLocale} />
      <main className="reader-page">
        <div className="reader-toolbar">
          <a className="reader-back" href={`/?locale=${locale}`}><span aria-hidden="true">← </span>{copy.backHome}</a>
          <form className="reader-search" action="/learn" method="get">
            <input type="hidden" name="locale" value={locale} />
            <label className="sr-only" htmlFor="reader-goal">{copy.searchLabel}</label>
            <input
              id="reader-goal"
              type="search"
              name="goal"
              defaultValue={topic}
              maxLength={160}
              placeholder={copy.searchPlaceholder}
              required
            />
            <button type="submit" aria-label={copy.searchAction}>↗</button>
          </form>
        </div>

        {!topic ? (
          <section className="reader-empty">
            <p className="reader-kicker">Discovery Field</p>
            <h1>{copy.emptyTitle}</h1>
            <p>{copy.emptyBody}</p>
            <div className="reader-empty-links">
              {copy.examples.slice(0, 3).map((item) => (
                <a key={item.topic} href={`/learn?goal=${encodeURIComponent(item.topic)}&locale=${locale}`}>
                  {item.topic}<span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </section>
        ) : errorCode ? (
          <section className="reader-message" role="alert">
            <p className="reader-kicker">{copy.articleLabel}</p>
            <h1>{topic}</h1>
            <p>{copy.errors[errorCode]}</p>
            <button type="button" onClick={() => setAttempt((value) => value + 1)}>{copy.retry}</button>
          </section>
        ) : !article ? (
          <section className="reader-loading" role="status" aria-live="polite">
            <p className="reader-kicker">{copy.articleLabel}</p>
            <h1>{topic}</h1>
            <p>{copy.loading}</p>
            <div className="reader-loading-lines" aria-hidden="true"><span /><span /><span /></div>
          </section>
        ) : (
          <div className="reader-layout">
            <TopicArticle article={article} locale={locale} />
            <aside className="reader-related" aria-label={copy.relatedTitle}>
              <h2>{copy.relatedTitle}</h2>
              <p>{copy.relatedIntro}</p>
              <ul>
                {article.related.map((item, index) => (
                  <li key={`${item.topic}-${index}`}>
                    <a href={`/learn?goal=${encodeURIComponent(item.topic)}&locale=${locale}`}>
                      <span>{item.topic}</span>
                      <small>{item.connection}</small>
                      <span className="reader-related-arrow" aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
