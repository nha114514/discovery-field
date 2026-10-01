export type MasteryByConcept = Readonly<Record<string, number>>;

export const MASTERY_THRESHOLD = 0.7;

/** Diagnostic choice answers alone must never mark a concept mastered. */
export const DIAGNOSTIC_CORRECT_EVIDENCE = 0.55;
export const DIAGNOSTIC_INCORRECT_EVIDENCE = 0.35;

export function updateMastery(
  previousScore: number,
  quizScore: number,
): number {
  if (!isValidScore(previousScore) || !isValidScore(quizScore)) {
    throw new RangeError(
      `Scores must be between 0 and 1, got ${previousScore} and ${quizScore}`,
    );
  }
  return previousScore * 0.4 + quizScore * 0.6;
}

export function diagnosticMastery(isCorrect: boolean): number {
  return isCorrect ? 0.75 : 0.35;
}

export function diagnosticEvidenceScore(isCorrect: boolean): number {
  return isCorrect ? DIAGNOSTIC_CORRECT_EVIDENCE : DIAGNOSTIC_INCORRECT_EVIDENCE;
}

function isValidScore(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}
