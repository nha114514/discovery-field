import type {
  AnswerMode,
  ExplanationStyle,
  Level,
  Locale,
} from '@/lib/domain/learner-intake';
import type { DiagnosisClientErrorCode } from '@/lib/client/request-diagnosis';
import type { AssessmentClientErrorCode } from '@/lib/client/request-lesson-assessment';
import type { CommunicationStyle } from '@/lib/domain/semantic-diagnostic';

export type { AnswerMode, ExplanationStyle, Level, Locale };

export interface EntryCopy {
  home: {
    title: string;
    intro: string;
    goalLabel: string;
    goalPlaceholder: string;
    submit: string;
    quickGoalsLabel: string;
    languageToggleLabel: string;
    availableNow: string;
    tryLiveDemo: string;
    comingSoon: string;
    fourierGoal: string;
    tcpGoal: string;
  };
  learn: {
    unsupportedTitle: string;
    unsupportedBody: string;
    tryTransformer: string;
    backHome: string;
    goalPrefix: string;
    steps: {
      prefs: string;
      analyzing: string;
      challengeChoice: string;
      challenge: string;
      route: string;
      lesson: string;
    };
  };
  prefs: {
    honestyNotice: string;
    levelLegend: string;
    styleLegend: string;
    answerModeLegend: string;
    outcomeLabel: string;
    outcomePlaceholder: string;
    priorLabel: string;
    priorPlaceholder: string;
    continueLabel: string;
    selected: string;
  };
  analysis: {
    loadingTitle: string;
    loadingBody: string;
    errorTitle: string;
    errors: Record<DiagnosisClientErrorCode, string>;
    retry: string;
    continueWithoutAi: string;
  };
  diagnosis: {
    title: string;
    communicationStyleLabel: string;
    communicationStyles: Record<CommunicationStyle, string>;
    evidenceTitle: string;
    gapsTitle: string;
    evidenceScore: (score: number) => string;
    noStrongEvidence: string;
    noGaps: string;
    disclaimer: string;
  };
  challenge: {
    introTitle: string;
    introBody: string;
    start: string;
    skip: string;
    progress: (current: number, total: number) => string;
    next: string;
    finish: string;
    referenceNote: string;
  };
  graph: {
    title: string;
    legend: string;
    swipeHint: string;
    status: {
      mastered: string;
      current: string;
      upcoming: string;
      notRequired: string;
      goal: string;
    };
    stepLabel: (n: number) => string;
    difficultyLabel: string;
    evidenceLabel: string;
    startLesson: string;
    exploreLesson: string;
    prerequisitesLabel: string;
    noPrerequisites: string;
    freeExploreNote: string;
  };
  route: {
    preference: string;
    masteredTitle: string;
    pathTitle: string;
    startHere: string;
    restart: string;
    completed: string;
    completedBody: string;
    noSteps: string;
    noMastered: string;
    upNext: string;
    upcomingRoadmap: (count: number) => string;
    roadmapPreview: (next: string, goal: string) => string;
    showAllSteps: string;
    hideSteps: string;
  };
  levels: Record<Level, string>;
  styles: Record<ExplanationStyle, string>;
  answerModes: Record<AnswerMode, { label: string; prompt: string }>;

  lesson: {
    currentLesson: string;
    fable: {
      explanation: string;
      metaphors: string;
    };
    sections: {
      explanation?: string;
      example: string;
      rigorous: string;
      mistake: string;
      idea?: string;
      simple?: string;
      analogy?: string;
      steps?: string;
    };
    quizLegend: string;
    selected: string;
    submitAnswer: string;
    correctHeading: string;
    incorrectHeading: string;
    masteredRouteMessage: (title: string, before: number, after: number) => string;
    correctNotMasteredMessage: string;
    incorrectMessage: (explanation: string) => string;
    continueNext: string;
    reinforceOnceMore: string;
    viewUpdatedRoute: string;
    backToMap: string;
    tryAgain: string;
    attempts: (count: number) => string;
    openAnswer: {
      title: string;
      explanation: string;
      answerLegend: string;
      answerPlaceholder: string;
      submit: string;
      loading: string;
      editAnswer: string;
      useQuiz: string;
      returnToOpen: string;
      errors: Record<AssessmentClientErrorCode, string>;
      rejectedGuidance: string;
    };
    routeChange: {
      stepsTransition: (before: number, after: number) => string;
      mastered: (concept: string) => string;
      next: (concept: string) => string;
      completed: string;
      explanation: string;
      adaptiveExplainer: {
        trigger: string;
        evidence: {
          quickQuiz: string;
          openAnswer: string;
        };
        graphPruned: (conceptTitle: string) => string;
        nextUnlocked: (nextConceptTitle: string) => string;
        nextCompleted: string;
        stableUnchanged: (level: string) => string;
        hysteresisPending: (
          targetLevel: string,
          count: number,
          remaining: number,
        ) => string;
        stableChanged: (before: string, after: string) => string;
        neutralPolicy: string;
      };
    };
    density: {
      legend: string;
      description: string;
      options: {
        focused: string;
        balanced: string;
        deep: string;
      };
    };
    densityOverride: {
      label: string;
      focused: string;
      balanced: string;
      deep: string;
      auto: string;
    };
  };
  diagnostics: readonly {
    question: string;
    choices: readonly string[];
  }[];
}

