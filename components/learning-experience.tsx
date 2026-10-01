'use client';

import Link from 'next/link';
import type { LessonAssessmentOutput } from '@/lib/domain/lesson-assessment';
import { selectAcceptedLessonAssessment } from '@/lib/domain/lesson-assessment';
import { requestLessonAssessment, type AssessmentClientErrorCode, AssessmentClientError } from '@/lib/client/request-lesson-assessment';
import { AnswerMode } from '@/lib/domain/learner-intake';
import { useEffect, useMemo, useState } from 'react';
import { defaultDensityForLevel, type ContentDensity } from '@/lib/domain/lesson-presentation';
import { type MasteryByConcept } from '@/lib/domain/mastery';
import {
  createLearnerBelief,
  applyLearnerEvidence,
  type LearnerBeliefState,
  type NeutralInteractionSource,
  LEARNER_BELIEF_PARAMS,
} from '@/lib/domain/learner-belief';
import { loadSession, saveSession, clearSession, getSessionKey } from '@/lib/client/storage';
import { diagnosticQuestions } from '@/lib/domain/diagnostic';
import { buildLearningPath } from '@/lib/domain/learning-path';
import { getLesson } from '@/lib/domain/lessons';
import {
  transformerConcepts,
  transformerEdges,
} from '@/lib/domain/transformer-graph';
import { buildKnowledgeGraphView } from '@/lib/domain/knowledge-graph-view';
import {
  canContinueIntake,
  createDefaultIntake,
  type LearnerIntake,
  type Level,
  type Locale,
} from '@/lib/domain/learner-intake';
import { getConceptTitle } from '@/lib/domain/knowledge';
import {
  selectAcceptedEvidence,
  type ConceptEvidence,
  type SemanticDiagnosis,
} from '@/lib/domain/semantic-diagnostic';
import {
  DiagnosisClientError,
  requestDiagnosis,
  type DiagnosisClientErrorCode,
} from '@/lib/client/request-diagnosis';
import {
  getCopy,
  normalizeLocale,
  otherLocale,
  type EntryCopy,
} from '@/lib/i18n/copy';
import {
  applyLocaleDocument,
  syncLocaleToUrl,
} from '@/lib/i18n/locale-url';
import { PreferencesStep } from '@/components/learning/preferences-step';
import { AnalysisStep } from '@/components/learning/analysis-step';
import { DiagnosisSummary } from '@/components/learning/diagnosis-summary';
import {
  ChallengeIntroStep,
  DiagnosticStep,
} from '@/components/learning/diagnostic-step';
import { RouteStep } from '@/components/learning/route-step';
import { LessonStep } from '@/components/learning/lesson-step';
import { SiteHeader } from '@/components/site-header';

type Step =
  | 'prefs'
  | 'analyzing'
  | 'challenge-intro'
  | 'challenge'
  | 'route'
  | 'lesson';

function isTransformerGoal(goal: string): boolean {
  const value = goal.trim().toLowerCase();
  return value === 'transformer' || value.includes('transformer');
}

const conceptById = new Map(
  transformerConcepts.map((concept) => [concept.id, concept]),
);


const transformerConceptIds = new Set(
  transformerConcepts.map((concept) => concept.id),
);

function buildPath(mastery: MasteryByConcept): string[] {
  return buildLearningPath({
    targetId: 'transformer',
    concepts: transformerConcepts,
    edges: transformerEdges,
    mastery,
  });
}

