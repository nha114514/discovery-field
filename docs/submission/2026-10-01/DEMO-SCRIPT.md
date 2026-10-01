# English demonstration script

Target length: approximately 3 minutes. Show the current running application,
not a design mockup or the superseded quiz flow. The final video must last
between 2 and 5 minutes. A generated voice may be used, but disclose it.

## 1 — The starting point

**Screen:** English home page; briefly point out open search and sample subjects.

**Narration:**

Discovery Field is a bilingual place to follow your curiosity. It starts with
a question, not a placement test. You can explore a scientific idea, a historical
subject, or something you noticed in everyday life. This is the working local
prototype, connected to DeepSeek for article generation.

## 2 — Ask and read

**Screen:** Search for Transformer; show the actual loading state and response.

**Narration:**

Here I will search for Transformer. The browser sends the topic and language
to our server. The server requests a structured article from the AI provider
and checks its format before showing it. There are no scores to earn or lessons
to unlock. For a complex concept, the reading experience begins with a complete
fictional story instead of a wall of terminology.

## 3 — A story, then the concept

**Screen:** Scroll slowly through the story, reveal, and technical explanation.

**Narration:**

The story has a character, a problem, a decision, and a consequence. We ask the
model to keep the technical name out of the story itself, so the reader follows
the situation before meeting the terminology. After the story comes the reveal.
Then the article explains the actual mechanism. This separation matters: a
memorable metaphor is a way into an idea, not a replacement for an accurate
explanation of it.

## 4 — Connections and language

**Screen:** Show metaphor mappings and related links; switch to Chinese, then English.

**Narration:**

The mapping section connects specific images in the story to the underlying
concept, including where an analogy stops working. Related topics offer several
directions to continue. English and Simplified Chinese are both available.
Switching language requests another version. Switching back reuses the version
already loaded during this visit, rather than paying for the same request again.
This is an in-memory reading convenience, not a permanent account library.

## 5 — More than technical subjects

**Screen:** Search for The Silk Road; show direct factual article and related ideas.

**Narration:**

Now I will search for the Silk Road. Ordinary factual subjects are explained
directly. We do not ask the model to invent historical events to fit a fable.
The same reader works across subjects, and related ideas remain freely
accessible. The layout also adapts to a narrow screen, keeping the article
readable without turning it into a set of tiny cards.

## 6 — What is implemented, and what is not

**Screen:** Mobile reader, then English home. End on product name, not an unverified claim.

**Narration:**

The application uses Next.js, React, TypeScript, Tailwind, and Zod. The API key
stays on the server. Automated tests check contracts, failures, navigation, and
responsive behavior with mock responses; this demonstration uses real provider
output. Codex, Gemini, and MiMo assisted development. Windows text-to-speech
supplies this narration. AI-generated explanations can still be wrong: we have
not yet added source retrieval or citation verification. Those checks, human
editorial review, and public-service cost controls are our next priorities.
