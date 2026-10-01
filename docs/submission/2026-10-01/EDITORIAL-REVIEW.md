# Editorial follow-up before final upload

The software and media checks pass, but the captured model output has not had
a complete expert fact-check. Do not present this pack as a verified curriculum.

## Specific issue observed in the English Transformer response

The generated explanation and one metaphor mapping call basic self-attention
“permutation-invariant” while describing an output that changes order with the
input. For unmasked global self-attention without position-dependent information,
the precise property is **permutation equivariance**, not invariance. The
distinction is supported by the original research on
[Transformer sequence-to-sequence approximation](https://arxiv.org/abs/1912.10077).

The “every token sees every other token” description also needs its scope made
explicit: a causal decoder restricts attention to allowed earlier positions.
The Chinese fable's forgetful translator is an analogy, not a literal account
of how an RNN's hidden state behaves.

## How to handle this honestly

- The screenshot and video remain unmodified evidence of a live generated
  response. No corrected paragraph has been pasted into the page for recording.
- Treat the current MP4 as a **review draft** until the entrant has watched it
  and approved the example content. Do not describe it as editorially verified.
- If the application is improved and a better response is produced, capture
  a new real demonstration and update screenshots to match. Do not hide a
  known error with a fake response or claim that schema validation fixes it.
- Keep the AI-generated-content notice and disclose the missing retrieval /
  fact-checking pipeline. The README and submission story already do this.

This task prepared submission materials; it did not alter article text, prompts,
or business logic to address these content issues.
