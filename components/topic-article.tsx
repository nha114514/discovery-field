import type { ExploreArticle } from '../lib/domain/topic-exploration';
import type { Locale } from '../lib/domain/learner-intake';
import { getExploreCopy } from '../lib/i18n/explore-copy';

export function TopicArticle({ article, locale }: { article: ExploreArticle; locale: Locale }) {
  const copy = getExploreCopy(locale);
  const { fable } = article;

  return (
    <article className="reader-article">
      <p className="reader-kicker">{fable ? copy.storyLabel : copy.articleLabel}</p>
      <h1>{fable?.title ?? article.title}</h1>
      {fable && (
        <>
          <div className="reader-prose reader-story">
            {fable.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          <div className="reader-reveal">
            <p>{fable.reveal}</p>
          </div>
          <h2 className="reader-concept-title">{article.title}</h2>
        </>
      )}
      <p className="reader-lede">{article.lede}</p>
      <div className="reader-prose">
        {article.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
      {fable && (
        <section className="reader-metaphors" aria-labelledby="metaphors-title">
          <h2 id="metaphors-title">{copy.metaphorsTitle}</h2>
          <dl>
            {fable.mappings.map((mapping, index) => (
              <div key={index}>
                <dt>{mapping.image}</dt>
                <dd>{mapping.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <p className="reader-notice">{copy.notice}</p>
    </article>
  );
}
