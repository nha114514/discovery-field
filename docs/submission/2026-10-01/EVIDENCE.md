# Dated verification evidence

Captured and checked on **1 October 2026** in `D:\Dev\Projects\GIBC v2`.

## Fresh software checks

| Command | Observed result |
| --- | --- |
| `npm test` | 31 test files; 408 tests passed |
| `npm run test:e2e` | 9 active Chromium tests passed |
| `npm run lint` | Exit 0; no lint diagnostics |
| `npm run typecheck` | Exit 0 |
| `npm run build` | Next.js 16.3.5 production build succeeded |
| `git diff --check` | Exit 0 |

The unit total includes retained legacy domain tests. The current browser suite
is `e2e/open-knowledge.spec.ts`; older browser scripts are archived outside
active spec discovery. Current tests cover the reader at 390, 768, 1024, and
1440 pixels, story/reveal ordering, bilingual navigation, unavailable-service
retry, malformed output, empty topics, and isolation from old mastery storage.

Automated generation is mocked. Vite prints a config-loader compatibility
notice, and Playwright workers print a color-environment warning. These CLI
notices are not browser errors; do not describe the entire tool output as silent.

## Live browser evidence

A separate production server ran locally at `http://127.0.0.1:3000`.
The capture session used **real configured DeepSeek output**, without a route
mock or substituted article. It observed three successful `POST /api/explore`
requests: Transformer in English, Transformer in Chinese, and The Silk Road in
English. Switching back to English did not add another article request.

The session's browser console report showed 0 errors and 0 warnings. This is a
bounded observation, not a guarantee that all topics or browsers are error-free.

Six screenshots in `images/` were checked visually. Desktop captures are
1600 × 1000; the mobile capture is 390 × 844. They contain no API key or personal
account details. Original browser clips and the sampled-frame QA contact sheet
are retained locally under `output/playwright/submission/`.

## Demonstration media

- File: `media/Discovery-Field-demo-en.mp4`.
- Measured duration: **182.56 seconds (3 minutes, 2.56 seconds)**.
- Video: H.264, 1600 × 1000, 25 frames per second.
- Audio: AAC, 48 kHz stereo; measured non-silent audio, maximum level −5.5 dB.
- English narration uses the local Microsoft Zira synthetic voice.
- English captions are burned into the video; `captions-en.srt` is also supplied.
- Six scene recordings show the running product. Long idle gaps are cut and
  some reading frames are held for narration. This is an edited demonstration,
  **not a generation-latency benchmark**.
- Sampled frames were reviewed for page identity, text visibility, chapter
  sequence, and captions. The entrant must still watch and approve the complete
  video before uploading.

**Editorial status: review draft.** The observed Transformer terminology issue
is documented in `EDITORIAL-REVIEW.md`; these assets do not establish factual
accuracy. No article content or application behavior was changed for recording.

## Publication boundary

Only README disclosure and submission artifacts were changed in this task.
No source repository, hosted application, video-host link, or Devpost submission
was published. Source packaging excludes `.env.local`, `.git`, dependencies,
generated builds, browser profiles, and private logs. Packaging checks are not
a comprehensive security audit.