const zhDiagnostics = [
  {
    question: '向量最适合用来表示什么？',
    choices: ['一段纯文本', '一组有方向的数值', '一个数据库表', '一句自然语言'],
  },
  {
    question: '矩阵在神经网络里通常扮演什么角色？',
    choices: [
      '保存网页缓存',
      '编译源代码',
      '描述线性变换与参数',
      '管理用户会话',
    ],
  },
  {
    question: '概率取值的合理范围是？',
    choices: ['只能是整数', '任意负数', '必须大于 100', '0 到 1 之间'],
  },
  {
    question: '神经网络大致可以看成什么？',
    choices: [
      '固定不变的查找表',
      '可学习的函数近似器',
      '操作系统进程调度器',
      '文件压缩工具',
    ],
  },
  {
    question: '注意力机制主要在做什么？',
    choices: [
      '按相关性对信息加权汇总',
      '把文本翻译成二进制',
      '随机打乱序列顺序',
      '压缩图片像素',
    ],
  },
] as const;

const enDiagnostics = [
  {
    question: 'What is a vector best used to represent?',
    choices: [
      'A plain paragraph',
      'An ordered set of numbers with direction',
      'A database table',
      'A spoken sentence',
    ],
  },
  {
    question: 'What role do matrices usually play in neural networks?',
    choices: [
      'Storing web cache',
      'Compiling source code',
      'Describing linear transforms and parameters',
      'Managing user sessions',
    ],
  },
  {
    question: 'What is a reasonable range for a probability?',
    choices: [
      'Integers only',
      'Any negative number',
      'Must be greater than 100',
      'Between 0 and 1',
    ],
  },
  {
    question: 'Roughly speaking, what is a neural network?',
    choices: [
      'A fixed lookup table',
      'A learnable function approximator',
      'An OS process scheduler',
      'A file compression tool',
    ],
  },
  {
    question: 'What does attention mainly do?',
    choices: [
      'Weight and summarize information by relevance',
      'Translate text into binary',
      'Shuffle sequence order randomly',
      'Compress image pixels',
    ],
  },
] as const;

