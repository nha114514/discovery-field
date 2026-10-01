# Judge quickstart

## What is being demonstrated

Discovery Field is an open-topic, English / Simplified Chinese reader. The live
flow is search → article → related topic. It does not grade learners or promise
that an AI-generated article proves understanding.

## Reproduce locally

1. Obtain the public repository and install a current Node.js version compatible
   with the version of Next.js in `package.json`.
2. Run `npm ci`.
3. Create `.env.local` using `.env.example`. Configure a HTTPS Chat Completions
   endpoint, an API key, and a supported model with JSON output. The demo uses
   DeepSeek; its API may incur charges. Do not commit the key.
4. Run `npm run dev`, then open `http://localhost:3000/?locale=en`.
5. Search for `Transformer`, read the story before the reveal, then inspect the
   explanation and metaphor mapping. Switch to Chinese and back. Follow a
   related idea or search for `The Silk Road` to see a factual article.

For production: `npm run build`, then `npm start`. This is not a static-only
website; the article endpoint needs a running server.

## Verify without paid generation

```bash
npm test
npm run test:e2e
npm run lint
npm run typecheck
npm run build
git diff --check
```

The automated tests use injected or browser-mocked provider responses. They
validate software behavior, not factual accuracy or the provider's availability.
Without a configured provider, the application shows an unavailable message and
retry button. It does not ship an offline encyclopedia.

## Boundaries

- No retrieval pipeline, citation verification, human-reviewed universal
  library, user study, or measured learning gains are claimed.
- There are no accounts, cross-device libraries, or persistent article archives.
- Language switching generates a new version; the two versions need not be
  literal translations. Cached versions last only within the reader visit.
- The requested topic and language go to the configured AI provider. Avoid
  personal or confidential information.
- Schema validation checks structure. Server-side key handling and escaped
  rendering are useful protections, not proof of complete security.
- Public deployment requires additional rate limits, abuse handling, and API
  spending controls. A public hosted URL is not yet provided by this package.
- Legacy adaptive-learning files are preserved for traceability, not advertised
  as current product features.

See `EVIDENCE.md` for the dated verification results and capture provenance.