export function LearnFlow({
  goal,
  initialLocale,
}: {
  goal: string;
  initialLocale?: string;
}) {
  const [locale, setLocale] = useState<Locale>(() =>
    normalizeLocale(initialLocale),
  );
  const copy = useMemo(() => getCopy(locale), [locale]);

  useEffect(() => {
    applyLocaleDocument(locale);
  }, [locale]);

  function toggleLocale() {
    const next = otherLocale(locale);
    setLocale(next);
    syncLocaleToUrl(next);
  }

  if (!isTransformerGoal(goal)) {
    return (
      <>
      <SiteHeader locale={locale} onToggleLocale={toggleLocale} />
      <main className="journey-main mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-16">
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {copy.learn.unsupportedTitle}
          </h1>
          <p className="text-base leading-relaxed text-neutral-600">
            {copy.learn.unsupportedBody}
            {goal ? (
              <>
                {' '}
                {locale === 'zh'
                  ? `你输入的是「${goal}」，它还不在演示知识图中。`
                  : `You entered “${goal}”, which is not in the demo graph yet.`}
              </>
            ) : null}
          </p>
        </header>
        <Link
          href={`/learn?goal=Transformer&locale=${locale}`}
          className="inline-flex w-fit rounded-lg bg-[#3158e7] px-4 py-3 text-base font-medium text-white transition hover:bg-[#2446c7] focus-visible:ring-2 focus-visible:ring-[#3158e7] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {copy.learn.tryTransformer}
        </Link>
        <Link
          href={`/?locale=${locale}`}
          className="w-fit text-sm text-neutral-600 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {copy.learn.backHome}
        </Link>
      </main>
      </>
    );
  }

  return (
    <TransformerJourney
      key={getSessionKey(goal)}
      goal={goal || 'Transformer'}
      locale={locale}
      onToggleLocale={toggleLocale}
      copy={copy}
    />
  );
}

