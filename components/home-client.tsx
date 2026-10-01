'use client';

import { useEffect, useState } from 'react';
import { normalizeLocale, otherLocale } from '../lib/i18n/copy';
import { getExploreCopy } from '../lib/i18n/explore-copy';
import { applyLocaleDocument, syncLocaleToUrl } from '../lib/i18n/locale-url';
import { SiteHeader } from './site-header';

export function HomeClient({ initialLocale }: { initialLocale?: string }) {
  const [locale, setLocale] = useState(() => normalizeLocale(initialLocale));
  const copy = getExploreCopy(locale);

  useEffect(() => {
    applyLocaleDocument(locale);
  }, [locale]);

  function toggleLocale() {
    const next = otherLocale(locale);
    setLocale(next);
    syncLocaleToUrl(next);
  }

  return (
    <>
      <SiteHeader locale={locale} onToggleLocale={toggleLocale} />
      <main className="discovery-home">
        <section className="discovery-hero">
          <div className="discovery-hero-copy">
            <p className="discovery-eyebrow">{copy.homeEyebrow}</p>
            <h1 className="discovery-title">{copy.homeTitle}</h1>
            <p className="discovery-intro">{copy.homeIntro}</p>
            <form className="home-goal-form discovery-search" action="/learn" method="get">
              <input type="hidden" name="locale" value={locale} />
              <label className="sr-only" htmlFor="goal">{copy.searchLabel}</label>
              <input
                id="goal"
                name="goal"
                type="search"
                maxLength={160}
                placeholder={copy.searchPlaceholder}
                autoComplete="off"
                required
              />
              <button type="submit">{copy.searchAction}<span aria-hidden="true">↗</span></button>
            </form>
            <p className="discovery-footnote">{copy.homeFootnote}</p>
          </div>

          <div className="discovery-samples" aria-label={copy.examplesTitle}>
            <h2>{copy.examplesTitle}</h2>
            <ul>
              {copy.examples.map((item, index) => (
                <li key={item.topic}>
                  <a href={`/learn?goal=${encodeURIComponent(item.topic)}&locale=${locale}`}>
                    <span className="discovery-sample-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="discovery-sample-topic">{item.topic}</span>
                    <span className="discovery-sample-field">{item.field}</span>
                    <span aria-hidden="true" className="discovery-sample-arrow">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
