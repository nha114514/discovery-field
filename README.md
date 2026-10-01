# Discovery Field · GIBC V2

An English / Simplified Chinese reading website. Search for a topic or question,
read a coherent explanation, and follow related ideas. The public experience
has no intake questionnaire, learner grading, quizzes, or locked lessons.

## Reading experience

- Search across subjects: science, history, arts, economics, technology, and more.
- Advanced concepts use a complete fictional story, followed by the concept
  reveal, an explanation, and a mapping of the story's metaphors.
- Factual subjects are explained directly; historical facts are not invented
  to fit a fable.
- Related topics remain freely available. Switching language requests the
  article in the selected language.
- A white editorial layout, native controls, visible keyboard focus, and a
  responsive reader support desktop and mobile use.

This is an AI-assisted knowledge browser, not a complete or independently
verified encyclopedia. Generated explanations can be wrong and do not currently
include a retrieval or citation-checking pipeline. Publication-quality articles
still require editorial fact-checking.

## Run locally

```bash
npm ci
```

Create `.env.local` using the variable names in `.env.example`. Keep real keys
out of source control.

```env
LLM_API_URL=https://api.deepseek.com/chat/completions
LLM_API_KEY=your_secret_key
LLM_MODEL=deepseek-flash
```

The configured HTTPS endpoint must support Chat Completions and JSON output.
The API key is read only on the server. Without a configured service, the site
shows an unavailable message and a retry control.

```bash
npm run dev
```

Open `http://localhost:3000`. Production runs use `npm run build` followed by
`npm start`; article generation requires the Next.js server.

## Architecture

```text
Home / reader → POST /api/explore → configured AI provider
                                  ↓
                        strict article schema
                                  ↓
                     story / explanation / related topics
```

- `components/home-client.tsx`: open-topic search and example entry points.
- `components/topic-explorer.tsx`: requests, language switching, loading,
  errors, and related-topic navigation.
- `components/topic-article.tsx`: story-first reading order and article rendering.
- `lib/domain/topic-exploration.ts`: bounded request and article contracts.
- `lib/server/explore-topic.ts`: prompt, upstream request, timeout, and output
  validation. Provider errors are not exposed verbatim.
- `app/api/explore/route.ts`: input validation and safe HTTP responses.

The provider receives the requested topic and language. Do not enter private
information as a topic. Rendering escapes model text; schema validation checks
structure, not factual truth. The app has no accounts or cross-device library.

Earlier adaptive-learning domain modules and their unit tests remain in the
repository. They are not used by the current public reader. The old browser
scripts are preserved in `e2e/legacy/`; they describe the superseded workflow.

## AI-assisted development disclosure

OpenAI Codex / ChatGPT, Google Gemini (through Antigravity), and Xiaomi MiMo
were used during development for requirements discussion, literature review,
drafting, code generation, implementation, debugging, and test review. Their
contributions include earlier adaptive-learning modules, bilingual lesson
drafts, UI work, tests, and the current open-topic reader and server integration.
This is AI-assisted software, not a claim of entirely unaided authorship.

At runtime, the configured DeepSeek API generates the article, story, metaphor
mapping, and related-topic suggestions. No external training dataset is bundled
and no custom model is trained. The entrant remains responsible for checking
the code, explaining its behavior, and reviewing generated content.

Submission copy, current screenshots, a demonstration script, and a handoff
checklist are in [`docs/submission/2026-10-01/`](docs/submission/2026-10-01/).

## Verify

```bash
npm test
npm run test:e2e
npm run lint
npm run typecheck
npm run build
git diff --check
```

The active Playwright suite covers open-topic navigation, bilingual reading,
story/reveal ordering, service failure and retry, invalid output, legacy-state
isolation, and desktop/mobile layout. Model responses are mocked in automated
tests so the suite makes no paid provider requests. Live-provider checks are
separate from those tests.

---

## 中文说明

Discovery Field 是一个中英双语知识阅读网站：输入想了解的主题或问题，
读一篇完整的解释，再沿着关联知识继续探索。现在的公开页面没有水平问卷、
评分、课后测验或待解锁课程。

研究层次的概念先通过完整的寓言展开，故事结束后揭晓概念，再解释原理及
隐喻对应。一般事实主题直接讲解，不为了讲故事编造历史。内容覆盖开放主题，
不再依赖固定的 25 节 Transformer 课程。

页面采用白色阅读排版，支持键盘操作、手机浏览和中英切换。切换语言会请求
相应语言的文章。文章由 AI 生成，当前没有检索及引文核验系统，不能把它当作
收录了所有知识、事实全部经过核验的百科全书。

安装和启动命令见上方。三个 `LLM_*` 环境变量放在 `.env.local`；真实密钥
只在服务端使用，不应提交到 Git。AI 提供商会收到主题和语言，请勿输入私人
资料。没有配置服务时，网页会显示原因并允许重试。

旧的自适应学习模块及单元测试保留在仓库中；旧浏览器脚本保存在
`e2e/legacy/`。当前公开入口使用新的开放阅读流程。自动化浏览器测试使用
模拟文章，不产生付费模型调用；真实 API 验证单独进行。

开发过程中使用了 OpenAI Codex / ChatGPT、Google Gemini（Antigravity）及
小米 MiMo，协助需求讨论、资料阅读、文案、代码生成、调试与测试审查，包括
早期自适应模块及当前开放阅读入口。运行时文章由配置的 DeepSeek API 生成；
没有附带外部训练数据集，也没有自行训练模型。参赛者须对代码与生成内容负责。
参赛资料见上方链接。
