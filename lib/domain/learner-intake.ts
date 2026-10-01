export type Locale = 'zh' | 'en';

export type Level = 'beginner' | 'some' | 'solid';

export type ExplanationStyle = 'story' | 'visual' | 'rigorous';

export type AnswerMode =
  | 'freeform'
  | 'example'
  | 'steps'
  | 'technical'
  | 'unsure';

export interface LearnerIntake {
  level: Level;
  explanationStyle: ExplanationStyle;
  answerMode: AnswerMode;
  learningOutcome: string;
  priorKnowledgeAndConfusion: string;
}

export const answerModes: readonly AnswerMode[] = [
  'freeform',
  'example',
  'steps',
  'technical',
  'unsure',
];

export const levels: readonly Level[] = ['beginner', 'some', 'solid'];

export const explanationStyles: readonly ExplanationStyle[] = [
  'story',
  'visual',
  'rigorous',
];

export function createDefaultIntake(): LearnerIntake {
  return {
    level: 'beginner',
    explanationStyle: 'story',
    answerMode: 'freeform',
    learningOutcome: '',
    priorKnowledgeAndConfusion: '',
  };
}

export function canContinueIntake(intake: LearnerIntake): boolean {
  if (intake.answerMode === 'unsure') {
    return true;
  }
  const outcome = intake.learningOutcome.trim();
  const prior = intake.priorKnowledgeAndConfusion.trim();
  return outcome.length > 0 || prior.length > 0;
}
