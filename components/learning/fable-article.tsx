import type { LessonFable } from '../../lib/domain/lessons';
import type { EntryCopy } from '../../lib/i18n/copy';

export function FableArticle({ fable, copy }: { fable: LessonFable; copy: EntryCopy }) {
  return (
    <article className="fable-article" data-fable-article="true" aria-label={fable.title}>
      <div className="fable-story">
        {fable.story.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>

      <p className="fable-reveal">{fable.reveal}</p>

      <section className="fable-explanation">
        <h3>{copy.lesson.fable.explanation}</h3>
        <p>{fable.explanation}</p>
      </section>

      <section className="fable-metaphors">
        <h3>{copy.lesson.fable.metaphors}</h3>
        <dl>
          {fable.metaphors.map(({ image, meaning }) => <div key={image}>
            <dt>{image}</dt>
            <dd>{meaning}</dd>
          </div>)}
        </dl>
      </section>
    </article>
  );
}
