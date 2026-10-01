# Devpost fields

## Project name

Discovery Field

## Tagline

A bilingual place to follow your curiosity—through stories, explanations, and connected ideas.

## Inspiration

Curiosity rarely arrives as a syllabus. Someone wonders why a coral reef turns
white; someone else wants to understand an idea they encountered in an AI paper.
Both need a place to start without first proving what they already know.

Discovery Field began as an adaptive-learning prototype. During development,
we found that grading and prerequisite gates were getting between the reader
and the idea. The current version takes a simpler direction: enter a topic,
read a coherent explanation, and follow a connection that interests you.

## What it does

Discovery Field is an English and Simplified Chinese knowledge reader. A user
can search for a question, person, phenomenon, or technical concept—not just
choose from a fixed course.

For advanced concepts, the article starts with a fictional story. A character
faces a problem, tries an approach, and encounters its consequences. Only after
the story does the article reveal the concept, explain the actual mechanism,
and map the story's images to the underlying ideas. Those mappings also make
room for the analogy's limits.

Ordinary factual topics are explained directly rather than turned into invented
history. Related-topic links offer several directions to explore. There are no
learner tests, grades, locked lessons, or mandatory questionnaires in the
public experience.

## How we built it

The application uses Next.js, React, TypeScript, Tailwind CSS, and Zod. A
server-side route sends the selected topic and language to a configured
DeepSeek Chat Completions endpoint. The API key never needs to be present in
client code.

The response must satisfy a strict, bounded article contract before it reaches
the reader. Story, reveal, explanation, metaphor mapping, and related topics
are separate fields rendered in an intentional order. Provider failures become
safe error codes with a retry control, not invented articles or raw error dumps.

Identical concurrent requests share their in-flight work. The reader also keeps
already-loaded language versions in memory, so switching back does not require
another generation during the same visit. These are request-efficiency measures,
not a permanent library or a guarantee of factual accuracy.

## Challenges

The hardest decision was removing features. An earlier version could give an
encouraging result for an answer that did not demonstrate understanding. That
made a clean interface less important than an honest product boundary. We
removed assessment from the public reader instead of presenting a model's
judgment as proof of learning.

Another challenge was getting stories to explain rather than decorate. The
output contract preserves the complete story, delays the reveal, and then
requires a separate technical explanation. Structure can be validated;
educational quality still needs human review.

## Accomplishments

The working prototype demonstrates open-topic reading, bilingual navigation,
story-first technical explanations, and related-topic exploration on desktop
and mobile. Automated tests cover article contracts, service failures,
navigation, language behavior, and responsive rendering. Live-provider captures
are documented separately from tests that use mock responses.

## What we learned

More features do not automatically make a better learning experience. Giving
readers freedom, readable prose, and a clear account of uncertainty can matter
more than assigning them a score. We also learned to separate a valid JSON
response from a trustworthy explanation: one is a software check; the other
requires evidence and editorial judgment.

## What's next

The next priorities are source retrieval with verifiable citations, expert
review of selected articles, and observation of real readers. A public service
also needs rate limits and cost controls. Illustrations should clarify the
specific idea rather than simply fill space. These are planned improvements,
not features claimed by this submission.

## AI and limitations disclosure

Codex / ChatGPT, Gemini through Antigravity, and MiMo assisted development,
writing, debugging, and review. DeepSeek generates runtime articles. Full
disclosure is in the README and Built With list. The prototype is not an
independently verified encyclopedia, has no measured learning-outcome claim,
and does not yet retrieve or verify sources. It depends on a paid API service.

---

## 中文核对版（提交以英文为主）

Discovery Field 是一个中英双语知识阅读网站。读者输入感兴趣的主题，读一篇
连贯的解释，再沿着相关知识继续探索，不需要先填问卷或通过考试。

复杂概念先用完整的虚构故事展开，故事结束后揭晓概念，再讲原理与隐喻对应。
一般事实主题直接解释，不为故事编造历史。公开入口不再使用旧的评分、测验
和待解锁路线。

工程重点是明确的文章结构、服务端密钥、严格格式校验、安全错误处理与双语
阅读。格式正确不等于事实正确；当前没有引文核验或学习效果的实证结论。
后续优先补可核验来源、编辑审查、真实读者观察与公开服务的成本控制。