function TransformerJourney({
  goal,
  locale,
  onToggleLocale,
  copy,
}: {
  goal: string;
  locale: Locale;
  onToggleLocale: () => void;
  copy: EntryCopy;
}) {
  const [step, setStep] = useState<Step>('prefs');
  const [intake, setIntake] = useState<LearnerIntake>(() =>
    createDefaultIntake(),
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [diagSelected, setDiagSelected] = useState<number | null>(null);
  const [learnerBelief, setLearnerBelief] = useState<LearnerBeliefState>(() =>
    createLearnerBelief(createDefaultIntake().level)
  );
  const mastery = learnerBelief.mastery;
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [pathBefore, setPathBefore] = useState(0);
  const [analysisError, setAnalysisError] =
    useState<DiagnosisClientErrorCode | null>(null);
  const [semanticDiagnosis, setSemanticDiagnosis] =
    useState<SemanticDiagnosis | null>(null);

  const [openAnswerMode, setOpenAnswerMode] = useState<Exclude<AnswerMode, 'unsure'>>('freeform');
  const [openAnswerText, setOpenAnswerText] = useState('');
  const [openLoading, setOpenLoading] = useState(false);
  const [openError, setOpenError] = useState<AssessmentClientErrorCode | null>(null);
  const [openAssessment, setOpenAssessment] = useState<LessonAssessmentOutput | null>(null);
  const [openAccepted, setOpenAccepted] = useState(false);
  const [useQuizFallback, setUseQuizFallback] = useState(false);
  const [overrideDensity, setOverrideDensity] = useState<ContentDensity | null>(null);
  const [lessonSnapshotLevel, setLessonSnapshotLevel] = useState<Level>(
    () => learnerBelief.stableLevel,
  );

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const session = loadSession(goal);
    if (session) {
      let restoredStep = session.step as Step;
      let restoredConceptId = session.activeConceptId;

      if (restoredStep === 'analyzing') restoredStep = 'prefs';
      if (restoredStep === 'challenge') restoredStep = 'challenge-intro';

      /* eslint-disable */
      if (restoredStep === 'lesson') {
        if (!restoredConceptId || !transformerConceptIds.has(restoredConceptId)) {
          restoredStep = 'route';
          restoredConceptId = null;
        } else {
          setOpenAnswerMode(session.intake.answerMode === 'unsure' ? 'freeform' : session.intake.answerMode as Extract<AnswerMode, 'freeform' | 'example' | 'steps' | 'technical'>);
          setPathBefore(buildPath(session.learnerBelief.mastery).length);
          setQuizSelected(null);
          setQuizChecked(false);
          setQuizCorrect(false);
          setQuizAttempts(0);
          setOpenAnswerText('');
          setOpenLoading(false);
          setOpenError(null);
          setOpenAssessment(null);
          setOpenAccepted(false);
          setUseQuizFallback(false);
        }
      }

      setStep(restoredStep);
      if (restoredConceptId) setSelectedConceptId(restoredConceptId);
      setIntake(session.intake as LearnerIntake);
      setLearnerBelief(session.learnerBelief as LearnerBeliefState);
      setActiveConceptId(restoredConceptId);
      setLessonSnapshotLevel(session.learnerBelief.stableLevel);
      /* eslint-enable */
    }
    setIsHydrated(true);
  }, [goal]);

  const isDirty = useMemo(() => {
    if (step !== 'prefs') return true;
    if (learnerBelief.interactionCount > 0) return true;
    if (learnerBelief.knowledgeEvidenceCount > 0) return true;

    const fresh = createDefaultIntake();
    return intake.level !== fresh.level ||
           intake.explanationStyle !== fresh.explanationStyle ||
           intake.answerMode !== fresh.answerMode ||
           intake.learningOutcome !== fresh.learningOutcome ||
           intake.priorKnowledgeAndConfusion !== fresh.priorKnowledgeAndConfusion;
  }, [step, learnerBelief.interactionCount, learnerBelief.knowledgeEvidenceCount, intake]);

  useEffect(() => {
    if (isHydrated && isDirty) {
      saveSession(goal, {
        step,
        intake,
        learnerBelief,
        activeConceptId,
      });
    }
  }, [isHydrated, isDirty, goal, step, intake, learnerBelief, activeConceptId]);

  const path = useMemo(() => buildPath(mastery), [mastery]);

  const graphView = useMemo(
    () =>
      buildKnowledgeGraphView({
        concepts: transformerConcepts,
        edges: transformerEdges,
        mastery,
        learningPath: path,
      }),
    [mastery, path],
  );

  const acceptedEvidence = useMemo<readonly ConceptEvidence[]>(() => {
    if (!semanticDiagnosis) {
      return [];
    }
    return selectAcceptedEvidence(
      semanticDiagnosis,
      intake.priorKnowledgeAndConfusion,
      transformerConceptIds,
    );
  }, [semanticDiagnosis, intake.priorKnowledgeAndConfusion]);

  const masteredTitles = useMemo(() => {
    return Object.entries(mastery)
      .filter(([, score]) => score >= 0.7)
      .map(([id]) => {
        const concept = conceptById.get(id);
        return concept ? getConceptTitle(concept, locale) : id;
      });
  }, [mastery, locale]);

  const levelLabel = copy.levels[learnerBelief.stableLevel];
  const styleLabel = copy.styles[intake.explanationStyle];

  function patchIntake(patch: Partial<LearnerIntake>) {
    setIntake((previous) => ({ ...previous, ...patch }));
  }

  async function analyzeIntake() {
    if (!canContinueIntake(intake)) return;
    setQuestionIndex(0);
    setDiagSelected(null);
    setAnalysisError(null);
    setSemanticDiagnosis(null);

    const freshBelief = createLearnerBelief(intake.level);
    setLearnerBelief(freshBelief);
    setLessonSnapshotLevel(freshBelief.stableLevel);
    setOverrideDensity(null);

    const outcomeEmpty = intake.learningOutcome.trim().length === 0;
    const priorEmpty = intake.priorKnowledgeAndConfusion.trim().length === 0;
    if (intake.answerMode === 'unsure' && outcomeEmpty && priorEmpty) {
      setStep('challenge-intro');
      return;
    }

    setStep('analyzing');
    try {
      const diagnosis = await requestDiagnosis({
        goal,
        locale,
        intake: {
          level: intake.level,
          explanationStyle: intake.explanationStyle,
          answerMode: intake.answerMode,
          learningOutcome: intake.learningOutcome,
          priorKnowledgeAndConfusion: intake.priorKnowledgeAndConfusion,
        },
      });
      setSemanticDiagnosis(diagnosis);

      const accepted = selectAcceptedEvidence(
        diagnosis,
        intake.priorKnowledgeAndConfusion,
        transformerConceptIds,
      );

      if (accepted.length > 0) {
        const at = Date.now();
        const appliedBelief = accepted.reduce((acc, ev) => {
          const concept = conceptById.get(ev.conceptId);
          if (!concept) {
            throw new Error(`Unknown concept ID: ${ev.conceptId}`);
          }
          return applyLearnerEvidence(acc, {
            kind: 'knowledge',
            source: 'diagnostic',
            conceptId: ev.conceptId,
            score: ev.score,
            confidence: ev.confidence,
            difficulty: concept.difficulty,
            at
          });
        }, freshBelief);
        setLearnerBelief(appliedBelief);
      }

      setStep('challenge-intro');
    } catch (error) {
      if (error instanceof DiagnosisClientError) {
        setAnalysisError(error.code);
      } else {
        setAnalysisError('INTERNAL_ERROR');
      }
    }
  }

  function recordInteraction(source: NeutralInteractionSource) {
    setLearnerBelief((previous) => applyLearnerEvidence(previous, {
      kind: 'interaction',
      source,
    }));
  }

  function continueWithoutAi() {
    setAnalysisError(null);
    setSemanticDiagnosis(null);
    const freshBelief = createLearnerBelief(intake.level);
    setLearnerBelief(freshBelief);
    setLessonSnapshotLevel(freshBelief.stableLevel);
    setOverrideDensity(null);
    setStep('challenge-intro');
  }

  function skipChallenge() {
    setActiveConceptId(null);
    setSelectedConceptId(null);
    setStep('route');
  }

  function startChallenge() {
    setQuestionIndex(0);
    setDiagSelected(null);
    setActiveConceptId(null);
    setStep('challenge');
  }

  function submitChallenge() {
    if (diagSelected === null) return;
    const question = diagnosticQuestions[questionIndex];
    const isCorrect = diagSelected === question.correctIndex;
    const concept = conceptById.get(question.conceptId);
    if (!concept) {
      throw new Error(`Unknown concept ID: ${question.conceptId}`);
    }

    setLearnerBelief((previous) => applyLearnerEvidence(previous, {
      kind: 'knowledge',
      source: 'diagnostic',
      conceptId: question.conceptId,
      score: isCorrect ? 1 : 0,
      confidence: 1,
      difficulty: concept.difficulty,
      at: Date.now()
    }));

    setDiagSelected(null);
    if (questionIndex + 1 < copy.diagnostics.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setStep('route');
    }
  }

  function restart() {
    clearSession(goal);

    const freshIntake = createDefaultIntake();
    setIntake(freshIntake);
    setLearnerBelief(createLearnerBelief(freshIntake.level));
    setLessonSnapshotLevel(freshIntake.level);

    setStep('prefs');
    setQuestionIndex(0);
    setDiagSelected(null);
    setAnalysisError(null);
    setSemanticDiagnosis(null);
    setActiveConceptId(null);
    setQuizSelected(null);
    setQuizChecked(false);
    setQuizCorrect(false);
    setQuizAttempts(0);
    setOverrideDensity(null);
    setPathBefore(0);
    setOpenAnswerMode('freeform');
    setOpenAnswerText('');
    setOpenLoading(false);
    setOpenError(null);
    setOpenAssessment(null);
    setOpenAccepted(false);
    setUseQuizFallback(false);
  }

  function openLesson(conceptId: string) {
    recordInteraction('navigation');
    setActiveConceptId(conceptId);
    setSelectedConceptId(conceptId);
    setQuizSelected(null);
    setQuizChecked(false);
    setQuizCorrect(false);
    setQuizAttempts(0);
    setPathBefore(buildPath(mastery).length);
    setStep('lesson');

    setOpenAnswerMode(
      intake.answerMode === 'unsure' ? 'freeform' : intake.answerMode
    );
    setOpenAnswerText('');
    setOpenLoading(false);
    setOpenError(null);
    setOpenAssessment(null);
    setOpenAccepted(false);
    setUseQuizFallback(false);
    setOverrideDensity(null);
    setLessonSnapshotLevel(learnerBelief.stableLevel);
  }

  function handleDensityChange(density: ContentDensity) {
    const currentActiveDensity =
      overrideDensity ?? defaultDensityForLevel(lessonSnapshotLevel);
    if (density === currentActiveDensity) {
      return;
    }
    recordInteraction('content-expand');
    setOverrideDensity(density);
  }

  async function submitLessonAssessment() {
    if (!activeConceptId) return;
    setOpenLoading(true);
    setOpenError(null);
    try {
      const assessment = await requestLessonAssessment({
        conceptId: activeConceptId,
        locale,
        answerMode: openAnswerMode,
        answer: openAnswerText,
      });
      setOpenAssessment(assessment);
      const accepted = selectAcceptedLessonAssessment(
        assessment,
        openAnswerText,
        activeConceptId,
      );
      if (accepted) {
        setOpenAccepted(true);
        const concept = conceptById.get(activeConceptId);
        if (!concept) {
          throw new Error(`Unknown concept ID: ${activeConceptId}`);
        }
        setLearnerBelief((previous) => applyLearnerEvidence(previous, {
          kind: 'knowledge',
          source: 'open-answer',
          conceptId: activeConceptId,
          score: assessment.score,
          confidence: assessment.confidence,
          difficulty: concept.difficulty,
          at: Date.now()
        }));
      } else {
        setOpenAccepted(false);
      }
    } catch (error) {
      if (error instanceof AssessmentClientError) {
        setOpenError(error.code);
      } else {
        setOpenError('INTERNAL_ERROR');
      }
    } finally {
      setOpenLoading(false);
    }
  }

  function submitLessonQuiz() {
    if (quizSelected === null || activeConceptId === null) return;
    const lesson = getLesson(activeConceptId, locale);
    if (!lesson) return;

    const concept = conceptById.get(activeConceptId);
    if (!concept) {
      throw new Error(`Unknown concept ID: ${activeConceptId}`);
    }

    const isCorrect = quizSelected === lesson.quiz.correctIndex;

    setLearnerBelief((previous) => applyLearnerEvidence(previous, {
      kind: 'knowledge',
      source: 'quick-quiz',
      conceptId: activeConceptId,
      score: isCorrect ? 1 : 0,
      confidence: 1,
      difficulty: concept.difficulty,
      at: Date.now()
    }));

    setQuizChecked(true);
    setQuizCorrect(isCorrect);
    setQuizAttempts((count) => count + 1);
  }

  function retryLessonQuiz() {
    recordInteraction('retry');
    setQuizSelected(null);
    setQuizChecked(false);
    setQuizCorrect(false);
    setPathBefore(buildPath(mastery).length);
  }

  function continueNextLesson() {
    const nextPath = buildPath(mastery);
    if (nextPath.length === 0) {
      setStep('route');
      setActiveConceptId(null);
      return;
    }
    openLesson(nextPath[0]);
  }

  function viewRoute() {
    recordInteraction('navigation');
    setActiveConceptId(null);
    setStep('route');
  }

  const activeLesson = activeConceptId
    ? getLesson(activeConceptId, locale)
    : undefined;
  const activeConcept = activeConceptId
    ? conceptById.get(activeConceptId)
    : undefined;
  const activeTitle = activeConcept
    ? getConceptTitle(activeConcept, locale)
    : (activeConceptId ?? '');

  const nextConcept = path.length > 0 ? conceptById.get(path[0]) : undefined;
  const nextConceptTitle = nextConcept ? getConceptTitle(nextConcept, locale) : null;

  const stepTitle =
    step === 'prefs'
      ? copy.learn.steps.prefs
      : step === 'analyzing'
        ? copy.learn.steps.analyzing
        : step === 'challenge-intro'
          ? copy.learn.steps.challengeChoice
          : step === 'challenge'
            ? copy.learn.steps.challenge
            : step === 'route'
              ? copy.learn.steps.route
              : copy.learn.steps.lesson;

  if (!isHydrated) {
    return (
      <>
      <SiteHeader locale={locale} onToggleLocale={onToggleLocale} />
      <main
        className="journey-main mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 sm:py-16"
        aria-busy="true"
      >
        <span className="sr-only">{copy.learn.steps.analyzing}</span>
        <div className="flex items-start justify-between gap-3">
          <header className="flex min-w-0 flex-col gap-2">
            <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="h-9 w-48 animate-pulse rounded bg-neutral-200" />
          </header>
        </div>
      </main>
      </>
    );
  }

  return (
    <>
    <SiteHeader locale={locale} onToggleLocale={() => {
      recordInteraction('locale-toggle');
      onToggleLocale();
    }} />
    <main
      data-interaction-count={learnerBelief.interactionCount}
      className={`journey-main mx-auto flex w-full flex-1 flex-col gap-5 px-4 pt-6 pb-3 sm:gap-8 sm:px-6 sm:py-14 ${
        step === 'route' ? 'route-main max-w-none' : 'max-w-3xl'
      }`}
    >
      <div className={step === 'route' ? 'sr-only' : 'flex items-start gap-3'}>
        <header className="flex min-w-0 flex-col gap-2">
          <p className="text-sm text-neutral-500">
            {copy.learn.goalPrefix} · {goal}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {stepTitle}
          </h1>
        </header>
      </div>

      {step === 'prefs' ? (
        <PreferencesStep
          intake={intake}
          copy={copy}
          onIntakeChange={patchIntake}
          onSubmit={() => void analyzeIntake()}
        />
      ) : null}

      {step === 'analyzing' ? (
        <AnalysisStep
          copy={copy}
          errorCode={analysisError}
          onRetry={() => void analyzeIntake()}
          onContinueWithoutAi={continueWithoutAi}
        />
      ) : null}

      {step === 'challenge-intro' ? (
        <div className="flex flex-col gap-6">
          <DiagnosisSummary
            diagnosis={semanticDiagnosis}
            acceptedEvidence={acceptedEvidence}
            locale={locale}
            copy={copy}
          />
          <ChallengeIntroStep
            copy={copy}
            onStart={startChallenge}
            onSkip={skipChallenge}
          />
        </div>
      ) : null}

      {step === 'challenge' ? (
        <DiagnosticStep
          copy={copy}
          questionIndex={questionIndex}
          selectedIndex={diagSelected}
          onSelect={setDiagSelected}
          onSubmit={submitChallenge}
          onSkip={skipChallenge}
        />
      ) : null}

      {step === 'route' ? (
        <RouteStep
          goal={goal}
          levelLabel={levelLabel}
          styleLabel={styleLabel}
          masteredTitles={masteredTitles}
          pathTitles={path.map((id) => {
            const concept = conceptById.get(id);
            return concept ? getConceptTitle(concept, locale) : id;
          })}
          pathIds={path}
          view={graphView}
          selectedConceptId={selectedConceptId}
          locale={locale}
          copy={copy}
          onStartLesson={openLesson}
          onSelectNode={(conceptId) => {
            setSelectedConceptId(conceptId);
            recordInteraction('graph-select');
          }}
          onToggleUpcoming={() => recordInteraction('content-expand')}
          onRestart={restart}
        />
      ) : null}

      {step === 'lesson' && activeLesson && activeConceptId ? (
        <LessonStep
          conceptTitle={activeTitle}
          nextConceptTitle={nextConceptTitle}
          copy={copy}
          locale={locale}
          lesson={activeLesson}
          style={intake.explanationStyle}
          stableLevel={lessonSnapshotLevel}
          overrideDensity={overrideDensity}
          onOverrideDensity={handleDensityChange}
          explainer={{
            evidenceSource: openAccepted ? 'open-answer' : 'quick-quiz',
            stableLevelBefore: lessonSnapshotLevel,
            stableLevelAfter: learnerBelief.stableLevel,
            pendingLevel: learnerBelief.pendingLevel,
            pendingLevelCount: learnerBelief.pendingLevelCount,
            requiredConsecutiveEvidence: LEARNER_BELIEF_PARAMS.requiredConsecutiveEvidence,
          }}
          openAnswerMode={openAnswerMode}
          openAnswerText={openAnswerText}
          openLoading={openLoading}
          openError={openError}
          openAssessment={openAssessment}
          openAccepted={openAccepted}
          useQuizFallback={useQuizFallback}
          onOpenAnswerModeChange={setOpenAnswerMode}
          onOpenAnswerTextChange={setOpenAnswerText}
          onOpenSubmit={submitLessonAssessment}
          onOpenEdit={() => {
            recordInteraction('retry');
            setOpenAssessment(null);
            setOpenError(null);
            setOpenAccepted(false);
          }}
          onUseQuiz={() => {
            recordInteraction('content-expand');
            setUseQuizFallback(true);
          }}
          onReturnToOpen={() => {
            setUseQuizFallback(false);
            setOpenError(null);
            setOpenAssessment(null);
          }}

          quizSelected={quizSelected}
          quizChecked={quizChecked}
          isQuizCorrect={quizCorrect}
          quizAttempts={quizAttempts}
          pathBefore={pathBefore}
          pathAfter={path.length}
          onSelectChoice={setQuizSelected}
          onSubmitQuiz={submitLessonQuiz}
          onRetry={retryLessonQuiz}
          onContinueNext={continueNextLesson}
          onViewRoute={viewRoute}
          onIllustrationInteract={() => recordInteraction('content-expand')}
        />
      ) : null}
    </main>
    </>
  );
}