export const copy: Record<Locale, EntryCopy> = {
  zh: {
    home: {
      title: '从你会的地方，学懂 Transformer。',
      intro: '说说你已经知道什么，我们把接下来要学的知识连成一条路。',
      goalLabel: '学习目标',
      goalPlaceholder: '你想理解什么？',
      submit: '开始学习',
      quickGoalsLabel: '快捷目标',
      languageToggleLabel: '语言',
      availableNow: '现已支持',
      tryLiveDemo: '体验完整演示',
      comingSoon: '即将支持',
      fourierGoal: '傅里叶变换',
      tcpGoal: 'TCP',
    },
    learn: {
      unsupportedTitle: '暂未完整支持该目标',
      unsupportedBody: '比赛演示版当前完整支持 Transformer。',
      tryTransformer: '体验 Transformer',
      backHome: '返回首页',
      goalPrefix: '目标',
      steps: {
        prefs: '先了解你的起点',
        analyzing: '正在理解你的学习起点',
        challengeChoice: '要不要做一个小挑战？',
        challenge: '补充小挑战',
        route: '你的学习路线',
        lesson: '学习这一课',
      },
    },
    prefs: {
      honestyNotice:
        '了解您目前的情况很重要，请如实填写，谢谢。您不需要使用专业术语，像平常说话一样回答即可。',
      levelLegend: '你现在的程度',
      styleLegend: '你偏好的讲解方式',
      answerModeLegend: '你更习惯怎样表达？',
      outcomeLabel: '你希望学会后能做什么？',
      outcomePlaceholder: '例如：能看懂论文里的 Transformer，或能给同事讲清楚。',
      priorLabel: '你已经知道什么？哪里让你困惑？',
      priorPlaceholder: '例如：知道一点矩阵，但注意力总是看不懂。',
      continueLabel: '继续',
      selected: '已选',
    },
    analysis: {
      loadingTitle: '正在理解你的学习起点',
      loadingBody: '我们正在分析你展示出的知识证据，不会根据措辞判断能力。',
      errorTitle: '暂时无法完成 AI 分析',
      errors: {
        INVALID_REQUEST: '提交的信息不完整或格式有误，请检查后重试。',
        AI_NOT_CONFIGURED: '当前环境尚未启用 AI 分析，你可以选择继续生成路线。',
        AI_TIMEOUT: '分析超时了，可以重试，或暂不使用 AI 继续。',
        AI_UPSTREAM_ERROR: 'AI 服务暂时不可用，可以重试，或暂不使用 AI 继续。',
        AI_INVALID_OUTPUT: '分析结果无法解读，请重试，或暂不使用 AI 继续。',
        INTERNAL_ERROR: '出现了意外问题，请重试，或暂不使用 AI 继续。',
        NETWORK_ERROR: '网络连接失败，请检查网络后重试。',
        INVALID_RESPONSE: '服务器返回了无法识别的结果，请重试。',
      },
      retry: '重试',
      continueWithoutAi: '暂不使用 AI，继续',
    },
    diagnosis: {
      title: '我对你当前起点的理解',
      communicationStyleLabel: '表达方式',
      communicationStyles: {
        plain: '日常语言',
        'example-driven': '偏好举例',
        'step-by-step': '分步骤表达',
        technical: '技术表达',
        uncertain: '暂不确定',
      },
      evidenceTitle: '已展示的知识证据',
      gapsTitle: '可能需要补充',
      evidenceScore: (score) => `当前证据强度：${score}%`,
      noStrongEvidence: '暂时没有足够证据确认已掌握节点',
      noGaps: '暂未发现明确缺口',
      disclaimer:
        '这是根据当前证据形成的起点判断，不是对你能力的最终评价。',
    },
    challenge: {
      introTitle: '可选补充小挑战',
      introBody: '小挑战只是参考，不会单独决定你的水平。',
      start: '做一个补充小挑战',
      skip: '跳过，先生成路线',
      progress: (current, total) => `第 ${current} / ${total} 题`,
      next: '下一题',
      finish: '完成小挑战',
      referenceNote: '小挑战只是参考，不会单独决定你的水平。',
    },
    graph: {
      title: '你的知识地图',
      legend: '选一个知识点，看看它与哪些内容直接相连。所有课程都可以打开。',
      swipeHint: '图谱可左右滑动；在小屏幕上也可从下方列表选择。',
      status: {
        mastered: '已有理解证据',
        current: '建议先学',
        upcoming: '在建议路线中',
        notRequired: '可自由探索',
        goal: '目标',
      },
      stepLabel: (n) => `第 ${String(n).padStart(2, '0')} 步`,
      difficultyLabel: '难度',
      evidenceLabel: '当前证据',
      startLesson: '开始这一课',
      exploreLesson: '探索这一课',
      prerequisitesLabel: '直接前置知识',
      noPrerequisites: '这里可以直接开始。',
      freeExploreNote: '推荐路线只是建议，你可以从任何知识点开始。',
    },
    route: {
      preference: '学习偏好',
      masteredTitle: '检测为已掌握',
      pathTitle: '待学路线',
      startHere: '从这里开始',
      restart: '重新诊断',
      completed: '目标已完成',
      completedBody:
        '你已经掌握通往目标的全部前置知识。可以重新诊断，或返回首页换个目标。',
      noSteps: '没有新的学习步骤了。',
      noMastered: '这次还没有识别出已掌握的知识，我们可以从基础开始。',
      upNext: '当前待学',
      upcomingRoadmap: (count) => `后续路线（${count} 个步骤）`,
      roadmapPreview: (next, goal) => `下一站：${next} · 最终目标：${goal}`,
      showAllSteps: '展开全部步骤',
      hideSteps: '收起后续步骤',
    },
    levels: {
      beginner: '第一次接触',
      some: '知道一点',
      solid: '已有基础',
    },
    styles: {
      story: '故事类比',
      visual: '图示直觉',
      rigorous: '严谨推导',
    },
    answerModes: {
      freeform: {
        label: '用自己的话',
        prompt: '想到什么写什么，用日常语言就好。',
      },
      example: {
        label: '举一个例子',
        prompt: '写一个你见过或能想到的具体例子。',
      },
      steps: {
        label: '分步骤说明',
        prompt: '按先后顺序写出你理解的步骤。',
      },
      technical: {
        label: '用公式、代码或专业语言',
        prompt: '可以用你熟悉的术语、符号或代码片段。',
      },
      unsure: {
        label: '不知道怎样回答',
        prompt: '没关系，你可以直接继续，后面会用更基础的方式讲解。',
      },
    },

    lesson: {
      currentLesson: '当前课程',
      fable: {
        explanation: '这到底是什么',
        metaphors: '故事里谁是谁',
      },
      sections: {
        example: '具体示例',
        rigorous: '深入解析',
        mistake: '常见误区',
        idea: '一句话核心',
        simple: '零基础解释',
        analogy: '生活类比',
        steps: '理解步骤',
      },
      quizLegend: '课堂小测',
      selected: '已选',
      submitAnswer: '提交答案',
      correctHeading: '答对了',
      incorrectHeading: '再想一想',
      masteredRouteMessage: (title, before, after) => `你掌握了「${title}」，路线从 ${before} 步缩短为 ${after} 步。`,
      correctNotMasteredMessage: '答对了，掌握度有提升。再巩固一次就能进入下一节点。',
      incorrectMessage: (explanation) => `还没关系，看懂解释再试一次。${explanation}`,
      continueNext: '继续下一课',
      reinforceOnceMore: '再巩固一次',
      viewUpdatedRoute: '查看新路线',
      backToMap: '返回知识地图',
      tryAgain: '再试一次',
      attempts: (count) => `已尝试 ${count} 次`,
      openAnswer: {
        title: '检测你的理解',
        explanation: '请解释这个概念来展示你的理解。',
        answerLegend: '你的回答',
        answerPlaceholder: '在这里输入你的解释...',
        submit: '提交答案',
        loading: '正在评估...',
        editAnswer: '修改答案',
        useQuiz: '使用快捷测验',
        returnToOpen: '返回开放式解释',
        errors: {
          INVALID_REQUEST: '提交的信息不完整或格式有误。',
          AI_NOT_CONFIGURED: '当前环境尚未启用 AI 分析，请使用快捷测验。',
          AI_TIMEOUT: '评估超时了，可以重试或使用快捷测验。',
          AI_UPSTREAM_ERROR: 'AI 服务暂时不可用。',
          AI_INVALID_OUTPUT: '评估结果无法解读，请重试。',
          INTERNAL_ERROR: '出现了意外问题，请重试。',
          NETWORK_ERROR: '网络连接失败，请检查网络后重试。',
          INVALID_RESPONSE: '服务器返回了无法识别的结果，请重试。',
        },
        rejectedGuidance: '你的回答未被接受。请提供更具体的解释或例子。',
      },
      routeChange: {
        stepsTransition: (before, after) => `${before} 步 → ${after} 步`,
        mastered: (concept) => `已掌握「${concept}」`,
        next: (concept) => `下一课：${concept}`,
        completed: '目标已完成',
        explanation: '你展示出的知识证明你不需要重复学习这些概念，因此你的路线已缩短。',
        adaptiveExplainer: {
          trigger: '我的路线为什么改变了？',
          evidence: {
            quickQuiz: '这次快捷测验的回答被记为知识证据。',
            openAnswer: '你通过审核的解释被记为知识证据。',
          },
          graphPruned: (conceptTitle) => `你已掌握「${conceptTitle}」，因此它已从剩余学习路线中移除，但仍会保留在完整知识图谱中。`,
          nextUnlocked: (nextConceptTitle) => `「${nextConceptTitle}」现在是前置条件已满足的下一项推荐内容。`,
          nextCompleted: '你的学习路线已完成。',
          stableUnchanged: (level) => `你的整体课程详细程度仍为「${level}」。这次结果更新了概念掌握度，但还没有形成足够一致的证据来改变整体学习水平。`,
          hysteresisPending: (targetLevel, count, remaining) =>
            `当前证据倾向于「${targetLevel}」。这是连续 ${count + remaining} 次证据中的第 ${count} 次；还需要 ${remaining} 次，稳定阶段才会改变。`,
          stableChanged: (before, after) => `在获得一致的知识证据后，你的默认课程详细程度已从「${before}」变更为「${after}」。`,
          neutralPolicy: '浏览内容、切换语言和普通点击都不会被当作知识证据。',
        },
      },
      density: {
        legend: '课程详细程度',
        description: '本节课会根据你最近的学习情况选择默认详细程度，你可以随时调整。',
        options: {
          focused: '精简',
          balanced: '均衡',
          deep: '深入',
        },
      },
      densityOverride: {
        label: '内容密度',
        focused: '精简版',
        balanced: '均衡版',
        deep: '深度版',
        auto: '自动',
      },
    },
    diagnostics: zhDiagnostics,
  },
  en: {
    home: {
      title: 'Understand Transformers from where you are.',
      intro: 'Tell us what you know. We’ll show the ideas that connect to your goal.',
      goalLabel: 'Learning goal',
      goalPlaceholder: 'What do you want to understand?',
      submit: 'Start learning',
      quickGoalsLabel: 'Quick goals',
      languageToggleLabel: 'Language',
      availableNow: 'Available now',
      tryLiveDemo: 'Try the live demo',
      comingSoon: 'Coming soon',
      fourierGoal: 'Fourier Transform',
      tcpGoal: 'TCP',
    },
    learn: {
      unsupportedTitle: 'This goal is not fully supported yet',
      unsupportedBody:
        'The demo currently supports Transformer in full.',
      tryTransformer: 'Try Transformer',
      backHome: 'Back home',
      goalPrefix: 'Goal',
      steps: {
        prefs: 'Tell us where you are',
        analyzing: 'Understanding where you are',
        challengeChoice: 'Want a short optional challenge?',
        challenge: 'Optional challenge',
        route: 'Your learning path',
        lesson: 'Learn this concept',
      },
    },
    prefs: {
      honestyNotice:
        'Understanding where you are right now is important. Please answer honestly—thank you. You do not need technical words; answer in your own way.',
      levelLegend: 'Your current level',
      styleLegend: 'How you prefer explanations',
      answerModeLegend: 'How do you like to express yourself?',
      outcomeLabel: 'What do you want to be able to do after learning?',
      outcomePlaceholder:
        'For example: read a Transformer paper, or explain it to a teammate.',
      priorLabel: 'What do you already know? What confuses you?',
      priorPlaceholder:
        'For example: I know a bit of matrices, but attention still confuses me.',
      continueLabel: 'Continue',
      selected: 'Selected',
    },
    analysis: {
      loadingTitle: 'Understanding where you are',
      loadingBody:
        'We are analyzing the knowledge evidence you shared. We do not judge ability from wording.',
      errorTitle: 'AI analysis is temporarily unavailable',
      errors: {
        INVALID_REQUEST:
          'The submitted information is incomplete or invalid. Please check and try again.',
        AI_NOT_CONFIGURED:
          'AI analysis is not enabled in this environment. You can continue without it.',
        AI_TIMEOUT:
          'Analysis timed out. You can retry, or continue without AI.',
        AI_UPSTREAM_ERROR:
          'The AI service is temporarily unavailable. You can retry, or continue without AI.',
        AI_INVALID_OUTPUT:
          'The analysis result could not be read. You can retry, or continue without AI.',
        INTERNAL_ERROR:
          'Something unexpected happened. You can retry, or continue without AI.',
        NETWORK_ERROR: 'Network request failed. Please check your connection and retry.',
        INVALID_RESPONSE:
          'The server returned an unrecognized result. Please retry.',
      },
      retry: 'Retry',
      continueWithoutAi: 'Continue without AI',
    },
    diagnosis: {
      title: 'My understanding of where you are',
      communicationStyleLabel: 'Expression style',
      communicationStyles: {
        plain: 'Everyday language',
        'example-driven': 'Example-driven',
        'step-by-step': 'Step-by-step',
        technical: 'Technical',
        uncertain: 'Not sure yet',
      },
      evidenceTitle: 'Knowledge evidence you showed',
      gapsTitle: 'Gaps you may want to fill',
      evidenceScore: (score) => `Evidence strength: ${score}%`,
      noStrongEvidence:
        'Not enough evidence yet to confirm mastered concepts',
      noGaps: 'No clear gaps found yet',
      disclaimer:
        'This is a starting-point judgment from current evidence, not a final evaluation of your ability.',
    },
    challenge: {
      introTitle: 'Optional mini-challenge',
      introBody:
        'The challenge is only a reference. It will not decide your level by itself.',
      start: 'Take the mini-challenge',
      skip: 'Skip and build my path',
      progress: (current, total) => `Question ${current} of ${total}`,
      next: 'Next',
      finish: 'Finish challenge',
      referenceNote:
        'The challenge is only a reference. It will not decide your level by itself.',
    },
    graph: {
      title: 'Your knowledge map',
      legend: 'Select a concept to see its direct connections. Every lesson is open.',
      swipeHint: 'Scroll sideways through the map, or use the list on a smaller screen.',
      status: {
        mastered: 'Evidence shown',
        current: 'Recommended next',
        upcoming: 'On your route',
        notRequired: 'Explore freely',
        goal: 'Goal',
      },
      stepLabel: (n) => `Step ${String(n).padStart(2, '0')}`,
      difficultyLabel: 'Difficulty',
      evidenceLabel: 'Current evidence',
      startLesson: 'Start this lesson',
      exploreLesson: 'Explore lesson',
      prerequisitesLabel: 'Direct prerequisites',
      noPrerequisites: 'You can start here.',
      freeExploreNote: 'The route is a suggestion. You can start with any concept.',
    },
    route: {
      preference: 'Learning preference',
      masteredTitle: 'Knowledge already demonstrated',
      pathTitle: 'Your learning path',
      startHere: 'Start here',
      restart: 'Diagnose again',
      completed: 'Goal completed',
      completedBody:
        'You have mastered all prerequisites toward the goal. You can diagnose again or choose another goal from home.',
      noSteps: 'No learning steps remain.',
      noMastered:
        'No mastered concepts were identified yet. We can start from the basics.',
      upNext: 'Up next',
      upcomingRoadmap: (count) => `Upcoming steps (${count})`,
      roadmapPreview: (next, goal) => `Next: ${next} · Final goal: ${goal}`,
      showAllSteps: 'Show all steps',
      hideSteps: 'Collapse steps',
    },
    levels: {
      beginner: 'First time seeing this',
      some: 'Know a little',
      solid: 'Already have a foundation',
    },
    styles: {
      story: 'Stories & analogies',
      visual: 'Visual intuition',
      rigorous: 'Rigorous derivation',
    },
    answerModes: {
      freeform: {
        label: 'In my own words',
        prompt: 'Write whatever comes to mind in everyday language.',
      },
      example: {
        label: 'Give an example',
        prompt: 'Describe one concrete example you have seen or can imagine.',
      },
      steps: {
        label: 'Explain step by step',
        prompt: 'List the steps in the order you understand them.',
      },
      technical: {
        label: 'Use formulas, code, or technical language',
        prompt: 'Feel free to use terms, symbols, or code you know.',
      },
      unsure: {
        label: 'Not sure how to answer',
        prompt:
          'That is okay. You can continue, and explanations will stay beginner-friendly.',
      },
    },

    lesson: {
      currentLesson: 'Current lesson',
      fable: {
        explanation: 'What was this really about?',
        metaphors: 'Who was who in the story',
      },
      sections: {
        example: 'Worked example',
        rigorous: 'Technical detail',
        mistake: 'Common pitfall',
        idea: 'Core idea',
        simple: 'Simple explanation',
        analogy: 'Analogy',
        steps: 'Steps to understand',
      },
      quizLegend: 'Quick quiz',
      selected: 'Selected',
      submitAnswer: 'Submit answer',
      correctHeading: 'Correct',
      incorrectHeading: 'Think again',
      masteredRouteMessage: (title, before, after) => `You mastered "${title}". The path is shortened from ${before} steps to ${after} steps.`,
      correctNotMasteredMessage: 'Correct! Your mastery increased. Reinforce it once more to advance.',
      incorrectMessage: (explanation) => `Not quite. Read the explanation and try again. ${explanation}`,
      continueNext: 'Continue to next lesson',
      reinforceOnceMore: 'Reinforce once more',
      viewUpdatedRoute: 'View updated path',
      backToMap: 'Back to knowledge map',
      tryAgain: 'Try again',
      attempts: (count) => `Attempted ${count} time${count === 1 ? '' : 's'}`,
      openAnswer: {
        title: 'Check your understanding',
        explanation: 'Explain this concept to demonstrate your understanding.',
        answerLegend: 'Your answer',
        answerPlaceholder: 'Type your explanation here...',
        submit: 'Submit answer',
        loading: 'Evaluating...',
        editAnswer: 'Edit answer',
        useQuiz: 'Use quick quiz instead',
        returnToOpen: 'Return to open explanation',
        errors: {
          INVALID_REQUEST: 'The submitted information is incomplete or invalid.',
          AI_NOT_CONFIGURED: 'AI analysis is not enabled. Please use the quick quiz.',
          AI_TIMEOUT: 'Evaluation timed out. You can retry or use the quick quiz.',
          AI_UPSTREAM_ERROR: 'The AI service is temporarily unavailable.',
          AI_INVALID_OUTPUT: 'The evaluation result could not be read. Please retry.',
          INTERNAL_ERROR: 'Something unexpected happened. Please retry.',
          NETWORK_ERROR: 'Network request failed. Please check your connection.',
          INVALID_RESPONSE: 'The server returned an unrecognized result. Please retry.',
        },
        rejectedGuidance: 'Your answer was not accepted. Please provide a more specific explanation or example.',
      },
      routeChange: {
        stepsTransition: (before, after) =>
          `${before} ${before === 1 ? 'step' : 'steps'} → ${after} ${after === 1 ? 'step' : 'steps'}`,
        mastered: (concept) => `${concept} mastered`,
        next: (concept) => `Next: ${concept}`,
        completed: 'Goal completed',
        explanation: 'Your demonstrated knowledge means you no longer need to repeat these concepts, so your route has been shortened.',
        adaptiveExplainer: {
          trigger: 'Why did my path change?',
          evidence: {
            quickQuiz: 'This quick-quiz answer counted as knowledge evidence.',
            openAnswer: 'Your accepted explanation counted as knowledge evidence.',
          },
          graphPruned: (conceptTitle) => `${conceptTitle} is mastered, so it was removed from your remaining learning route. It still stays visible in the full knowledge map.`,
          nextUnlocked: (nextConceptTitle) => `${nextConceptTitle} is now the next recommended concept whose prerequisites are ready.`,
          nextCompleted: 'Your learning route is now complete.',
          stableUnchanged: (level) => `Your overall lesson detail stays ${level}. This result updated concept mastery, but it was not enough consistent evidence to change your broader learning level.`,
          hysteresisPending: (targetLevel, count, remaining) =>
            `The current evidence points toward ${targetLevel}. This is ${count} of ${count + remaining} required consecutive pieces of evidence; ${remaining} more ${remaining === 1 ? 'is' : 'are'} needed before the stable level changes.`,
          stableChanged: (before, after) => `After consistent knowledge evidence, your default lesson detail changed from ${before} to ${after}.`,
          neutralPolicy: 'Browsing, language switching, and ordinary clicks never count as knowledge evidence.',
        },
      },
      density: {
        legend: 'Lesson detail',
        description: 'This lesson starts with a detail level based on your recent progress. You can change it anytime.',
        options: {
          focused: 'Focused',
          balanced: 'Balanced',
          deep: 'Deep',
        },
      },
      densityOverride: {
        label: 'Content density',
        focused: 'Focused',
        balanced: 'Balanced',
        deep: 'Deep',
        auto: 'Auto',
      },
    },
    diagnostics: enDiagnostics,
  },
};

export function getCopy(locale: Locale): EntryCopy {
  return copy[locale];
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === 'en' ? 'en' : 'zh';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'zh' ? 'en' : 'zh';
}
