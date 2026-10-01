import type { Locale } from '../lib/domain/learner-intake';
import { getCopy } from '../lib/i18n/copy';

export function SiteHeader({
  locale,
  onToggleLocale,
}: {
  locale: Locale;
  onToggleLocale: () => void;
}) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="site-brand" href={`/?locale=${locale}`}>
          <svg className="site-brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="3" fill="currentColor" />
            <path d="M20 3v11M20 26v11M3 20h11M26 20h11M8 8l8 8m8 8 8 8M32 8l-8 8m-8 8-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <span>Discovery Field</span>
        </a>
        <p className="site-tagline">{locale === 'zh' ? '从一个问题，走向更多知识' : 'Follow one question into more ideas'}</p>
        <button
          type="button"
          onClick={onToggleLocale}
          aria-label={getCopy(locale).home.languageToggleLabel}
          data-testid="language-toggle"
          className="locale-toggle"
        >
          <span lang="en" className={locale === 'en' ? 'is-active' : undefined}>EN</span>
          <span className="locale-divider" aria-hidden="true" />
          <span lang="zh-CN" className={locale === 'zh' ? 'is-active' : undefined}>中文</span>
        </button>
      </div>
    </header>
  );
}
