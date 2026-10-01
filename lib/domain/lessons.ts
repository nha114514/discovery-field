import type { Locale, ExplanationStyle } from '@/lib/domain/learner-intake';

export interface LessonQuiz {
  question: string;
  choices: readonly string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonFable {
  title: string;
  story: readonly string[];
  reveal: string;
  explanation: string;
  metaphors: readonly { image: string; meaning: string }[];
}

export interface Lesson {
  conceptId: string;
  fable?: LessonFable;
  primaryExplanation: string;
  primaryExplanations: Record<ExplanationStyle, string>;
  oneSentenceIdea: string;
  simpleExplanation: string;
  analogy: string;
  steps: readonly string[];
  rigorousNote: string;
  workedExample: string;
  commonMistake: string;
  quiz: LessonQuiz;
}

export interface LocalizedLessonContent {
  fable?: LessonFable;
  primaryExplanation: string;
  primaryExplanations: Record<ExplanationStyle, string>;
  oneSentenceIdea: string;
  simpleExplanation: string;
  analogy: string;
  steps: readonly string[];
  rigorousNote: string;
  workedExample: string;
  commonMistake: string;
  quiz: {
    question: string;
    choices: readonly string[];
    explanation: string;
  };
}

export interface BilingualLesson {
  conceptId: string;
  quizCorrectIndex: number;
  zh: LocalizedLessonContent;
  en: LocalizedLessonContent;
}

export const bilingualLessons: readonly BilingualLesson[] = [
  {
    "conceptId": "numbers",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "想象你要向朋友讲清今天采摘了多少水果：如果没有具体的数，你只能含糊地说“很多”或“几只”。有了数字，你可以明确说出“摘了 3 个苹果、5 个梨，一共 8 个”，并能轻松算出还差几个装满篮子。在人工智能处理文字、音频或图像前，所有现实信息都会先换算成这样的数字，机器才能开始记录与运算。",
      "primaryExplanations": {
        "story": "想象你要向朋友讲清今天采摘了多少水果：如果没有具体的数，你只能含糊地说“很多”或“几只”。有了数字，你可以明确说出“摘了 3 个苹果、5 个梨，一共 8 个”，并能轻松算出还差几个装满篮子。在人工智能处理文字、音频或图像前，所有现实信息都会先换算成这样的数字，机器才能开始记录与运算。",
        "visual": "数字就像直尺上均匀标出的刻度线，从零开始沿着数轴一路向右延伸。每一个刻度都对应着一个确定的位置，两点之间的间隔清晰地标示出两数之差，比如 3 与 8 之间跨越了 5 个单位长度。数轴把抽象的多与少转化为直观的距离与分布，计算机正是借由这种坐标点来定位和衡量各种数据特征。",
        "rigorous": "数字是用于计数、测量与标定对象的基础数学抽象体系，涵盖了自然数、整数、有理数与实数等离散与连续集合。在数值计算中，数字构成了所有标量变量的取值基础，并遵循加法、乘法等严格定义的代数公理。计算机程序中通过定点数或浮点数编码对实数进行离散近似表示，为所有后续统计建模提供算术基石。"
      },
      "oneSentenceIdea": "数字用来表示数量和大小。",
      "simpleExplanation": "我们可以用数字回答“有多少”“多大”“多快”。买东西、看时间都离不开数字。",
      "analogy": "数字像尺子上的刻度，帮我们把“多少”说清楚。",
      "steps": [
        "认识整数和小数",
        "用数字描述身边事物",
        "比较大小与多少"
      ],
      "rigorousNote": "数字是数学中表示量的符号，常见有自然数、整数、有理数与实数。",
      "workedExample": "苹果 3 个、橘子 5 个，5 比 3 大，一共 8 个。",
      "commonMistake": "把数字和“个数”完全等同，忽略小数与负数。",
      "quiz": {
        "question": "下面哪一个最适合用数字直接表示？",
        "choices": [
          "一整段心情故事",
          "书包里铅笔的数量",
          "教室里的一幅画",
          "一个人的名字"
        ],
        "explanation": "数量关系最适合用数字刻画，其他选项更适合用文字或图像描述。"
      }
    },
    "en": {
      "primaryExplanation": "Imagine telling a friend about picking fruit without having any count words: you could only say you gathered \"a bunch\" or \"a few.\" Numbers let you say you picked 3 apples and 5 pears, making 8 total, and immediately see how many more fit in a basket. Before an artificial intelligence reads text, listens to voice recordings, or inspects photos, it first translates those raw inputs into numbers so it can track, compare, and calculate them.",
      "primaryExplanations": {
        "story": "Imagine telling a friend about picking fruit without having any count words: you could only say you gathered \"a bunch\" or \"a few.\" Numbers let you say you picked 3 apples and 5 pears, making 8 total, and immediately see how many more fit in a basket. Before an artificial intelligence reads text, listens to voice recordings, or inspects photos, it first translates those raw inputs into numbers so it can track, compare, and calculate them.",
        "visual": "Think of numbers as evenly spaced tick marks along a ruler stretching indefinitely from zero along a line. Each mark fixes an exact position, and the gap between any two marks gives you the physical distance between their values—like seeing that 8 sits exactly 5 units to the right of 3. This straight number line turns abstract amounts into concrete spatial intervals that computers use to map, plot, and compare data.",
        "rigorous": "A number is a fundamental mathematical object used to quantify, measure, and label entities across discrete and continuous domains such as natural numbers, integers, and real numbers. Within computational systems, numbers operate as scalar values that adhere to standard algebraic axioms of arithmetic and order. Because digital hardware possesses finite precision, real numbers are approximated using floating-point representations, establishing the quantitative baseline for all subsequent machine learning algorithms."
      },
      "oneSentenceIdea": "Numbers are used to represent quantities and magnitudes.",
      "simpleExplanation": "We use numbers to answer \"how many,\" \"how big,\" and \"how fast.\" We rely on them for everything from shopping to telling time.",
      "analogy": "Numbers are like tick marks on a ruler, helping us precisely communicate \"how much.\"",
      "steps": [
        "Understand integers and decimals",
        "Use numbers to describe things around us",
        "Compare magnitude and quantity"
      ],
      "rigorousNote": "A number is a mathematical object used to count, measure, and label, including natural numbers, integers, rational numbers, and real numbers.",
      "workedExample": "3 apples and 5 oranges. 5 is greater than 3. Together they make 8.",
      "commonMistake": "Equating numbers only with \"counting items,\" ignoring decimals and negative numbers.",
      "quiz": {
        "question": "Which of the following is best represented directly by a number?",
        "choices": [
          "An emotional story",
          "The quantity of pencils in a backpack",
          "A painting in a classroom",
          "A person's name"
        ],
        "explanation": "Quantitative relationships are best described using numbers, while the other options are better described using text or images."
      }
    }
  },
  {
    "conceptId": "variables",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "去超市结账时，收银台上的小票模板早就印好了“单价 × 数量 = 总价”，而括号里的具体金额只有扫码那一瞬间才会填入。这里的“单价”和“数量”就是变量：它们事先占好位置，不管你今天买的是 3 元的矿泉水还是 15 元的面包，同一套计算逻辑都能通用。变量让程序在面对未知的现实数据时，不必每次都重写计算过程。",
      "primaryExplanations": {
        "story": "去超市结账时，收银台上的小票模板早就印好了“单价 × 数量 = 总价”，而括号里的具体金额只有扫码那一瞬间才会填入。这里的“单价”和“数量”就是变量：它们事先占好位置，不管你今天买的是 3 元的矿泉水还是 15 元的面包，同一套计算逻辑都能通用。变量让程序在面对未知的现实数据时，不必每次都重写计算过程。",
        "visual": "变量就像一排整齐贴有名称标签的储物盒，盒外写着标签名，盒内则存放着当前装入的数值。当你把盒中原本的 5 取出并换成 12 时，盒子本身的位置与标签丝毫未变，但后续读取这个盒子的操作都会立即使用最新的 12。在数据流图或流程结构中，变量就像一个个承接管道流向的蓄水槽，在不同时刻灵活储存变化的数值。",
        "rigorous": "变量是程序与数学表达式中用于引用可变数据的命名符号或内存占位符。它具备明确的符号名称、定义域或数据类型，并在程序执行或代数变换过程中绑定特定的标量或复合值。在机器学习模型中，变量既包含输入样本构成的自变量，也包含训练过程中不断被迭代调整的内部权重与偏置参数。"
      },
      "oneSentenceIdea": "变量用一个符号代表可以变化的量。",
      "simpleExplanation": "当我们不知道具体数值，或数值会变时，就用字母如 x、y 来表示它。",
      "analogy": "变量像一个“空盒子”，可以放进不同的数字。",
      "steps": [
        "用字母表示未知量",
        "给变量代入具体数值",
        "观察变量变化带来的结果"
      ],
      "rigorousNote": "变量是在一定范围内可取不同值的符号，是代数表达的基本对象。",
      "workedExample": "设苹果单价为 x 元，买 3 个需要 3x 元；若 x=2，则是 6 元。",
      "commonMistake": "把变量当成固定不变的某一个数。",
      "quiz": {
        "question": "为什么要使用变量？",
        "choices": [
          "为了把问题变复杂",
          "为了表示会变化或未知的量",
          "为了少写汉字",
          "为了画图更好看"
        ],
        "explanation": "变量的核心作用是表示未知量或可变化的量，便于建立一般关系。"
      }
    },
    "en": {
      "primaryExplanation": "When a grocery register calculates your receipt, its formula already reads \"unit price times quantity equals total\" long before you place items on the belt. Here, \"unit price\" and \"quantity\" are variables: they hold empty slots for whatever you decide to purchase, letting the exact same calculation handle a two-dollar apple or a ten-dollar melon. Variables allow us to write a single rule ahead of time that works reliably with values that arrive later.",
      "primaryExplanations": {
        "story": "When a grocery register calculates your receipt, its formula already reads \"unit price times quantity equals total\" long before you place items on the belt. Here, \"unit price\" and \"quantity\" are variables: they hold empty slots for whatever you decide to purchase, letting the exact same calculation handle a two-dollar apple or a ten-dollar melon. Variables allow us to write a single rule ahead of time that works reliably with values that arrive later.",
        "visual": "Picture variables as sturdy storage bins lined up on a shelf, each marked with a neat label on the front and holding a specific number inside. If you open a bin labeled speed, take out the card marked 40, and replace it with 65, the bin's identity never changes, but anything connected to it now reads the updated value. In diagrams of algorithms, variables act as junction boxes that hold and pass along changing values as data moves through the system.",
        "rigorous": "A variable is a symbolic identifier associated with a storage location or mathematical quantity that can take on different values within an admissible domain. In mathematical equations and computational models, variables parameterize functions, allowing algorithms to decouple computational logic from specific instances of data. In machine learning architectures, variables encompass both observed input data features and the internal trainable parameters adjusted during optimization."
      },
      "oneSentenceIdea": "A variable uses a symbol to represent a quantity that can change.",
      "simpleExplanation": "When we don't know an exact value, or when a value can vary, we use letters like x or y to represent it.",
      "analogy": "A variable is like an \"empty box\" where you can place different numbers.",
      "steps": [
        "Use letters to represent unknown quantities",
        "Substitute specific numbers into the variable",
        "Observe the outcome when the variable changes"
      ],
      "rigorousNote": "A variable is an alphabetic character representing a number, whose value is arbitrary or not fully specified, forming the foundation of algebra.",
      "workedExample": "If the price of an apple is x dollars, buying 3 apples costs 3x dollars. If x=2, the cost is 6 dollars.",
      "commonMistake": "Treating a variable as a single, fixed, unchanging number.",
      "quiz": {
        "question": "Why do we use variables?",
        "choices": [
          "To make problems more complicated",
          "To represent changing or unknown quantities",
          "To avoid writing words",
          "To make drawings look better"
        ],
        "explanation": "The core purpose of a variable is to represent an unknown or changeable quantity, making it easier to establish general relationships."
      }
    }
  },
  {
    "conceptId": "algebra",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "玩寻宝游戏时，你发现一张便签写着：“宝藏所在的步数加上 4，正好是 10 步”。虽然没有直接写出步数，但你只要从 10 里面扣掉 4，立刻就知道是 6 步。代数就是这样一套根据已知线索顺藤摸瓜寻找未知数的规则：只要我们用字母代表未知数，并按照等式两边同增同减的公平法则推导，隐藏的答案就会水落石出。",
      "primaryExplanations": {
        "story": "玩寻宝游戏时，你发现一张便签写着：“宝藏所在的步数加上 4，正好是 10 步”。虽然没有直接写出步数，但你只要从 10 里面扣掉 4，立刻就知道是 6 步。代数就是这样一套根据已知线索顺藤摸瓜寻找未知数的规则：只要我们用字母代表未知数，并按照等式两边同增同减的公平法则推导，隐藏的答案就会水落石出。",
        "visual": "代数可以直观地看作一架始终保持平衡的传统双盘天平。天平左盘放着一个神秘礼盒和 4 个一公斤砝码，右盘放着 10 个一公斤砝码，指针恰好居中；只要你从左右两盘同时拿走 4 个砝码，天平依然水平，而左盘的礼盒重量便与右盘剩下的 6 个砝码完全等价。这种左右同步增减或缩放的几何平衡，构成了代数推导的核心骨架。",
        "rigorous": "基础代数是研究符号操作、等式关系及未知量求解规律的数学分支，其核心基于等式的对称性与代数运算公理。通过在等式两侧同步施加同等算术运算（如加减逆元或乘除标量），可以在保持等价关系不变的前提下分离并解出目标变量。在机器学习中，代数构成了线性变换推导、目标函数构造以及反向传播链式法则推导的基本符号语言。"
      },
      "oneSentenceIdea": "基础代数用符号和等式描述数量关系。",
      "simpleExplanation": "代数把日常数量关系写成式子，方便计算和推理。",
      "analogy": "代数像配方：材料可以换，但关系式固定。",
      "steps": [
        "写出含有变量的式子",
        "利用等式两边同加同减",
        "解出变量的值"
      ],
      "rigorousNote": "代数研究数、变量与运算结构，等式变形保持解集不变。",
      "workedExample": "若 x+3=7，两边减 3，得 x=4。",
      "commonMistake": "只移项不改变符号，或两边操作不对称。",
      "quiz": {
        "question": "若 x + 5 = 12，则 x 等于？",
        "choices": [
          "5",
          "7",
          "12",
          "17"
        ],
        "explanation": "两边同时减去 5，得到 x=7。"
      }
    },
    "en": {
      "primaryExplanation": "Imagine solving a scavenger hunt clue that says: \"The steps to the hidden prize plus 4 equals 10.\" Even though the final answer is not stated outright, subtracting 4 from 10 immediately reveals that the prize is 6 steps away. Algebra provides a consistent set of detective rules: by assigning a symbol to the missing piece and performing identical steps on both sides of the statement, you can unravel hidden values without guesswork.",
      "primaryExplanations": {
        "story": "Imagine solving a scavenger hunt clue that says: \"The steps to the hidden prize plus 4 equals 10.\" Even though the final answer is not stated outright, subtracting 4 from 10 immediately reveals that the prize is 6 steps away. Algebra provides a consistent set of detective rules: by assigning a symbol to the missing piece and performing identical steps on both sides of the statement, you can unravel hidden values without guesswork.",
        "visual": "Visualize algebra as a two-pan balance scale hanging in perfect equilibrium. The left pan holds an unmarked wooden block along with four one-pound brass weights, while the right pan holds ten matching weights; if you lift four weights off both pans simultaneously, the scale stays level and reveals that the block balances six weights. This discipline of preserving balance while stripping away clutter visually anchors every algebraic manipulation.",
        "rigorous": "Elementary algebra formalizes the manipulation of mathematical symbols and the systematic solution of equations governed by field axioms. By applying identical, invertible operations across an equality relation, one can isolate specified variables while preserving the solution set. In computational machine learning, algebra supplies the foundational framework for parameterizing models, structuring loss formulations, and deriving analytical gradients."
      },
      "oneSentenceIdea": "Basic algebra uses symbols and equations to describe quantitative relationships.",
      "simpleExplanation": "Algebra translates everyday numerical relationships into formulas, making calculation and reasoning easier.",
      "analogy": "Algebra is like a recipe: the ingredients can change, but the relationship is fixed.",
      "steps": [
        "Write expressions containing variables",
        "Apply identical operations to both sides of an equation",
        "Solve for the value of the variable"
      ],
      "rigorousNote": "Algebra studies numbers, variables, and operational structures. Equation manipulation preserves the solution set.",
      "workedExample": "If x+3=7, subtract 3 from both sides to get x=4.",
      "commonMistake": "Moving a term to the other side without changing its sign, or performing asymmetric operations.",
      "quiz": {
        "question": "If x + 5 = 12, what does x equal?",
        "choices": [
          "5",
          "7",
          "12",
          "17"
        ],
        "explanation": "Subtract 5 from both sides to get x=7."
      }
    }
  },
  {
    "conceptId": "function",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "自动售货机就是生活中的经典函数：你投币按下“热可可”按钮，出货口就一定掉下一杯热可可，绝不会在输入确定时随机吐出一盒柠檬茶。函数本质上就是一条值得信赖的处理约定——只要你给它一个特定的输入，它就会按照固定规则加工，给出一个确切的输出。我们在计算机里构建的各种模型，本质上都是在寻找这样的规律加工器。",
      "primaryExplanations": {
        "story": "自动售货机就是生活中的经典函数：你投币按下“热可可”按钮，出货口就一定掉下一杯热可可，绝不会在输入确定时随机吐出一盒柠檬茶。函数本质上就是一条值得信赖的处理约定——只要你给它一个特定的输入，它就会按照固定规则加工，给出一个确切的输出。我们在计算机里构建的各种模型，本质上都是在寻找这样的规律加工器。",
        "visual": "把函数想象成一条带有进料斗与出料口的密封传送带机器。你在左侧投料口放入一个数字 x，机器内部的齿轮按既定方式运转，右侧出料口便滑出唯一的加工结果 y；在坐标平面上把每一对 (x, y) 描成点并连起来，就画出了一条清晰的曲线或直线。图像上的任意竖直线只能与这条线相交于一点，直观呈现了“一个输入对应唯一输出”的特性。",
        "rigorous": "函数是指定义域集合与值域集合之间的一种确定性二元映射关系，满足对于定义域内的每一个元素，值域中都存在且仅存在一个唯一元素与之对应。数学形式记为 y = f(x)，其中 x 为自变量，y 为因变量。在深度学习中，复杂神经网络本质上是由众多初等可微函数（如仿射变换与激活函数）复合而成的高维参数化函数逼近器。"
      },
      "oneSentenceIdea": "函数把每个输入映射到确定的输出。",
      "simpleExplanation": "同一输入永远得到同一输出，就像自动售货机：投入固定，取出固定。",
      "analogy": "函数像食谱：给定材料，按步骤做出确定的菜。",
      "steps": [
        "明确输入是什么",
        "按规则计算输出",
        "检查同一输入是否总是同结果"
      ],
      "rigorousNote": "函数 f:X→Y 对定义域内每个 x 指定唯一 y=f(x)。",
      "workedExample": "f(x)=2x：输入 3 得 6，输入 5 得 10。",
      "commonMistake": "认为同一个输入可以对应两个不同输出。",
      "quiz": {
        "question": "函数最重要的特征之一是？",
        "choices": [
          "输出可以随意",
          "同一输入得到确定输出",
          "必须是直线",
          "只能处理数字图形"
        ],
        "explanation": "函数要求输入与输出之间是确定且唯一的对应关系。"
      }
    },
    "en": {
      "primaryExplanation": "A vending machine is a great example of a function in daily life: press the button for sparkling water, and a bottle of sparkling water drops into the tray every single time. It never dispenses hot tea one minute and fruit juice the next for that same button. A function is simply a dependable rule of cause and effect: feed it a specific input, and it follows a fixed procedure to return one predictable output.",
      "primaryExplanations": {
        "story": "A vending machine is a great example of a function in daily life: press the button for sparkling water, and a bottle of sparkling water drops into the tray every single time. It never dispenses hot tea one minute and fruit juice the next for that same button. A function is simply a dependable rule of cause and effect: feed it a specific input, and it follows a fixed procedure to return one predictable output.",
        "visual": "Picture a function as a sealed processing machine positioned along an assembly line, with an infeed hopper on top and an exit chute at the bottom. Drop an input number x into the hopper, watch the internal machinery turn it into an output y, and plot each input-output pair as a dot on a grid to form a smooth curve. If you scan a vertical line across that graph, it will only ever cross the curve at a single point, visually demonstrating that each input yields exactly one output.",
        "rigorous": "A function is a formal binary relation between a domain set and a codomain set such that every element in the domain maps to precisely one element in the codomain, typically denoted as y = f(x). Functions can be composed sequentially, inverted when bijective, and evaluated across multidimensional spaces. In machine learning, neural networks serve as highly parameterized non-linear function approximators built by composing multiple differentiable transformations."
      },
      "oneSentenceIdea": "A function maps each input to a specific, determined output.",
      "simpleExplanation": "The same input will always yield the same output, just like a vending machine: if the input is fixed, the output is fixed.",
      "analogy": "A function is like a recipe: given specific ingredients, following the steps produces a specific dish.",
      "steps": [
        "Identify the input",
        "Calculate the output according to the rule",
        "Verify that identical inputs always yield identical outputs"
      ],
      "rigorousNote": "A function f:X→Y assigns exactly one element y=f(x) in Y to each element x in the domain X.",
      "workedExample": "For f(x)=2x: an input of 3 yields 6, and an input of 5 yields 10.",
      "commonMistake": "Thinking that a single input can correspond to two different outputs.",
      "quiz": {
        "question": "What is one of the most important characteristics of a function?",
        "choices": [
          "The output can be random",
          "The same input yields a determined output",
          "It must be a straight line",
          "It can only process digital graphics"
        ],
        "explanation": "A function requires a determined and unique mapping between an input and its output."
      }
    }
  },
  {
    "conceptId": "vector",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "如果要描述送餐员当前的位置与行动，单说“在 5 号大街”不够完整，单说“车速 20 码”也容易迷失。但如果说“向东行驶 2 公里，向北行驶 3 公里”，把两个数字写成 [2, 3]，方向与距离就一目了然了。这种把相关数值按照固定次序打包在一起的结构就是向量，它让计算机能够同时掌握事物的多面属性。",
      "primaryExplanations": {
        "story": "如果要描述送餐员当前的位置与行动，单说“在 5 号大街”不够完整，单说“车速 20 码”也容易迷失。但如果说“向东行驶 2 公里，向北行驶 3 公里”，把两个数字写成 [2, 3]，方向与距离就一目了然了。这种把相关数值按照固定次序打包在一起的结构就是向量，它让计算机能够同时掌握事物的多面属性。",
        "visual": "在坐标图纸上，向量就像一根从原点 (0, 0) 射向目标点 (2, 3) 的有向箭头。箭头的长度代表了它的大小，箭头的倾斜姿态指明了它的方向；即使把这根箭头在平面上平移，只要它的长度和朝向不变，它依然代表同一个向量。这种空间几何形象生动展示了数据是如何同时承载方向与强度的。",
        "rigorous": "向量是线性代数中向量空间的基本元素，在坐标表示下表现为一个有序的实数标量数组，记作 v ∈ R^n。向量既具备空间几何解释（包含欧氏模长与方向角），也具备代数解释（支持向量加法与标量数乘，满足向量空间公理）。在机器学习与自然语言处理中，特征向量常用于高维表征样本属性或词元特征。"
      },
      "oneSentenceIdea": "向量是一组按顺序排列的数值，可表示方向与幅度。",
      "simpleExplanation": "把多个相关数字排成一排，就得到向量。它能同时表达大小和方向。",
      "analogy": "向量像快递地址：省份、城市、街道按顺序一起决定目的地。",
      "steps": [
        "理解分量的含义",
        "用向量表示位置或特征",
        "比较向量的方向与长度"
      ],
      "rigorousNote": "向量是向量空间中的元素，可进行加法与数乘。",
      "workedExample": "速度向量 (3,4)：向东 3、向北 4，长度为 5。",
      "commonMistake": "忽略分量顺序，或把向量当成无序集合。",
      "quiz": {
        "question": "向量 (2, 5) 中数字的顺序重要吗？",
        "choices": [
          "不重要，可任意调换",
          "重要，顺序改变含义",
          "只有第一个重要",
          "只影响显示格式"
        ],
        "explanation": "向量分量有固定位置，顺序改变会得到不同向量。"
      }
    },
    "en": {
      "primaryExplanation": "If you are tracking a delivery drone, simply knowing it flew 5 miles does not tell you if it reached the hospital or went over the lake. Saying it flew \"3 miles east and 4 miles north\" groups two numbers into an ordered pair [3, 4] that captures both how far it traveled and where it was heading. A vector bundles related numbers together so an algorithm can understand multifaceted properties in one clean package.",
      "primaryExplanations": {
        "story": "If you are tracking a delivery drone, simply knowing it flew 5 miles does not tell you if it reached the hospital or went over the lake. Saying it flew \"3 miles east and 4 miles north\" groups two numbers into an ordered pair [3, 4] that captures both how far it traveled and where it was heading. A vector bundles related numbers together so an algorithm can understand multifaceted properties in one clean package.",
        "visual": "On a grid, a vector appears as an arrow starting at the origin (0, 0) and pointing straight to a target coordinate like (3, 4). The physical length of the arrow represents magnitude, while the angle it forms against the axes represents direction. Even if you slide that arrow around without turning or stretching it, it remains the same vector, giving algorithms a geometric way to represent multi-dimensional points in space.",
        "rigorous": "A vector is an element of a vector space over a field, conventionally represented in coordinate form as an ordered tuple of scalars v ∈ R^n. Mathematically, vectors support two closed operations—vector addition and scalar multiplication—which satisfy the distributive and associative axioms of linear algebra. In machine learning, vectors serve as feature arrays representing high-dimensional observations, latent states, and parameter gradients."
      },
      "oneSentenceIdea": "A vector is an ordered sequence of numbers that can represent direction and magnitude.",
      "simpleExplanation": "Lining up related numbers in a specific order creates a vector. It can express both size and direction simultaneously.",
      "analogy": "A vector is like a mailing address: state, city, and street in sequence collectively determine the destination.",
      "steps": [
        "Understand the meaning of its components",
        "Use vectors to represent positions or features",
        "Compare the direction and length of vectors"
      ],
      "rigorousNote": "A vector is an element of a vector space, subject to vector addition and scalar multiplication.",
      "workedExample": "A velocity vector (3,4): 3 units east, 4 units north, with a total length (magnitude) of 5.",
      "commonMistake": "Ignoring the order of components, or treating a vector as an unordered set.",
      "quiz": {
        "question": "Is the order of the numbers in the vector (2, 5) important?",
        "choices": [
          "No, they can be swapped freely",
          "Yes, changing the order changes the meaning",
          "Only the first number is important",
          "It only affects the display format"
        ],
        "explanation": "Vector components have fixed positions; changing their order yields a completely different vector."
      }
    }
  },
  {
    "conceptId": "sequence",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "日常说话中词语的先后次序至关重要：“猫抓老鼠”和“老鼠抓猫”用的汉字完全一样，意思却截然相反；做饭时“先放油再放菜”与“先放菜再放油”也会产生完全不同的菜品。序列就是这种带有严格前后位置或时间先后顺序的数据链条。计算机要理解人类语言或历史走势，首先必须认清每个数据在队伍里的位次。",
      "primaryExplanations": {
        "story": "日常说话中词语的先后次序至关重要：“猫抓老鼠”和“老鼠抓猫”用的汉字完全一样，意思却截然相反；做饭时“先放油再放菜”与“先放菜再放油”也会产生完全不同的菜品。序列就是这种带有严格前后位置或时间先后顺序的数据链条。计算机要理解人类语言或历史走势，首先必须认清每个数据在队伍里的位次。",
        "visual": "把序列想象成一列按固定间距驶入站台的火车车厢，车厢从头到尾按 1, 2, 3... 的编号一节扣着一节。第一节车厢装载第一个词，第二节车厢装载紧跟其后的词，车厢之间的挂钩牢牢锁定了彼此的前后依赖关系。在时间轴上，序列就像按时钟滴答依次排开的一排时间戳标记，顺序一旦错乱，整体轨迹就会支离破碎。",
        "rigorous": "序列是定义在有序离散索引集（如自然数子集）上的元素有序枚举，形式表示为 (x_1, x_2, ..., x_T)。与无序集合不同，序列中元素的排列次序具有语义重要性，且允许相同元素在不同位置重复出现。在时序建模与自然语言处理中，序列数据呈现出强烈的时序自相关性与局部依赖结构。"
      },
      "oneSentenceIdea": "序列是按位置或时间排好的一串数据。",
      "simpleExplanation": "一句话、一段旋律、一串传感器读数，都可以看成序列。",
      "analogy": "序列像排队：谁先谁后有明确次序。",
      "steps": [
        "识别元素的先后关系",
        "用位置索引访问元素",
        "观察相邻元素如何相互影响"
      ],
      "rigorousNote": "序列是定义在自然数索引集上的映射，顺序是其结构的一部分。",
      "workedExample": "句子“我爱学习”是 4 个 token 按顺序组成的序列。",
      "commonMistake": "打乱顺序后仍认为是同一序列。",
      "quiz": {
        "question": "下面哪一个是序列？",
        "choices": [
          "一张静止照片的像素集合（无序）",
          "按时间录制的语音采样点",
          "一堆乱放的积木",
          "只包含一个数字的箱子"
        ],
        "explanation": "语音采样按时间先后排列，构成典型序列。"
      }
    },
    "en": {
      "primaryExplanation": "Word order changes the entire story in everyday speech: \"the dog chased the boy\" and \"the boy chased the dog\" use identical words, but their meanings are opposites. In the kitchen, pouring oil into a hot pan before adding onions gives you a sauté, while reversing the order ruins the recipe. A sequence is an ordered chain where position matters just as much as content, which is why models must read data in order to understand text or audio.",
      "primaryExplanations": {
        "story": "Word order changes the entire story in everyday speech: \"the dog chased the boy\" and \"the boy chased the dog\" use identical words, but their meanings are opposites. In the kitchen, pouring oil into a hot pan before adding onions gives you a sauté, while reversing the order ruins the recipe. A sequence is an ordered chain where position matters just as much as content, which is why models must read data in order to understand text or audio.",
        "visual": "Picture a sequence as a passenger train moving along a track, where each numbered carriage carries one token and is linked tightly to the cars before and after it. Plotting these items along a timeline shows distinct steps marching from left to right at indices 1, 2, 3, and beyond. Swapping two adjacent train cars alters the entire configuration, illustrating how sequential structure preserves ordering constraints across time.",
        "rigorous": "A sequence is a formally ordered list of elements indexed by a countable set such as the integers, denoted (x_1, x_2, ..., x_T). Unlike mathematical sets where element order is arbitrary and duplicates are collapsed, sequences strictly enforce positional indexing and permit identical tokens at distinct coordinates. In deep learning for natural language and time series, modeling sequence structures requires capturing non-Markovian contextual dependencies across time steps."
      },
      "oneSentenceIdea": "A sequence is an ordered string of data, arranged by position or time.",
      "simpleExplanation": "A spoken sentence, a musical melody, or a string of sensor readings can all be seen as sequences.",
      "analogy": "A sequence is like waiting in line: there is a clear order of who comes first and who comes next.",
      "steps": [
        "Identify the sequential relationship of elements",
        "Use positional indices to access elements",
        "Observe how adjacent elements affect each other"
      ],
      "rigorousNote": "A sequence is a mapping whose domain is a set of natural numbers, where the order is an intrinsic part of its structure.",
      "workedExample": "The sentence \"I love learning\" is a sequence of 3 tokens arranged in order.",
      "commonMistake": "Believing it remains the same sequence even after the order is scrambled.",
      "quiz": {
        "question": "Which of the following is an example of a sequence?",
        "choices": [
          "An unordered set of pixels from a static photo",
          "Voice samples recorded sequentially over time",
          "A pile of randomly scattered blocks",
          "A box containing just a single number"
        ],
        "explanation": "Voice samples are ordered by time, making them a classic sequence."
      }
    }
  },
  {
    "conceptId": "probability",
    "quizCorrectIndex": 2,
    "zh": {
      "primaryExplanation": "明天出门要不要带伞？天气预报说降水概率是 80%，这意味着根据以往相似的气象条件，这类天气大概率会下雨，但并不保证绝对会有一场暴雨打湿你的衣服。概率就是用 0 到 1 之间的数值来量化不确定性：0 代表绝对不会发生，1 代表必定会发生，而中间的数值则帮我们在变幻莫测的现实世界中做出更理性的判断。",
      "primaryExplanations": {
        "story": "明天出门要不要带伞？天气预报说降水概率是 80%，这意味着根据以往相似的气象条件，这类天气大概率会下雨，但并不保证绝对会有一场暴雨打湿你的衣服。概率就是用 0 到 1 之间的数值来量化不确定性：0 代表绝对不会发生，1 代表必定会发生，而中间的数值则帮我们在变幻莫测的现实世界中做出更理性的判断。",
        "visual": "把概率想象成一个被分成不同色块的圆形幸运转盘，整个转盘的总面积恰好代表 1（即 100%）。如果标着“雨天”的蓝色扇形占据了转盘面积的 80%，那么飞镖随机扎中蓝色区域的面积比例就是 0.8。各种互斥可能性的概率拼在一起刚好填满整个圆盘，面积越大代表机会越高，生动展现了可能性的空间分配。",
        "rigorous": "概率是在柯尔莫哥洛夫公理化体系下，定义在样本空间事件域上的非负实值测度，满足非负性（P(A) >= 0）、规范性（P(Ω) = 1）以及可数可加性。它将不确定性严格限定在闭区间 [0, 1] 内。在统计学习与机器学习中，概率论为参数估计、贝叶斯推断、最大似然目标构建以及不确定性量化提供了公理化数学支撑。"
      },
      "oneSentenceIdea": "概率用 0 到 1 的数表示事件发生的可能性。",
      "simpleExplanation": "概率越接近 1 越可能发生，越接近 0 越难发生。",
      "analogy": "概率像天气预报里的降雨可能性。",
      "steps": [
        "明确随机事件",
        "估计或计算发生比例",
        "把结果限制在 0 到 1"
      ],
      "rigorousNote": "概率是样本空间上满足可列可加性的非负测度，全空间测度为 1。",
      "workedExample": "公平硬币正面概率为 0.5。",
      "commonMistake": "把概率当成百分数写成 50，或允许超过 1。",
      "quiz": {
        "question": "一个事件的概率最合理的是？",
        "choices": [
          "1.5",
          "-0.2",
          "0.7",
          "120%"
        ],
        "explanation": "概率取值应在 0 到 1 之间，0.7 合法。"
      }
    },
    "en": {
      "primaryExplanation": "When checking the morning weather forecast, an 80% chance of rain does not promise a torrential downpour at your doorstep, but it tells you that under identical conditions, eight days out of ten saw rain. Probability assigns a number between 0 and 1 to quantify uncertainty: 0 means impossible, 1 means guaranteed, and everything between helps us make practical, reasoned choices when outcomes are not completely certain.",
      "primaryExplanations": {
        "story": "When checking the morning weather forecast, an 80% chance of rain does not promise a torrential downpour at your doorstep, but it tells you that under identical conditions, eight days out of ten saw rain. Probability assigns a number between 0 and 1 to quantify uncertainty: 0 means impossible, 1 means guaranteed, and everything between helps us make practical, reasoned choices when outcomes are not completely certain.",
        "visual": "Imagine probability as a circular wheel of fortune whose total surface area equals exactly 1.0 (or 100%). If an 80% chance of rain is shaded dark blue, that wedge occupies four-fifths of the total circle, leaving a modest one-fifth wedge for dry weather. Because the probabilities of all mutually exclusive events must fill the circle without gaps or overlaps, the relative slice sizes immediately communicate likelihood.",
        "rigorous": "Probability is a formal real-valued measure defined on a sigma-algebra of events over a sample space, governed by the Kolmogorov axioms of non-negativity (P(E) >= 0), normalization (P(Ω) = 1), and countable additivity. It bounds uncertainty within the continuous interval [0, 1]. In machine learning, probabilistic frameworks formalize likelihood estimation, loss formulation via cross-entropy, and principled reasoning under empirical uncertainty."
      },
      "oneSentenceIdea": "Probability uses a number from 0 to 1 to represent the likelihood of an event occurring.",
      "simpleExplanation": "The closer the probability is to 1, the more likely the event is to happen. The closer to 0, the less likely.",
      "analogy": "Probability is like the chance of rain in a weather forecast.",
      "steps": [
        "Define the random event",
        "Estimate or calculate the proportion of occurrence",
        "Bound the result strictly between 0 and 1"
      ],
      "rigorousNote": "Probability is a non-negative measure on a sample space that satisfies countable additivity, with the entire space having a measure of 1.",
      "workedExample": "The probability of a fair coin landing heads is 0.5.",
      "commonMistake": "Writing a probability as 50 instead of 50%, or allowing values greater than 1.",
      "quiz": {
        "question": "Which of the following is a reasonable probability for an event?",
        "choices": [
          "1.5",
          "-0.2",
          "0.7",
          "120%"
        ],
        "explanation": "Probabilities must be between 0 and 1, so 0.7 is the only valid answer."
      }
    }
  },
  {
    "conceptId": "derivative",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "骑自行车下坡时，你不仅关心已经骑了多远，更关心当下车速表上的数字——那是你在这一个瞬间的位置变化快慢。如果坡度变陡，车速可能在眨眼间激增；如果地势变平，车速就会缓和下来。导数正是用来衡量这种“瞬时变化率”的数学工具：它告诉你当输入参数稍微变动一点点时，输出结果会往哪个方向变化、变化有多剧烈。",
      "primaryExplanations": {
        "story": "骑自行车下坡时，你不仅关心已经骑了多远，更关心当下车速表上的数字——那是你在这一个瞬间的位置变化快慢。如果坡度变陡，车速可能在眨眼间激增；如果地势变平，车速就会缓和下来。导数正是用来衡量这种“瞬时变化率”的数学工具：它告诉你当输入参数稍微变动一点点时，输出结果会往哪个方向变化、变化有多剧烈。",
        "visual": "在弯弯曲曲的函数图像上，导数就是某一特定点处的切线斜率。如果把小球放在山坡曲线的某一点，切线就显示了那里的地面究竟有多斜：切线向上倾斜，代表斜率为正、图像正在爬升；切线水平，代表斜率为零、处于平缓拐点；切线向下倾斜，则代表数值正在下跌。斜率的陡峭程度直接反映了变化率的强弱。",
        "rigorous": "导数是微积分中用于刻画函数在某一点处局部瞬时变化率的核心概念，定义为自变量增量趋近于零时函数增量与自变量增量比值的极限：f'(x) = lim_{Δx->0} (f(x+Δx) - f(x)) / Δx。在几何上它对应曲线在切点处的斜率，在物理上对应瞬时速率。在深度学习中，目标函数对权重的偏导数构成了反向传播算法计算参数更新方向的数学核心。"
      },
      "oneSentenceIdea": "导数描述函数输出随输入变化的快慢。",
      "simpleExplanation": "导数告诉你：输入再增加一点点，输出大约变化多少。",
      "analogy": "导数像车速表：位置函数的导数就是速度。",
      "steps": [
        "观察输入微小变化",
        "估计输出变化量之比",
        "理解正负导数的含义"
      ],
      "rigorousNote": "f'(x)=lim[h→0](f(x+h)-f(x))/h，表示瞬时变化率。",
      "workedExample": "f(x)=x² 在 x=2 处导数为 4，说明此处增长较快。",
      "commonMistake": "把导数和函数值本身混为一谈。",
      "quiz": {
        "question": "导数主要告诉我们什么？",
        "choices": [
          "函数的名字",
          "输出随输入变化的快慢",
          "图像的颜色",
          "数据的存储位置"
        ],
        "explanation": "导数刻画的是变化率，即“变化有多快”。"
      }
    },
    "en": {
      "primaryExplanation": "Riding a bicycle down a steep hill makes you care deeply about your speedometer: you do not just want to know total distance traveled, but how quickly that distance is changing right this second. As the slope steepens, your velocity spikes instantly; when the path flattens, your speed stabilizes. A derivative measures this instantaneous rate of change, showing how sensitive an outcome is to the slightest nudge in an input.",
      "primaryExplanations": {
        "story": "Riding a bicycle down a steep hill makes you care deeply about your speedometer: you do not just want to know total distance traveled, but how quickly that distance is changing right this second. As the slope steepens, your velocity spikes instantly; when the path flattens, your speed stabilizes. A derivative measures this instantaneous rate of change, showing how sensitive an outcome is to the slightest nudge in an input.",
        "visual": "Picture a curving rollercoaster track drawn on a grid: at any single point along the rails, the derivative is represented by the slope of a flat plank placed tangentially against the curve. If the plank points uphill, the slope is positive; if it rests completely flat, the rate of change is zero; if it angles steeply downhill, the slope is a large negative number. This tangent angle gives an immediate visual read on the steepness and direction of travel.",
        "rigorous": "The derivative of a real-valued function measures its infinitesimal rate of change with respect to an independent variable, defined formally as the limit of the difference quotient: f'(x) = lim_{h->0} (f(x+h) - f(x)) / h. Geometrically, it yields the slope of the tangent line to the function graph at that point. In optimization for deep learning, partial derivatives form gradient vectors that guide parameter adjustments."
      },
      "oneSentenceIdea": "A derivative describes how quickly a function's output changes relative to its input.",
      "simpleExplanation": "The derivative tells you: if you increase the input by a tiny bit, roughly how much will the output change?",
      "analogy": "A derivative is like a car's speedometer: velocity is the derivative of position.",
      "steps": [
        "Observe a tiny change in the input",
        "Estimate the ratio of the resulting change in the output",
        "Understand the meaning of positive and negative derivatives"
      ],
      "rigorousNote": "f'(x) = lim[h→0] (f(x+h)-f(x))/h, representing the instantaneous rate of change.",
      "workedExample": "For f(x)=x², the derivative at x=2 is 4, indicating rapid growth at that point.",
      "commonMistake": "Confusing the derivative with the value of the function itself.",
      "quiz": {
        "question": "What does a derivative primarily tell us?",
        "choices": [
          "The name of the function",
          "How quickly the output changes as the input changes",
          "The color of a graph",
          "The storage location of data"
        ],
        "explanation": "A derivative characterizes the rate of change, i.e., \"how fast things are changing.\""
      }
    }
  },
  {
    "conceptId": "loss-function",
    "quizCorrectIndex": 0,
    "zh": {
      "primaryExplanation": "练习投篮时，你每次出手后都会观察篮球砸在篮筐的偏离程度：是偏左了三公分，还是用力过猛弹到了后板。这种“实际结果与完美进球之间的差距”就是你的反馈得分。损失函数在机器学习中扮演的就是这个严格的裁判角色：它把模型的预测答案与真实标准答案放在一起对比，算出一个误差惩罚分数，指引模型下一步如何改进。",
      "primaryExplanations": {
        "story": "练习投篮时，你每次出手后都会观察篮球砸在篮筐的偏离程度：是偏左了三公分，还是用力过猛弹到了后板。这种“实际结果与完美进球之间的差距”就是你的反馈得分。损失函数在机器学习中扮演的就是这个严格的裁判角色：它把模型的预测答案与真实标准答案放在一起对比，算出一个误差惩罚分数，指引模型下一步如何改进。",
        "visual": "把损失函数想象成靶场上的环形同心圆箭靶。正中央的十环代表零误差的完美预测，损失值为 0；箭矢落点距离靶心越远，所处的环数惩罚值就越大。优化算法的工作就像一位射手，不断观察落点在靶面上的距离偏差，寻找向靶心收敛的调整策略，把这个标靶距离尽可能缩小。",
        "rigorous": "损失函数（亦称目标函数或代价函数）是将模型预测输出与真实标签之间的差异映射为非负实数标量的数学函数，记作 L(y_hat, y)。常见的损失形式包括用于回归任务的均方误差（MSE）与用于分类任务的交叉熵损失。损失函数的值为模型优化器提供了可优化的数值标量，其参数梯度的反向传播直接决定了权重参数的更新轨迹。"
      },
      "oneSentenceIdea": "损失函数衡量预测结果与真实答案差多少。",
      "simpleExplanation": "训练模型时，需要一个分数说明“错得有多离谱”，这个分数就是损失。",
      "analogy": "损失像考试扣分：错得越多，扣分越高。",
      "steps": [
        "获得预测值与真值",
        "计算差距",
        "得到可比较的损失值"
      ],
      "rigorousNote": "损失函数 ℓ(ŷ,y) 将预测与标签映射为非负实数，供优化使用。",
      "workedExample": "预测 0.8、真值 1，平方损失为 (0.8-1)²=0.04。",
      "commonMistake": "以为损失越大模型越好；实际我们要降低损失。",
      "quiz": {
        "question": "训练中降低损失通常意味着？",
        "choices": [
          "预测更接近真实答案",
          "模型文件更大",
          "训练时间必然更短",
          "参数数量必须增加"
        ],
        "explanation": "损失下降表示预测误差变小，拟合更好。"
      }
    },
    "en": {
      "primaryExplanation": "When learning to shoot free throws, you immediately look at where the ball hits: did it strike the front rim, bounce off the backboard, or swish through the net? The physical distance from a clean basket acts as your error feedback. A loss function serves as an impartial referee in machine learning: it scores the gap between the model's guess and the true target, giving the algorithm a clear number to minimize.",
      "primaryExplanations": {
        "story": "When learning to shoot free throws, you immediately look at where the ball hits: did it strike the front rim, bounce off the backboard, or swish through the net? The physical distance from a clean basket acts as your error feedback. A loss function serves as an impartial referee in machine learning: it scores the gap between the model's guess and the true target, giving the algorithm a clear number to minimize.",
        "visual": "Envision a loss function as an archery target where the exact center bullseye represents zero error, meaning a perfect prediction with a loss score of zero. Every inch an arrow drifts away from that center rings up a higher numerical penalty score on the scoreboard. The training process visually corresponds to steering subsequent shots from the distant outer rings inward toward that bullseye center.",
        "rigorous": "A loss function maps a predicted model output y_hat and a ground-truth label y to a non-negative scalar cost value L(y_hat, y), quantifying the discrepancy between predictions and observations. Canonical formulations include mean squared error for regression and categorical cross-entropy for probabilistic classification. Minimizing this objective via empirical risk minimization provides the mathematical foundation for parameter estimation in statistical learning."
      },
      "oneSentenceIdea": "A loss function measures the difference between a model's prediction and the true answer.",
      "simpleExplanation": "When training a model, you need a score that says \"how wrong it was.\" That score is the loss.",
      "analogy": "Loss is like points deducted on a test: the more mistakes you make, the higher the deduction.",
      "steps": [
        "Obtain the prediction and the true value",
        "Calculate the gap between them",
        "Produce a comparable loss value"
      ],
      "rigorousNote": "A loss function ℓ(ŷ,y) maps predictions and true labels to a non-negative real number for optimization.",
      "workedExample": "With a prediction of 0.8 and a true value of 1, the squared loss is (0.8 - 1)² = 0.04.",
      "commonMistake": "Thinking a higher loss means a better model; in reality, we want to minimize the loss.",
      "quiz": {
        "question": "During training, what does lowering the loss usually mean?",
        "choices": [
          "Predictions are getting closer to the true answers",
          "The model file size is growing",
          "Training time will definitely be shorter",
          "The number of parameters must increase"
        ],
        "explanation": "A decreasing loss indicates that prediction errors are shrinking, meaning the model fits better."
      }
    }
  },
  {
    "conceptId": "matrix",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "学校要统计三个班级在语文、数学、英语三门考试中的平均成绩，最清晰的做法是列一张九宫格表格，行代表班级，列代表科目。如果要按权重给所有班级计算总评，只要拿这张表格整体去乘以各科权重即可。矩阵就是把许多数字按照行与列整齐排开的二维数据网格，它让计算机能够批量处理大批量的关联运算。",
      "primaryExplanations": {
        "story": "学校要统计三个班级在语文、数学、英语三门考试中的平均成绩，最清晰的做法是列一张九宫格表格，行代表班级，列代表科目。如果要按权重给所有班级计算总评，只要拿这张表格整体去乘以各科权重即可。矩阵就是把许多数字按照行与列整齐排开的二维数据网格，它让计算机能够批量处理大批量的关联运算。",
        "visual": "矩阵在几何上就像一台能够对整个空间施加拉伸、挤压或旋转的变形魔盒。把平面上的网格纸放入这个魔盒，矩阵乘法会把正方形网格平移或倾斜成平行四边形网格，但原点保持不动且所有网格线依然保持平行等距。这种对高维空间网格的齐步几何变换，正是矩阵在计算机图形与特征提取中最直观的体现。",
        "rigorous": "矩阵是由 m 行 n 列标量元素构成的二维矩形阵列，属于矩阵空间 R^{m x n}。矩阵不仅作为高维多变量数据的紧凑存储容器，其本质对应着有限维向量空间之间的线性映射算子。矩阵加法、数乘以及矩阵乘法遵循严密的结合律与分配律（但不满足交换律），构成了现代深度学习中张量张量计算的高性能代数引擎。"
      },
      "oneSentenceIdea": "矩阵是二维数值表，常用来表示线性变换。",
      "simpleExplanation": "把数字排成行和列，就能一次处理整组向量。",
      "analogy": "矩阵像多条传送带，同时把一批向量搬到新位置。",
      "steps": [
        "理解行与列",
        "用矩阵乘向量",
        "观察变换后的几何效果"
      ],
      "rigorousNote": "m×n 矩阵是实数的矩形阵列，乘法对应线性映射的复合。",
      "workedExample": "对向量 (1,0) 作用旋转矩阵，可得到新的方向向量。",
      "commonMistake": "矩阵乘法不满足随意交换顺序。",
      "quiz": {
        "question": "矩阵在神经网络中常用来做什么？",
        "choices": [
          "保存聊天记录",
          "实现线性变换与参数运算",
          "绘制界面按钮",
          "压缩磁盘文件"
        ],
        "explanation": "全连接层等操作本质是矩阵与向量的乘加运算。"
      }
    },
    "en": {
      "primaryExplanation": "When a school principal reviews grade averages across three classes and four academic subjects, writing the numbers in a neat table of rows and columns makes comparisons effortless. Calculating weighted final grades across all classes requires only a single operation against that whole grid. A matrix organizes numbers into rows and columns so that computers can manipulate large batches of data simultaneously instead of updating numbers one by one.",
      "primaryExplanations": {
        "story": "When a school principal reviews grade averages across three classes and four academic subjects, writing the numbers in a neat table of rows and columns makes comparisons effortless. Calculating weighted final grades across all classes requires only a single operation against that whole grid. A matrix organizes numbers into rows and columns so that computers can manipulate large batches of data simultaneously instead of updating numbers one by one.",
        "visual": "Geometrically, multiplying by a matrix transforms coordinate space like stretching or rotating a rubber graph sheet. A square grid drawn on the sheet can be sheared into angled parallelograms, stretched along one axis, or flipped around, yet grid lines stay straight and evenly spaced while the origin remains pinned down. This visual coordinate transformation captures how weight matrices reshape data spaces in neural layers.",
        "rigorous": "A matrix is a two-dimensional rectangular array of scalars arranged into m rows and n columns, denoted A ∈ R^{m x n}. Beyond operating as tabular data structures, matrices represent linear maps between finite-dimensional vector spaces. Matrix multiplication satisfies associativity and distributivity over addition but lacks commutativity, providing the computational and algebraic engine for batch tensor operations in deep learning."
      },
      "oneSentenceIdea": "A matrix is a two-dimensional grid of numbers, commonly used to represent linear transformations.",
      "simpleExplanation": "By arranging numbers in rows and columns, we can process entire groups of vectors at once.",
      "analogy": "A matrix is like multiple conveyor belts moving a batch of vectors to a new location simultaneously.",
      "steps": [
        "Understand rows and columns",
        "Multiply a vector by a matrix",
        "Observe the resulting geometric transformation"
      ],
      "rigorousNote": "An m×n matrix is a rectangular array of real numbers. Matrix multiplication corresponds to the composition of linear maps.",
      "workedExample": "Applying a rotation matrix to the vector (1,0) yields a new directional vector.",
      "commonMistake": "Assuming matrix multiplication is commutative (i.e., you cannot freely swap the order of matrices).",
      "quiz": {
        "question": "What are matrices typically used for in neural networks?",
        "choices": [
          "Saving chat logs",
          "Executing linear transformations and parameter calculations",
          "Drawing UI buttons",
          "Compressing disk files"
        ],
        "explanation": "Operations like fully connected layers are essentially matrix-vector multiplications."
      }
    }
  },
  {
    "conceptId": "dot-product",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "去超市采购时，你的购物单上写着商品数量向量 [2, 3]，货架标签上写着对应单价向量 [5, 4]；要算总花销，你把对应商品乘起来相加：2×5 + 3×4 = 22 元。点积正是这样一种对应位置相乘再求和的计算。它经常用来衡量两者是否步调一致，但需要格外注意的是：最终数值不仅取决于方向是否一致，还直接受到两边数字本身大小（向量长度）的影响。",
      "primaryExplanations": {
        "story": "去超市采购时，你的购物单上写着商品数量向量 [2, 3]，货架标签上写着对应单价向量 [5, 4]；要算总花销，你把对应商品乘起来相加：2×5 + 3×4 = 22 元。点积正是这样一种对应位置相乘再求和的计算。它经常用来衡量两者是否步调一致，但需要格外注意的是：最终数值不仅取决于方向是否一致，还直接受到两边数字本身大小（向量长度）的影响。",
        "visual": "在几何图形中，点积直观表现为一个向量投射在另一个向量方向上的阴影长度，再乘以底座向量的自身长度。当两根箭头朝向完全垂直时，投影完全缩成一个点，点积为 0；当它们朝向相近时，投影很长且重合度高。不过从几何上也能明显看出：如果其中一根箭头本身画得非常长，即便它们夹角很大，算出来的投影乘积依然可能很大。",
        "rigorous": "点积（内积）是定义在欧氏向量空间上的双线性对称二元运算，形式为 a · b = Σ a_i b_i = ||a|| ||b|| cos(θ)。它综合反映了两个向量之间的夹角余弦与各自的欧氏模长。因此，点积数值的绝对大小不仅取决于方向对齐程度，还严重依赖向量自身的范数长度；只有在经过 L2 归一化为单位向量的前提下，点积才严格等价于纯粹的夹角余弦相似度。"
      },
      "oneSentenceIdea": "点积把两个向量压成一个数，可衡量对齐程度。",
      "simpleExplanation": "对应分量相乘再相加，得到点积。方向越接近，点积通常越大。",
      "analogy": "点积像“配合度”：两人步调越一致，合力越强。",
      "steps": [
        "对齐分量",
        "相乘后求和",
        "用结果比较相似方向"
      ],
      "rigorousNote": "a·b=Σ aᵢbᵢ，等于 |a||b|cosθ。",
      "workedExample": "(1,2)·(3,4)=1×3+2×4=11。",
      "commonMistake": "点积结果是标量，不是向量。",
      "quiz": {
        "question": "向量 (1, 0) 与 (2, 0) 的点积是？",
        "choices": [
          "0",
          "2",
          "(2, 0)",
          "1"
        ],
        "explanation": "1×2 + 0×0 = 2。"
      }
    },
    "en": {
      "primaryExplanation": "At a farm stand, your shopping list contains quantities [2, 3] for apples and melons, while the price board reads [5, 4] dollars each; calculating the total bill involves multiplying matches and adding them up: 2 times 5 plus 3 times 4 yields 22. The dot product performs this exact pairwise multiply-and-sum routine. It often gauges alignment, but remember that the result depends heavily on how large the numbers themselves are, not just their alignment.",
      "primaryExplanations": {
        "story": "At a farm stand, your shopping list contains quantities [2, 3] for apples and melons, while the price board reads [5, 4] dollars each; calculating the total bill involves multiplying matches and adding them up: 2 times 5 plus 3 times 4 yields 22. The dot product performs this exact pairwise multiply-and-sum routine. It often gauges alignment, but remember that the result depends heavily on how large the numbers themselves are, not just their alignment.",
        "visual": "Picture the dot product geometrically as the shadow that one arrow casts straight down onto another, multiplied by the length of the base arrow. If two arrows point at right angles, the shadow shrinks to a dimensionless dot, resulting in zero; if they point along nearly the same path, the cast shadow is long. Crucially, if one of the vectors is exceptionally long, their dot product can be quite large even when their angular alignment is only modest.",
        "rigorous": "The algebraic dot product (or Euclidean inner product) takes two equal-length vectors and produces a single scalar via u · v = Σ u_i v_i = ||u|| ||v|| cos(θ). Because the scalar magnitude scales directly with the Euclidean norms of both vectors, a large dot product does not signify parallel alignment unless the vectors are length-normalized into unit vectors, as in cosine similarity."
      },
      "oneSentenceIdea": "The dot product compresses two vectors into a single number, measuring their degree of alignment.",
      "simpleExplanation": "Multiply corresponding components and add them together to get the dot product. The closer their directions, the larger the dot product usually is.",
      "analogy": "The dot product is like a \"cooperation score\": the more two people walk in step, the stronger their combined force.",
      "steps": [
        "Align the components of the vectors",
        "Multiply them and calculate the sum",
        "Use the result to compare their directional similarity"
      ],
      "rigorousNote": "a·b = Σ aᵢbᵢ, which is also equal to |a||b|cos(θ).",
      "workedExample": "(1,2)·(3,4) = 1×3 + 2×4 = 11.",
      "commonMistake": "Thinking the result of a dot product is a vector, when it is actually a scalar (a single number).",
      "quiz": {
        "question": "What is the dot product of the vectors (1, 0) and (2, 0)?",
        "choices": [
          "0",
          "2",
          "(2, 0)",
          "1"
        ],
        "explanation": "1×2 + 0×0 = 2."
      }
    }
  },
  {
    "conceptId": "tokenization",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "小孩子刚开始学认字时，面对一篇长文章，老师会教他先把长句子切分成一个个词语或者单个字，再逐个查字典学习。计算机也是这样：它无法一口气理解一整串连贯的人类文字，分词器就像一把小剪刀，把文章切分成可管理的“文字碎片”（称为 token），并为每个碎片贴上唯一的数字身份证号码，计算机才能着手处理。",
      "primaryExplanations": {
        "story": "小孩子刚开始学认字时，面对一篇长文章，老师会教他先把长句子切分成一个个词语或者单个字，再逐个查字典学习。计算机也是这样：它无法一口气理解一整串连贯的人类文字，分词器就像一把小剪刀，把文章切分成可管理的“文字碎片”（称为 token），并为每个碎片贴上唯一的数字身份证号码，计算机才能着手处理。",
        "visual": "把一句话想象成一节节由乐高积木拼装而成的彩色彩带。分词过程就像拆解这条彩带，按照词表里现有的积木规格，有的词正好拼成一块大积木，少见的罕见字则被拆分成两块小积木。拆开后，每一块积木上都印着一个专属的整数序列编号，文字由此转化成一排整整齐齐的数字积木队列。",
        "rigorous": "分词是将原始连续文本字符串离散化为离散符号（token）序列的预处理过程，并将其映射为词表中的整数索引 ID。现代分词技术多采用基于子词统计的贪心算法（如字节对编码 BPE 或 WordPiece），在词级别覆盖度与字符级别抗未知词（OOV）能力之间取得工程平衡。分词方案直接界定了模型的输入词表边界与上下文序列的实际有效长度。"
      },
      "oneSentenceIdea": "分词把文本切成模型能处理的 token 序列。",
      "simpleExplanation": "计算机不直接读汉字，需要先把句子拆成更小单元。",
      "analogy": "分词像把长句切成词语积木，再交给模型拼装。",
      "steps": [
        "选择切分单位",
        "把文本映射为 token",
        "得到有序 token 序列"
      ],
      "rigorousNote": "分词是定义文本到 token id 序列的确定性映射。",
      "workedExample": "“深度学习”可能切成“深度”“学习”两个 token。",
      "commonMistake": "认为分词结果唯一；不同分词器结果可能不同。",
      "quiz": {
        "question": "分词的主要目的是？",
        "choices": [
          "给文本加密",
          "把文本变成模型可处理的单元序列",
          "删除所有标点",
          "把句子翻译成英文"
        ],
        "explanation": "模型需要离散 token 序列作为输入，分词负责这一步。"
      }
    },
    "en": {
      "primaryExplanation": "When a child first learns to read, tackling a novel requires breaking long paragraphs down into sentences, familiar words, and syllable chunks. Computers face the same hurdle: they cannot parse continuous strings of text as whole thoughts. A tokenizer acts like a digital cutter, slicing sentences into digestible linguistic fragments called tokens and giving each piece an ID number from a fixed catalog so algorithms can begin their work.",
      "primaryExplanations": {
        "story": "When a child first learns to read, tackling a novel requires breaking long paragraphs down into sentences, familiar words, and syllable chunks. Computers face the same hurdle: they cannot parse continuous strings of text as whole thoughts. A tokenizer acts like a digital cutter, slicing sentences into digestible linguistic fragments called tokens and giving each piece an ID number from a fixed catalog so algorithms can begin their work.",
        "visual": "Picture a sentence as a long strip of interlocking Lego blocks of varying sizes. The tokenizer snaps the strip apart at familiar boundary joints: common words become large solid bricks, while rare or complex terms are broken into smaller subword segments. Each distinct brick type carries an embossed numerical ID, turning a flowing line of written text into an orderly lineup of numbered physical components.",
        "rigorous": "Tokenization is the discrete preprocessing transformation that partitions raw text strings into sequences of semantic units called tokens, mapping each token to an integer index within a vocabulary. Modern tokenizers employ subword segmentation algorithms such as Byte-Pair Encoding (BPE) or WordPiece, balancing fixed vocabulary constraints against out-of-vocabulary robustness. The chosen tokenization scheme directly defines the model's sequence length and linguistic resolution."
      },
      "oneSentenceIdea": "Tokenization chops text into a sequence of tokens that models can process.",
      "simpleExplanation": "Computers don't read words directly. A sentence must first be broken down into smaller chunks.",
      "analogy": "Tokenization is like chopping a long sentence into Lego blocks, which are then fed into the model for assembly.",
      "steps": [
        "Choose the granularity (words, subwords, characters)",
        "Map the text text into tokens",
        "Output an ordered sequence of tokens"
      ],
      "rigorousNote": "Tokenization defines a deterministic mapping from raw strings to a sequence of discrete token IDs.",
      "workedExample": "The word \"unhappiness\" might be split into the tokens \"un\", \"happi\", and \"ness\".",
      "commonMistake": "Assuming there is only one way to tokenize; different tokenizers produce different results.",
      "quiz": {
        "question": "What is the primary purpose of tokenization?",
        "choices": [
          "To encrypt text",
          "To turn text into a sequence of units the model can process",
          "To delete all punctuation",
          "To translate sentences to English"
        ],
        "explanation": "Models require a sequence of discrete tokens as input, and tokenization provides this."
      }
    }
  },
  {
    "conceptId": "neural-network",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "几个朋友一起猜谜语，每个人根据自己的生活常识提出一个初步线索，随后大家聚在一起互相讨论，把各自的观察汇总推理，得出最终答案。如果猜错了，大家会反思刚才是谁的线索误导了方向，并在下一轮调低那人的发言权重。神经网络正是这样由多层计算单元搭成的系统：它通过层层传递与纠错微调，逐步掌握复杂多变的数据规律。",
      "primaryExplanations": {
        "story": "几个朋友一起猜谜语，每个人根据自己的生活常识提出一个初步线索，随后大家聚在一起互相讨论，把各自的观察汇总推理，得出最终答案。如果猜错了，大家会反思刚才是谁的线索误导了方向，并在下一轮调低那人的发言权重。神经网络正是这样由多层计算单元搭成的系统：它通过层层传递与纠错微调，逐步掌握复杂多变的数据规律。",
        "visual": "在结构图上，神经网络就像一张由多层圆圈节点和密集连线编织而成的信息水流管网。原始数据从左侧的输入孔注入，穿过带有阀门旋钮的连接管道；每一个节点把收到的水量汇总并决定是否开启下级闸门，最后在右侧出水口汇聚出预测结果。训练的过程就是不断拧动管网中成千上万个旋钮，让水流走势符合预期。",
        "rigorous": "人工神经网络是由多层仿射线性变换与非线性激活函数交替复合构成的参数化可微计算图架构。网络前向传播执行特征抽取与分层表示变换，输出与目标的损失通过自动微分反向传播，利用链式法则计算各层权重与偏置的梯度。根据通用近似定理，具备非线性激活的多层网络具备逼近连续紧致域上任意连续函数的能力。"
      },
      "oneSentenceIdea": "神经网络是可学习的多层函数近似器。",
      "simpleExplanation": "它由多层变换组成，通过调整参数逼近复杂映射。",
      "analogy": "神经网络像多级流水线，每级加工特征，最后给出结果。",
      "steps": [
        "输入特征进入网络",
        "逐层变换与非线性",
        "输出预测并学习参数"
      ],
      "rigorousNote": "前馈网络是仿射变换与非线性激活的复合函数族。",
      "workedExample": "两层网络可把平面上线性不可分的点逐步分开。",
      "commonMistake": "以为网络“理解”语义；它实际在拟合数据映射。",
      "quiz": {
        "question": "神经网络通过什么变得更强？",
        "choices": [
          "增加桌面图标",
          "调整参数以降低损失",
          "删除训练数据",
          "固定所有权重"
        ],
        "explanation": "训练就是优化参数，使损失下降、预测更准。"
      }
    },
    "en": {
      "primaryExplanation": "Imagine a team of detectives cracking a puzzle: junior scouts notice simple clues, senior analysts combine those hints into broader theories, and the lead detective makes the final call. When a lead fails, the team debriefs to see which clues were misleading and adjusts who they listen to next time. A neural network operates as a layered committee of mathematical units that refines raw inputs into decisions through iterative feedback.",
      "primaryExplanations": {
        "story": "Imagine a team of detectives cracking a puzzle: junior scouts notice simple clues, senior analysts combine those hints into broader theories, and the lead detective makes the final call. When a lead fails, the team debriefs to see which clues were misleading and adjusts who they listen to next time. A neural network operates as a layered committee of mathematical units that refines raw inputs into decisions through iterative feedback.",
        "visual": "Visually, a neural network resembles an intricate plumbing grid where circular nodes are arranged in vertical columns joined by thousands of pipe segments. Input data pours into the left column, flows across intermediate layers controlled by adjustable valves, and emerges at output taps on the right. Training the network visually corresponds to calibrating the tension on every valve until liquid reaches the right tap smoothly.",
        "rigorous": "An artificial neural network is a parameterized computational graph formed by composing alternating affine linear transformations and element-wise non-linear activation functions across sequential layers. During inference, the network propagates activations forward to compute task predictions; during training, backpropagation evaluates analytical loss gradients via the multivariate chain rule. By tuning its weights, the architecture acts as a universal function approximator."
      },
      "oneSentenceIdea": "A neural network is a learnable, multi-layered function approximator.",
      "simpleExplanation": "It consists of multiple layers of transformations that approximate complex patterns by adjusting parameters.",
      "analogy": "A neural network is like a multi-stage assembly line: each stage processes features until the final result is produced.",
      "steps": [
        "Input features into the network",
        "Apply layer-by-layer linear transformations and non-linearities",
        "Output predictions and learn parameters"
      ],
      "rigorousNote": "A feedforward network is a family of composite functions consisting of affine transformations and non-linear activations.",
      "workedExample": "A simple two-layer network can cleanly separate points on a plane that cannot be separated by a single straight line.",
      "commonMistake": "Believing the network \"understands\" meaning; it is actually just fitting data mappings.",
      "quiz": {
        "question": "How does a neural network get \"smarter\"?",
        "choices": [
          "By adding desktop icons",
          "By adjusting parameters to lower the loss",
          "By deleting training data",
          "By keeping all weights fixed forever"
        ],
        "explanation": "Training is the process of optimizing parameters to decrease loss and make predictions more accurate."
      }
    }
  },
  {
    "conceptId": "embedding",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "在传统的字典里，词语只是按拼音字母呆板排序，“猫”和“狗”可能隔了几十页，“苹果”和“香蕉”也毫无交集。但词嵌入把词语搬到了一个充满语义含义的“概念社区”里：在这个社区里，“猫”和“狗”成了同属宠物的隔壁邻居，“国王”到“女王”的距离恰好对应着男性到女性的位移。计算机因此能够通过算距离来体会词义的亲近。",
      "primaryExplanations": {
        "story": "在传统的字典里，词语只是按拼音字母呆板排序，“猫”和“狗”可能隔了几十页，“苹果”和“香蕉”也毫无交集。但词嵌入把词语搬到了一个充满语义含义的“概念社区”里：在这个社区里，“猫”和“狗”成了同属宠物的隔壁邻居，“国王”到“女王”的距离恰好对应着男性到女性的位移。计算机因此能够通过算距离来体会词义的亲近。",
        "visual": "想象一个浩瀚的三维或高维星空地图，每一个词语都是星空里一颗闪烁的星辰。星辰之间的空间距离和方位直观反映了概念关系：所有的水果词星云紧紧抱团聚集在一角，所有的交通工具星系聚集在另一角。如果在星空里画出一条从“走”指向“跑”的箭头，你会发现从“看”指向“盯”的箭头有着几乎完全相同的方向与倾角。",
        "rigorous": "词嵌入（Embedding）是将离散词元符号映射到连续低维密集向量空间 R^d 的参数化可学习映射矩阵 E ∈ R^{|V| x d}。与高维稀疏的 one-hot 编码不同，嵌入向量在隐空间中捕捉了基于分布式假说的丰富统计共现信息与几何语义关系。在现代深度网络中，嵌入层权重与主干网络联合优化，充当符号离散表示与连续张量运算之间的接口。"
      },
      "oneSentenceIdea": "嵌入把离散符号映射成稠密向量。",
      "simpleExplanation": "词或 token 本身不能直接算，嵌入给它们配上一排数字。",
      "analogy": "嵌入像给每个词发一张“坐标身份证”。",
      "steps": [
        "为符号分配 id",
        "查表得到向量",
        "用向量做后续计算"
      ],
      "rigorousNote": "嵌入是离散集合到 ℝᵈ 的映射，常实现为可训练查找表。",
      "workedExample": "“猫”和“狗”的嵌入向量方向往往比“猫”和“汽车”更接近。",
      "commonMistake": "把嵌入向量当成可读文字本身。",
      "quiz": {
        "question": "嵌入向量的主要作用是？",
        "choices": [
          "美化界面",
          "让离散符号可参与数值计算",
          "加快硬盘读写",
          "压缩图片"
        ],
        "explanation": "嵌入把符号变成向量，才能进入注意力等数值模块。"
      }
    },
    "en": {
      "primaryExplanation": "In a standard printed dictionary, words are ordered alphabetically, placing \"cat\" and \"dog\" pages apart while \"apple\" and \"apron\" sit right next to each other despite having nothing in common. An embedding reorganizes words into a conceptual neighborhood: here, \"cat\" and \"dog\" live on the same quiet pet street, while the step from \"king\" to \"queen\" matches the step from \"man\" to \"woman.\" Computers can then compare ideas by measuring distances.",
      "primaryExplanations": {
        "story": "In a standard printed dictionary, words are ordered alphabetically, placing \"cat\" and \"dog\" pages apart while \"apple\" and \"apron\" sit right next to each other despite having nothing in common. An embedding reorganizes words into a conceptual neighborhood: here, \"cat\" and \"dog\" live on the same quiet pet street, while the step from \"king\" to \"queen\" matches the step from \"man\" to \"woman.\" Computers can then compare ideas by measuring distances.",
        "visual": "Envision an embedding space as an expansive celestial star map where each word is a star plotted by multi-dimensional coordinates. Stars representing fruit cluster into a tight constellation on one side, while vehicles form their own cluster across the galaxy. Drawing an arrow from \"walk\" to \"run\" produces a vector direction almost parallel to the arrow connecting \"whisper\" to \"shout,\" giving semantic concepts a visible geometry.",
        "rigorous": "An embedding is a continuous, dense representation of discrete tokens within a lower-dimensional latent vector space R^d, parameterized by an embedding matrix W_e ∈ R^{|V| x d}. Unlike high-dimensional, orthogonal one-hot vectors, learned embeddings encode semantic and syntactic regularities derived from distributional semantics. These continuous representations serve as the foundational input representations in sequence models."
      },
      "oneSentenceIdea": "Embeddings map discrete symbols into dense continuous vectors.",
      "simpleExplanation": "Words or tokens cannot be calculated directly, so embeddings give them a dedicated array of numbers to work with.",
      "analogy": "An embedding is like handing every word its own \"coordinate ID card.\"",
      "steps": [
        "Assign a unique ID to a symbol",
        "Look up the corresponding vector in a table",
        "Use this vector for downstream computations"
      ],
      "rigorousNote": "An embedding is a mapping from a discrete set into ℝᵈ, typically implemented as a trainable lookup table.",
      "workedExample": "The embedding vectors for \"cat\" and \"dog\" will point in more similar directions than \"cat\" and \"car.\"",
      "commonMistake": "Treating the embedding vector as if it were the readable text itself.",
      "quiz": {
        "question": "What is the primary function of an embedding vector?",
        "choices": [
          "To beautify the user interface",
          "To allow discrete symbols to participate in numerical computations",
          "To speed up hard drive reads and writes",
          "To compress images"
        ],
        "explanation": "Embeddings turn symbols into vectors so they can enter numerical modules like attention."
      }
    }
  },
  {
    "conceptId": "gradient-descent",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "想象你在深夜的大雾中被困在山顶，四周白茫茫一片看不到山底的村庄，但你的双脚能真切感受到脚下地面的倾斜方向。最稳妥的下山办法，就是每走一步都用脚试探出最陡峭的下坡角度，朝那个方向迈出一小步，重复这个过程慢慢走入低谷。梯度下降就是用这种凭手感步步探路的方式，让模型在探索中逐步减少错误。但必须警惕：它并不能保证你最终能找到全山最低的真盆地，有时可能会困在半山腰的凹坑或鞍点处。",
      "primaryExplanations": {
        "story": "想象你在深夜的大雾中被困在山顶，四周白茫茫一片看不到山底的村庄，但你的双脚能真切感受到脚下地面的倾斜方向。最稳妥的下山办法，就是每走一步都用脚试探出最陡峭的下坡角度，朝那个方向迈出一小步，重复这个过程慢慢走入低谷。梯度下降就是用这种凭手感步步探路的方式，让模型在探索中逐步减少错误。但必须警惕：它并不能保证你最终能找到全山最低的真盆地，有时可能会困在半山腰的凹坑或鞍点处。",
        "visual": "把损失曲面想象成一张起伏跌宕的立体地形等高线图，上面布满了深浅不一的盆地与山岭。小球在重力与梯度的驱使下沿着曲面最陡的坡度向下滚落；如果步长合适，小球会顺着斜坡慢慢滑入附近的碗状凹地。然而，若地形中存在鞍点或者坑洼，小球可能会在假低谷（局部极小值）停滞不前，或者因为步子迈得太大而在山谷两壁剧烈震荡，无法保证到达全局最低洼地。",
        "rigorous": "梯度下降是一种通过沿目标函数负梯度方向迭代更新参数的一阶数值优化算法，其基本更新法则为 θ_{t+1} = θ_t - η ∇L(θ_t)，其中 η > 0 为学习率。尽管该方法在凸优化中具有全局收敛保证，但在深度神经网络的高度非凸损失曲面上，梯度下降并不保证收敛到全局最低误差解，极易陷入局部极小点、宽阔鞍点或在病态曲率区域震荡。"
      },
      "oneSentenceIdea": "梯度下降沿损失下降方向更新参数。",
      "simpleExplanation": "想知道往哪走能减少错误，就看梯度，再朝反方向迈一小步。",
      "analogy": "下山时观察坡度，往更低处走。",
      "steps": [
        "计算损失对参数的梯度",
        "沿负梯度方向更新",
        "重复直到损失足够低"
      ],
      "rigorousNote": "θ ← θ - η∇L(θ)，η 为学习率。",
      "workedExample": "若梯度为正，减去学习率×梯度可使参数变小，从而降低损失。",
      "commonMistake": "学习率过大导致震荡，过小导致学习过慢。",
      "quiz": {
        "question": "梯度下降更新参数的方向是？",
        "choices": [
          "正梯度方向",
          "负梯度方向",
          "随机方向",
          "永远保持原参数"
        ],
        "explanation": "负梯度方向是局部下降最快的方向。"
      }
    },
    "en": {
      "primaryExplanation": "Picture being caught on a foggy mountain ridge at dusk with zero visibility: you cannot see the lodge in the valley below, but you can feel the slope beneath your boots. A sensible strategy is to feel around for whichever direction angles most steeply downhill, take a cautious step in that direction, and repeat. Gradient descent uses this step-by-step navigation to reduce prediction errors, though it comes with no guarantee of reaching the true absolute lowest valley of the range.",
      "primaryExplanations": {
        "story": "Picture being caught on a foggy mountain ridge at dusk with zero visibility: you cannot see the lodge in the valley below, but you can feel the slope beneath your boots. A sensible strategy is to feel around for whichever direction angles most steeply downhill, take a cautious step in that direction, and repeat. Gradient descent uses this step-by-step navigation to reduce prediction errors, though it comes with no guarantee of reaching the true absolute lowest valley of the range.",
        "visual": "Picture the loss landscape as a 3D topographic map with rolling peaks, narrow ravines, and crater basins. A marble placed on this terrain rolls in the direction of steepest downward descent, steadily losing altitude toward lower elevation. If the step size is too large, the marble overshoots and bounces wildly across cliffs; if it encounters a local dip or flat saddle plateau, it can stall long before reaching the deepest canyon floor, offering no guarantee of finding the global minimum.",
        "rigorous": "Gradient descent is a first-order iterative optimization algorithm that updates parameter vectors along the negative gradient of an objective function: θ_{t+1} = θ_t - η ∇_θ L(θ_t), parameterized by learning rate η. In non-convex optimization typical of deep learning, gradient descent does not guarantee convergence to the global minimum, and can become trapped in sub-optimal local minima or suffer slow progress near saddle points."
      },
      "oneSentenceIdea": "Gradient descent updates parameters by following the downward slope of the loss.",
      "simpleExplanation": "To reduce errors, you look at the gradient (the slope) and take a small step in the exact opposite direction.",
      "analogy": "It's like hiking down a mountain in the fog by feeling which way the ground slopes downward.",
      "steps": [
        "Calculate the gradient of the loss with respect to the parameters",
        "Update parameters in the negative gradient direction",
        "Repeat until the loss is low enough"
      ],
      "rigorousNote": "The update rule is θ ← θ - η∇L(θ), where η is the learning rate.",
      "workedExample": "If the gradient is positive, subtracting the learning rate × gradient decreases the parameter, lowering the loss.",
      "commonMistake": "Using a learning rate that is too high (causing oscillation) or too low (causing terribly slow learning).",
      "quiz": {
        "question": "In which direction does gradient descent update parameters?",
        "choices": [
          "Positive gradient direction",
          "Negative gradient direction",
          "A random direction",
          "It keeps parameters exactly the same"
        ],
        "explanation": "The negative gradient direction points to the steepest local descent."
      }
    }
  },
  {
    "conceptId": "softmax",
    "quizCorrectIndex": 0,
    "zh": {
      "primaryExplanation": "裁判团给三个表演者分别打出了原始印象分 2.1、4.5 和 1.0；为了在计分板上显示成通俗易懂的获胜几率，主持人不能简单直接相除，而是通过指数运算放大高分优势，再把它们统统压缩成相加等于 100% 的百分比数值。Softmax 做的就是这种归一化计算：它确保各项得分都变成正数且总和为 1，但要注意，这些转换出来的数值只反映模型内部的分数分配，并不等同于现实世界中真实经过严格校准的概率。",
      "primaryExplanations": {
        "story": "裁判团给三个表演者分别打出了原始印象分 2.1、4.5 和 1.0；为了在计分板上显示成通俗易懂的获胜几率，主持人不能简单直接相除，而是通过指数运算放大高分优势，再把它们统统压缩成相加等于 100% 的百分比数值。Softmax 做的就是这种归一化计算：它确保各项得分都变成正数且总和为 1，但要注意，这些转换出来的数值只反映模型内部的分数分配，并不等同于现实世界中真实经过严格校准的概率。",
        "visual": "把一排高矮不一、甚至带有负数的柱状条形图投进 Softmax 转换器中。转换器首先通过指数增长曲线把所有的柱子强行拔高拉正为清一色的正值，并将原本微弱的落差急剧拉开，随后将这些柱子等比例整体压缩，使得所有柱子的高度总和恰好等于 1。最终呈现出一组高度各异、总和恰好为 1 的分布图，需要注意它反映的是指数相对占比而非校准概率。",
        "rigorous": "Softmax 函数将任意实数向量 z ∈ R^K 映射为满足概率单形条件的非负归一化向量，定义为 σ(z)_i = e^{z_i} / Σ_{j=1}^K e^{z_j}。其输出严格满足非负性且元素和恒等于 1。需要特别强调的是，未经校准的神经网络 logits 经过 Softmax 转换后，输出值往往存在严重的过自信倾向，并不保证对应真实后验校准概率（Calibrated Probabilities）。"
      },
      "oneSentenceIdea": "Softmax 把实数向量变成和为 1 的概率分布。",
      "simpleExplanation": "先取指数再归一化，分数就变成可比较的概率。",
      "analogy": "Softmax 像把不同高度的人拉到同一天平上比占比。",
      "steps": [
        "对每个分量取指数",
        "求和做分母",
        "每个分量除以总和"
      ],
      "rigorousNote": "softmax(z)ᵢ=exp(zᵢ)/Σexp(zⱼ)。",
      "workedExample": "输入 (1,2)，softmax 后得到两个正数且和为 1。",
      "commonMistake": "忘记归一化，导致概率和不为 1。",
      "quiz": {
        "question": "Softmax 输出向量的特点是？",
        "choices": [
          "和为 1 的非负分布",
          "全为负数",
          "至少有一个无穷大",
          "与输入完全相同"
        ],
        "explanation": "Softmax 的关键性质是输出为概率分布。"
      }
    },
    "en": {
      "primaryExplanation": "Suppose a panel of judges awards raw performance ratings of 2.1, 4.5, and 1.0 to three candidates. To present these scores as a tidy winning percentage on screen, the system exponentiates the numbers to reward higher margins and scales them so they add up to 100%. Softmax turns arbitrary real numbers into positive shares that sum to 1, but these outputs represent internal score distributions rather than calibrated, real-world statistical probabilities.",
      "primaryExplanations": {
        "story": "Suppose a panel of judges awards raw performance ratings of 2.1, 4.5, and 1.0 to three candidates. To present these scores as a tidy winning percentage on screen, the system exponentiates the numbers to reward higher margins and scales them so they add up to 100%. Softmax turns arbitrary real numbers into positive shares that sum to 1, but these outputs represent internal score distributions rather than calibrated, real-world statistical probabilities.",
        "visual": "Picture a row of bar charts of mixed heights, including negative values, passing through a Softmax normalizer. The operation first routes every bar through an exponential curve, stretching tall bars upward while lifting negative bars into positive territory, and then squashes the entire group proportionally until their combined heights total exactly 1.0. This yields a neat histogram whose proportions reflect relative exponential score differences rather than calibrated empirical probabilities.",
        "rigorous": "The Softmax function converts an unconstrained logit vector z ∈ R^K into a valid discrete probability distribution over the standard simplex: σ(z)_i = e^{z_i} / Σ_{j=1}^K e^{z_j}. While the resulting components are strictly positive and sum to 1, raw softmax outputs from uncalibrated neural networks frequently exhibit overconfidence and do not guarantee calibrated probabilities without explicit post-hoc calibration techniques."
      },
      "oneSentenceIdea": "Softmax transforms a vector of real numbers into a probability distribution that sums to 1.",
      "simpleExplanation": "By exponentiating and then normalizing, arbitrary scores become comparable probabilities.",
      "analogy": "Softmax is like taking a group of unevenly tall people and putting them on a scale to see what percentage of the total height each person contributes.",
      "steps": [
        "Take the exponential of each component",
        "Sum them to act as a denominator",
        "Divide each component by the sum"
      ],
      "rigorousNote": "softmax(z)ᵢ = exp(zᵢ) / Σ exp(zⱼ).",
      "workedExample": "Given the input (1, 2), Softmax produces two positive numbers that add up to 1.",
      "commonMistake": "Forgetting to normalize, meaning the probabilities wouldn't sum to 1.",
      "quiz": {
        "question": "What is the defining characteristic of a Softmax output vector?",
        "choices": [
          "A non-negative distribution that sums to 1",
          "All values are negative",
          "At least one value is infinity",
          "It is identical to the input vector"
        ],
        "explanation": "The key property of Softmax is that its output is a valid probability distribution."
      }
    }
  },
  {
    "conceptId": "attention",
    "quizCorrectIndex": 1,
    "zh": {
      "fable": {
        "title": "钟楼里的密信",
        "story": [
          "山谷里有座城。城里每户门口挂着一枚木牌，屋里藏着一封信。每天清晨，钟楼收到一个问题，却不知道该去敲谁家的门。",
          "守钟人把问题刻在铜片上，逐一与门口的木牌对照。纹路越合，钟声越响。后来木牌越做越复杂，哪怕只是碰巧相似，也能让钟响得震天动地。他便按纹路的多少调整同一把量尺，免得巧合盖过真正的线索。",
          "他从不只拆声音最大的一封信。钟声被换成每户分到的发言时间：有的能讲很久，有的只讲一句。听完后，他把这些片段合成一个新答案，而不是照抄任何一家的原话。",
          "有一天，城里所有人都走上钟楼。每个人带着自己的问题，也把木牌和信留给别人。原本含糊的一句话，听过邻居后有了新的意思。守钟人这才发现，这座城根本没有街道：每一户都是同一句话里的一个词。"
        ],
        "reveal": "这套让同一句话里的词彼此寻找线索的办法，叫缩放点积自注意力。",
        "explanation": "在 Transformer 中，同一序列里的每个词元经可训练的变换生成查询 Q、键 K、值 V。每个 Q 与所有 K 做点积，分数除以 √dₖ，再用 softmax 变成权重。权重对各个 V 加权求和，形成这个词元结合上下文后的新表示。它计算的是学到的匹配关系，不能保证每次都正确理解语义或代词指向。",
        "metaphors": [
          { "image": "城里的一户", "meaning": "序列中的一个词元；每户都会轮流提出自己的问题。" },
          { "image": "刻着问题的铜片", "meaning": "查询向量 Q：当前词元想从上下文寻找什么。" },
          { "image": "门口的木牌", "meaning": "键向量 K：供其他词元比较的特征。" },
          { "image": "屋里的信", "meaning": "值向量 V：被读取并汇入结果的信息。" },
          { "image": "调过量尺的钟声", "meaning": "Q 与 K 的点积除以 √dₖ；维度变大时，缩放可防止分数轻易过大。" },
          { "image": "分到的发言时间", "meaning": "softmax 得到的权重，决定各份信息参与结果的比例。" },
          { "image": "合成的新答案", "meaning": "对 V 的加权求和，得到包含上下文的新表示。" }
        ]
      },
      "primaryExplanation": "在喧闹嘈杂的咖啡厅里与朋友交谈时，你不会把房间里每一处刀叉碰撞声和平行交谈同等收入耳中，而是把注意力高度聚焦在朋友说话的音色上，其余背景声都被主动弱化。注意力机制正是让算法具备这种按需聚焦的能力：它通过计算当前问题与周围信息的相关程度，给关键线索打上更高权重并汇总。但需谨防的是，这种权重匹配只是一种数值打分，并不能保证算法每次都能正确理解代词或意图。",
      "primaryExplanations": {
        "story": "在喧闹嘈杂的咖啡厅里与朋友交谈时，你不会把房间里每一处刀叉碰撞声和平行交谈同等收入耳中，而是把注意力高度聚焦在朋友说话的音色上，其余背景声都被主动弱化。注意力机制正是让算法具备这种按需聚焦的能力：它通过计算当前问题与周围信息的相关程度，给关键线索打上更高权重并汇总。但需谨防的是，这种权重匹配只是一种数值打分，并不能保证算法每次都能正确理解代词或意图。",
        "visual": "把注意力想象成舞台中央一盏带有调光器与多角度旋转底座的聚光灯。当主讲人移动到舞台特定位置时，聚光灯把最亮的光斑打在与他正在讲述的话题密切关联的背景道具上，边缘不相关的道具则笼罩在昏暗阴影中。注意这种高亮只代表数学上的投影关联强弱，并不能保证代词被自动赋予正确的语法指代。",
        "rigorous": "注意力机制是一种基于关联度对上下文表征进行可变加权聚合的可微寻址算子，基本计算范式基于查询向量（Query）、键向量（Key）与值向量（Value），公式为 Attention(Q, K, V) = Softmax(QK^T / sqrt(d_k))V。尽管注意力机制能够动态捕捉相关性，但该机制仅基于线性投影内积评估相关度，并不保证总能做出符合语义逻辑或消除指代歧义的正确决策。"
      },
      "oneSentenceIdea": "注意力按相关性对信息加权汇总。",
      "simpleExplanation": "模型判断“该多看谁”，给重要信息更大权重。",
      "analogy": "听课时你更关注与问题相关的句子，这就是注意力。",
      "steps": [
        "计算查询与键的相关度",
        "归一化得到权重",
        "加权汇总值向量"
      ],
      "rigorousNote": "Attention(Q,K,V)=softmax(QKᵀ/√d)V。",
      "workedExample": "翻译“it”时，注意力可能更多指向其指代的名词。",
      "commonMistake": "以为注意力只是“看图”，实际它是加权读取。",
      "quiz": {
        "question": "注意力权重经过 Softmax 后通常用于？",
        "choices": [
          "删除所有向量",
          "对值向量加权求和",
          "生成随机噪声",
          "加密模型参数"
        ],
        "explanation": "注意力输出是值向量的加权组合。"
      }
    },
    "en": {
      "fable": {
        "title": "The Letters in the Clock Tower",
        "story": [
          "Beyond the hills stood a town where every house displayed a carved sign and kept a sealed letter. Each morning a question reached the clock tower, but the keeper had no idea whose door to knock on.",
          "The keeper pressed the question onto a copper plate and compared it with every sign. Closer patterns rang louder. As the signs grew more elaborate, even chance matches could set the bells roaring. The keeper adjusted the same measuring scale to the number of marks so an accident would not drown out a useful clue.",
          "The keeper never opened only the loudest letter. The bells were turned into speaking time: one house got a long turn, another only a sentence. From those accounts the keeper assembled a new answer, not a copy of any single letter.",
          "One day everyone came to the tower at once. Each person brought a question and left a sign and a letter for the others. A vague remark took on a new meaning after its neighbours had spoken. Only then did the keeper see that the town had no streets. Its houses were the words of a single sentence."
        ],
        "reveal": "That method is scaled dot-product self-attention: words in one sequence help build new representations of one another.",
        "explanation": "In a Transformer, each token in a sequence is projected into a query Q, a key K, and a value V. Each query is compared with every key by a dot product; the scores are divided by √dₖ, then softmax turns them into weights. A weighted sum of the values gives each token a new, context-dependent representation. These are learned numerical matches, not a guarantee that the model has interpreted meaning or pronouns correctly.",
        "metaphors": [
          { "image": "A house in the town", "meaning": "One token in the sequence; every token takes a turn asking a question." },
          { "image": "The copper plate", "meaning": "The query Q: what the current token looks for in its context." },
          { "image": "The carved sign", "meaning": "The key K: features that other tokens can compare against." },
          { "image": "The sealed letter", "meaning": "The value V: information that can contribute to the result." },
          { "image": "The adjusted bell", "meaning": "The Q–K dot product divided by √dₖ, which keeps scores from growing too large as key dimension increases." },
          { "image": "Speaking time", "meaning": "The softmax weight assigned to each value." },
          { "image": "The assembled answer", "meaning": "The weighted sum of values: a new representation shaped by context." }
        ]
      },
      "primaryExplanation": "While chatting with a colleague in a loud cafeteria, your ears naturally hone in on your friend's voice while tuning out clattering silverware and conversations at nearby tables. Attention equips computational models with this selective filtering: when evaluating a token, it computes relevance scores against every available context clue to build a weighted blend. However, attention scores are statistical calculations that do not guarantee error-free pronoun resolution or factual deduction.",
      "primaryExplanations": {
        "story": "While chatting with a colleague in a loud cafeteria, your ears naturally hone in on your friend's voice while tuning out clattering silverware and conversations at nearby tables. Attention equips computational models with this selective filtering: when evaluating a token, it computes relevance scores against every available context clue to build a weighted blend. However, attention scores are statistical calculations that do not guarantee error-free pronoun resolution or factual deduction.",
        "visual": "Envision attention as a moveable theater spotlight shining over a stage filled with props. Depending on what the actor is holding, the spotlight casts a radiant beam onto the matching prop while leaving irrelevant items in partial shadow. Keep in mind that this visual glow reflects mathematical similarity scores rather than guaranteed resolution of pronouns or syntactic intent.",
        "rigorous": "Attention is a differentiable retrieval mechanism that computes a dynamic weighted sum over value vectors based on query-key compatibility: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V. Although attention selectively prioritizes salient contextual features across arbitrary distances, it evaluates similarity strictly via learned inner products and does not guarantee correct linguistic interpretation or definitive resolution of syntactic ambiguities."
      },
      "oneSentenceIdea": "Attention summarizes information by weighting it according to relevance.",
      "simpleExplanation": "The model decides \"who to look at more\" and gives higher weights to important information.",
      "analogy": "During a lecture, you pay more attention to sentences related to the question. This is attention.",
      "steps": [
        "Calculate the relevance between the Query and the Key",
        "Normalize to get weights",
        "Compute a weighted sum of the Value vectors"
      ],
      "rigorousNote": "Attention(Q,K,V) = softmax(QKᵀ/√d)V.",
      "workedExample": "When translating the pronoun \"it,\" attention might point heavily toward the noun it refers to.",
      "commonMistake": "Thinking attention is just \"looking\" at something; it is actually a weighted reading mechanism.",
      "quiz": {
        "question": "After passing through Softmax, what are attention weights typically used for?",
        "choices": [
          "Deleting all vectors",
          "Computing a weighted sum of the Value vectors",
          "Generating random noise",
          "Encrypting model parameters"
        ],
        "explanation": "The output of attention is a weighted combination of the Value vectors."
      }
    }
  },
  {
    "conceptId": "self-attention",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "读到句子“猎人带狗进了森林，因为它们喜欢追逐”时，我们很自然会探究“它们”究竟指代猎人还是狗。自注意力机制让同一个句子里的所有词语在同一时间互通有无：每个词都拿着自己的疑问向句子里的其余词索取线索，并将关联度最高的词义融合进自身。但这种词对匹配是由数据训练出来的统计相关性，有时在面对复杂语境时依然可能产生错误的指代联想。",
      "primaryExplanations": {
        "story": "读到句子“猎人带狗进了森林，因为它们喜欢追逐”时，我们很自然会探究“它们”究竟指代猎人还是狗。自注意力机制让同一个句子里的所有词语在同一时间互通有无：每个词都拿着自己的疑问向句子里的其余词索取线索，并将关联度最高的词义融合进自身。但这种词对匹配是由数据训练出来的统计相关性，有时在面对复杂语境时依然可能产生错误的指代联想。",
        "visual": "把一句话里的每一个词看作圆桌边坐着的一圈参会代表，代表之间拉起了错综复杂的双向发光丝线。当“银行”这个词发言时，如果句子里有“河流”，它们之间的连线就会变得格外粗壮明亮；如果句子里出现的是“储蓄”，连线则会亮向另一侧。整张光网反映的是各词之间的加权吸引度，但并不保证在任何多义语境下都能正确理清逻辑主宾指代关系。",
        "rigorous": "自注意力（Self-Attention）是注意力机制的特化形式，其查询、键与值矩阵均由同一输入序列的线性投影生成（Q = XW_Q, K = XW_K, V = XW_V）。通过计算序列内部所有位置对之间的缩放点积并进行 Softmax 归一化，自注意力实现了不依赖时序循环的全局上下文交互。需要指出的是，自注意力计算的只是线性空间中的投影相似度，无法从理论上杜绝代词消歧错误或逻辑误判。"
      },
      "oneSentenceIdea": "自注意力在同一序列内部建立元素间依赖。",
      "simpleExplanation": "每个位置都可以“回看”序列其他位置，从而理解上下文。",
      "analogy": "读长句时，你回看前文来理解代词指谁。",
      "steps": [
        "从同一序列产生 Q/K/V",
        "计算位置间相关度",
        "汇总上下文表示"
      ],
      "rigorousNote": "自注意力对输入序列自身做注意力，Q、K、V 同源。",
      "workedExample": "“银行”在“河岸”与“金融”上下文中得到不同表示。",
      "commonMistake": "把自注意力与“只看自己”混淆。",
      "quiz": {
        "question": "自注意力的 Q、K、V 通常来自？",
        "choices": [
          "三个不同数据库",
          "同一序列的不同投影",
          "随机噪声",
          "固定查表"
        ],
        "explanation": "自注意力用同一输入经不同线性投影得到 Q、K、V。"
      }
    },
    "en": {
      "primaryExplanation": "When reading \"The traveler packed a jacket and boots because they were cold,\" you immediately wonder whether \"they\" describes the traveler or the boots. Self-attention lets every single word in a sequence communicate with every other word at the same time: words act as peers, comparing notes to absorb relevant context into their own meaning. However, these matches stem from learned projections and do not guarantee correct coreference resolution or reasoning.",
      "primaryExplanations": {
        "story": "When reading \"The traveler packed a jacket and boots because they were cold,\" you immediately wonder whether \"they\" describes the traveler or the boots. Self-attention lets every single word in a sequence communicate with every other word at the same time: words act as peers, comparing notes to absorb relevant context into their own meaning. However, these matches stem from learned projections and do not guarantee correct coreference resolution or reasoning.",
        "visual": "Picture words in a sentence seated in a circle, with fine threads of light connecting every pair of seats. When the ambiguous word \"bank\" speaks, the thread linking it to \"river\" glows brilliant gold if the scene takes place outdoors, or the thread linking it to \"deposit\" glows if finance is discussed. The glowing network displays dynamic relevance weights across the sequence, though it offers no guarantee that grammatical references or pronouns will be resolved correctly.",
        "rigorous": "Self-attention is an intra-sequence formulation of the attention mechanism where queries, keys, and values are derived from the same input representations through linear projections: Q=XW_Q, K=XW_K, V=XW_V. By computing pairwise scaled dot-product affinities across all token pairs without recurrent state bottlenecks, it captures dense sequence-wide dependencies. Nonetheless, its statistical weightings do not provide formal guarantees of resolving semantic ambiguities or complex coreference structures."
      },
      "oneSentenceIdea": "Self-attention establishes dependencies between elements within the same sequence.",
      "simpleExplanation": "Each position can \"look back\" at other positions in the sequence to understand context.",
      "analogy": "When reading a long sentence, you glance back at earlier words to figure out who a pronoun refers to.",
      "steps": [
        "Generate Q, K, and V from the same sequence",
        "Calculate the relevance between positions",
        "Summarize the contextual representation"
      ],
      "rigorousNote": "Self-attention performs attention over the input sequence itself, so Q, K, and V originate from the same source.",
      "workedExample": "The word \"bank\" receives entirely different representations depending on whether the context is \"river\" or \"finance.\"",
      "commonMistake": "Confusing \"self-attention\" with \"only looking at oneself.\"",
      "quiz": {
        "question": "Where do the Q, K, and V in self-attention usually come from?",
        "choices": [
          "Three different databases",
          "Different projections of the exact same sequence",
          "Random noise",
          "Fixed lookup tables"
        ],
        "explanation": "Self-attention uses different linear projections of the same input to get Q, K, and V."
      }
    }
  },
  {
    "conceptId": "positional-encoding",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "如果你收到一张拼图，所有拼图块都被剪成了完全一样的正方形，上面只有图案而没有边框卡扣，你很难分清哪块在第一排、哪块在最后。纯粹的自注意力计算也是这样，它看所有词像在开圆桌茶话会，默认分不清先后顺序。位置编码就是在每个词进场前，给它的名牌上敲上独一无二的位置时间戳或波形标记，模型才能认出谁先谁后。",
      "primaryExplanations": {
        "story": "如果你收到一张拼图，所有拼图块都被剪成了完全一样的正方形，上面只有图案而没有边框卡扣，你很难分清哪块在第一排、哪块在最后。纯粹的自注意力计算也是这样，它看所有词像在开圆桌茶话会，默认分不清先后顺序。位置编码就是在每个词进场前，给它的名牌上敲上独一无二的位置时间戳或波形标记，模型才能认出谁先谁后。",
        "visual": "想象一首由不同频率的正弦波和余弦波交织而成的大合唱，时间轴上的每一个毫秒都有着独一无二的波峰波谷组合。位置编码正是把这样一组平滑振荡的高低波纹，直接叠加在各个词的特征向量上。在三维图谱中，原本平铺无序的词向量被赋予了具有特定坡度与波动的几何高低起伏，使距离相近的词带有相似的位置纹理。",
        "rigorous": "位置编码（Positional Encoding）是向缺乏内在置换敏感性的自注意力架构中注入序列绝对或相对位置信息的数学机制。经典 Transformer 采用不同频率的正弦与余弦函数叠加于输入嵌入：PE_{(pos, 2i)} = sin(pos / 10000^{2i/d})。由于纯自注意力操作具备置换等变性（Permutation Equivariance），位置编码是打破对称性、赋予模型感知词元先后顺序与相对距离的关键前提。"
      },
      "oneSentenceIdea": "位置编码把顺序信息注入表示。",
      "simpleExplanation": "注意力本身不偏爱先后，需要额外告诉模型“谁在前谁在后”。",
      "analogy": "位置编码像给排队的人发号码牌。",
      "steps": [
        "为每个位置生成编码",
        "与 token 嵌入相加",
        "让模型感知顺序"
      ],
      "rigorousNote": "常用正弦位置编码或可学习位置嵌入加到输入表示上。",
      "workedExample": "“猫追狗”与“狗追猫”词相同但顺序不同，位置编码可区分。",
      "commonMistake": "以为去掉位置编码不影响语言理解。",
      "quiz": {
        "question": "位置编码主要解决什么问题？",
        "choices": [
          "图片分辨率",
          "注意力缺少顺序信息",
          "硬盘容量不足",
          "界面主题颜色"
        ],
        "explanation": "纯注意力对置换不变，需要位置编码补上顺序。"
      }
    },
    "en": {
      "primaryExplanation": "Imagine receiving a jigsaw puzzle where every piece has been trimmed into identical square tiles without interlocking edge tabs: without positional marks, telling which piece belongs in the top row is nearly impossible. Standard self-attention treats tokens like an unordered bag of ideas at a party. Positional encoding pins an arrival timestamp or distinct wave badge onto each token's jacket, allowing the architecture to distinguish who came first and who followed.",
      "primaryExplanations": {
        "story": "Imagine receiving a jigsaw puzzle where every piece has been trimmed into identical square tiles without interlocking edge tabs: without positional marks, telling which piece belongs in the top row is nearly impossible. Standard self-attention treats tokens like an unordered bag of ideas at a party. Positional encoding pins an arrival timestamp or distinct wave badge onto each token's jacket, allowing the architecture to distinguish who came first and who followed.",
        "visual": "Think of positional encoding as a set of sinusoidal waves oscillating at differing wavelengths like radio frequencies across time. At position index 1, the combination of wave peaks and troughs forms a unique vertical fingerprint; at position index 5, the wave crests have shifted to form a different silhouette. Adding these wave coordinates directly onto the embeddings stamps a clear geometric elevation onto every point in sequence space.",
        "rigorous": "Positional encoding injects sequence-order information into self-attention layers, which are inherently permutation-equivariant across the token dimension. Canonical implementations utilize sinusoidal functions across varied wavelengths or learned positional lookup tables added directly to token embeddings. This encoding breaks the symmetry of unordered sets, allowing models to leverage distance, order, and relative offset patterns across sequence elements."
      },
      "oneSentenceIdea": "Positional encoding injects sequence order information into representations.",
      "simpleExplanation": "Attention itself has no bias toward order, so we need a way to explicitly tell the model \"who comes first and who comes last.\"",
      "analogy": "Positional encoding is like handing out numbered tickets to people waiting in line.",
      "steps": [
        "Generate an encoding for each position",
        "Add it to the token embedding",
        "Allow the model to perceive order"
      ],
      "rigorousNote": "Sinusoidal positional encodings or learnable positional embeddings are typically added to the input representations.",
      "workedExample": "\"Cat chases dog\" and \"Dog chases cat\" share the same words, but positional encoding lets the model tell them apart.",
      "commonMistake": "Assuming that removing positional encoding wouldn't severely damage language comprehension.",
      "quiz": {
        "question": "What problem does positional encoding primarily solve?",
        "choices": [
          "Image resolution limits",
          "Attention's lack of sequence order information",
          "Insufficient hard drive capacity",
          "UI theme colors"
        ],
        "explanation": "Pure attention is permutation-invariant, so positional encoding is needed to supply the sequential order."
      }
    }
  },
  {
    "conceptId": "layer-norm",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "一支合唱团里，如果有的歌手扯着嗓子大喊，有的歌手声音小得像蚊子嗡嗡叫，整体声音听起来就会杂乱刺耳。聪明的调音师会把每一位歌手的麦克风音量做现场拉平，让响度都归拢在舒适稳定的基准线上。层归一化在神经网络内部做的工作很像这位调音师：它在每一层内部对特征数值进行均值与方差梳理，减轻数值剧烈飘移带来的训练扰动，尽管这并不能百分之百保证彻底消除所有梯度异常或训练不稳定。",
      "primaryExplanations": {
        "story": "一支合唱团里，如果有的歌手扯着嗓子大喊，有的歌手声音小得像蚊子嗡嗡叫，整体声音听起来就会杂乱刺耳。聪明的调音师会把每一位歌手的麦克风音量做现场拉平，让响度都归拢在舒适稳定的基准线上。层归一化在神经网络内部做的工作很像这位调音师：它在每一层内部对特征数值进行均值与方差梳理，减轻数值剧烈飘移带来的训练扰动，尽管这并不能百分之百保证彻底消除所有梯度异常或训练不稳定。",
        "visual": "把流经深层网络的一长串特征数值想象成一条凹凸不平的折线段。层归一化对单个样本内部的这些数值做了一次强行拉正：先把它整体向下平移，让所有数值的平均中心对准水平零刻度线，再等比例缩放其振幅，让波动范围归拢在统一的单位标准差内。这种平抑能够显著规整数据分布，但并不能保证完全消除梯度的震荡或网络的训练崩溃。",
        "rigorous": "层归一化（Layer Normalization）在单一样本的特征维度上对隐藏状态进行标准化统计操作，其计算式为 x_hat = ((x - μ) / sqrt(σ^2 + ε)) * γ + β，其中 μ 和 σ^2 是沿隐藏特征轴计算的均值与方差，γ 与 β 为可学习的仿射缩放与平移参数。层归一化有效稳定了深层网络前向激活与反向梯度的统计分布，但并不能从理论或工程上保证绝对杜绝梯度爆炸、消失或模型训练崩溃等复杂病态。"
      },
      "oneSentenceIdea": "层归一化对特征做标准化，稳定训练。",
      "simpleExplanation": "把每层激活值拉回合适范围，避免数值越来越大或越来越小。",
      "analogy": "层归一化像把不同音量的声音调到可听范围。",
      "steps": [
        "计算均值与方差",
        "标准化特征",
        "可学习缩放与平移"
      ],
      "rigorousNote": "对同一样本的特征维做标准化，再仿射变换。",
      "workedExample": "某层激活过大时，LayerNorm 可缓解后续层震荡。",
      "commonMistake": "与 BatchNorm 混淆；LayerNorm 不依赖 batch 统计。",
      "quiz": {
        "question": "LayerNorm 主要标准化的是？",
        "choices": [
          "同一特征维上的不同样本",
          "同一样本的特征维度",
          "整个数据集的标签",
          "学习率本身"
        ],
        "explanation": "LayerNorm 在特征维上计算统计量并标准化。"
      }
    },
    "en": {
      "primaryExplanation": "In a choir where some singers belt at full volume while others whisper shyly, the resulting blend can sound jarring. A sound engineer levels each singer's microphone channel so their dynamics sit comfortably inside a balanced audio range. Layer normalization plays a similar role within a neural network: it centers and rescales feature activations for each token, smoothing training turbulence even though it cannot promise an absolute cure for every gradient failure or instability.",
      "primaryExplanations": {
        "story": "In a choir where some singers belt at full volume while others whisper shyly, the resulting blend can sound jarring. A sound engineer levels each singer's microphone channel so their dynamics sit comfortably inside a balanced audio range. Layer normalization plays a similar role within a neural network: it centers and rescales feature activations for each token, smoothing training turbulence even though it cannot promise an absolute cure for every gradient failure or instability.",
        "visual": "Imagine the activation values of a single token as an erratic, spiky line graph. Layer normalization first pulls the whole graph down so its average centerline rests directly upon zero, and then compresses or expands its peaks and valleys so the standard deviation matches a clean baseline of 1.0. This visual flattening tames wild activation extremes, yet it cannot guarantee that deep networks will never suffer training degradation or gradient collapse.",
        "rigorous": "Layer Normalization standardizes inputs across the feature channel dimension for individual samples: LN(x) = ((x - μ) / sqrt(σ^2 + ε)) * γ + β, where μ and σ^2 denote sample-wise feature mean and variance, paired with learned scale and bias parameters γ and β. By stabilizing internal covariate shift within activations, layer norm facilitates smoother optimization dynamics, though it provides no mathematical guarantee against vanishing gradients, exploding activations, or divergence in deep stacks."
      },
      "oneSentenceIdea": "Layer Normalization standardizes features to stabilize training.",
      "simpleExplanation": "It pulls the activation values of each layer back into a reasonable range, preventing numbers from exploding or vanishing.",
      "analogy": "Layer Normalization is like a sound engineer adjusting vastly different volumes to a comfortable listening range.",
      "steps": [
        "Calculate the mean and variance",
        "Standardize the features",
        "Apply learnable scaling and shifting"
      ],
      "rigorousNote": "It standardizes the feature dimension for a single sample, followed by an affine transformation.",
      "workedExample": "When a layer's activations grow too large, LayerNorm prevents subsequent layers from oscillating wildly.",
      "commonMistake": "Confusing it with BatchNorm; LayerNorm does not rely on batch statistics.",
      "quiz": {
        "question": "What does LayerNorm primarily standardize?",
        "choices": [
          "Different samples along the same feature dimension",
          "The feature dimension of a single sample",
          "The labels of the entire dataset",
          "The learning rate itself"
        ],
        "explanation": "LayerNorm calculates statistics across the feature dimension for each individual sample."
      }
    }
  },
  {
    "conceptId": "residual-connection",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "公司里层层向下传达口信时，信息经过多个部门层层转述很容易走样变形，甚至遗失最初的核心意图。聪明的办法是在总经办与一线员工之间架设一条直通热线，让原话一字不差地直接送达，并把各部门补充的修改建议作为增量附在上面。残差连接就是这样一条跳过复杂计算层的直达立交桥：它把原始输入直接加到层的输出上，极大减轻了深层网络的梯度传导阻碍，但并不意味着所有训练病态或退化问题都能被彻底根除。",
      "primaryExplanations": {
        "story": "公司里层层向下传达口信时，信息经过多个部门层层转述很容易走样变形，甚至遗失最初的核心意图。聪明的办法是在总经办与一线员工之间架设一条直通热线，让原话一字不差地直接送达，并把各部门补充的修改建议作为增量附在上面。残差连接就是这样一条跳过复杂计算层的直达立交桥：它把原始输入直接加到层的输出上，极大减轻了深层网络的梯度传导阻碍，但并不意味着所有训练病态或退化问题都能被彻底根除。",
        "visual": "在网络布线图上，残差连接就像一条在蜿蜒山路旁开辟的平坦高架直达公路。主干道上的数据流入了弯弯绕绕、充满非线性变换的隧道；而旁边的跳线桥梁则把未经改变的原始输入直接架设过去，在出口处与隧道处理后的产物执行点对点相加（x + F(x)）。在反向传播时，误差信号可以沿着这条平坦的高架桥几乎无损地回流，虽然它显著改善了深层优化，但并不保证杜绝所有训练故障。",
        "rigorous": "残差连接（Residual Connection）通过引入恒等跳跃映射，将网络层的变换形式重构为 y = x + F(x)，其中 x 为恒等输入，F(x) 为残差映射分支。该设计在反向传播链式法则中引入了非消失的加性梯度常数项 ∂y/∂x = I + ∂F/∂x，有效改善了深层网络的梯度流动并缓解了退化问题，但它并不能保证完全杜绝所有深度训练崩溃或梯度失控。"
      },
      "oneSentenceIdea": "残差连接把输入直接加到层输出上。",
      "simpleExplanation": "让信息可以“抄近路”，帮助深层网络训练更稳定。",
      "analogy": "残差像安全通道：主路堵了，信息仍能过去。",
      "steps": [
        "计算层变换 F(x)",
        "与输入 x 相加",
        "得到 x+F(x)"
      ],
      "rigorousNote": "残差块学习的是增量 F(x)，最终输出 y=x+F(x)。",
      "workedExample": "很深的网络若每层都重写表示，易退化；残差减轻该问题。",
      "commonMistake": "以为残差是替代层运算；它是在层运算之外加捷径。",
      "quiz": {
        "question": "残差连接的常见形式是？",
        "choices": [
          "y = x · F(x)",
          "y = x + F(x)",
          "y = 0",
          "y = softmax(x)"
        ],
        "explanation": "标准残差块输出为输入与层输出之和。"
      }
    },
    "en": {
      "primaryExplanation": "In a large organization where a memo passes through six layers of management, the original message often gets garbled by endless revisions. A smart solution adds an executive hotline that sends the exact original text straight to the team, simply attaching the departments' edits as a supplemental note. A residual connection creates this shortcut around complex transformations: it adds the original input directly to the processed output, easing gradient flow without guaranteeing that all deep training hurdles or degradation vanish.",
      "primaryExplanations": {
        "story": "In a large organization where a memo passes through six layers of management, the original message often gets garbled by endless revisions. A smart solution adds an executive hotline that sends the exact original text straight to the team, simply attaching the departments' edits as a supplemental note. A residual connection creates this shortcut around complex transformations: it adds the original input directly to the processed output, easing gradient flow without guaranteeing that all deep training hurdles or degradation vanish.",
        "visual": "On a wiring diagram, a residual connection appears as an express bypass lane running parallel to an industrial processing plant. While the main input feeds into a multi-step transformation block, an open copper wire bridges across the outside and rejoins the path at an addition node (x + F(x)). When learning feedback flows backward, this bypass provides a direct express lane that alleviates vanishing gradients, though it cannot guarantee the prevention of all training failures.",
        "rigorous": "A residual connection re-parameterizes a network layer around an identity skip path: y = x + F(x), where F represents the residual transformation. This formulation introduces an additive identity component into the Jacobian ∂y/∂x = I + ∂F/∂x, counteracting vanishing gradients and easing identity mapping optimization across dozens of layers. Crucially, residual paths improve optimization dynamics but do not guarantee immunity from training instability or numerical divergence."
      },
      "oneSentenceIdea": "A residual connection adds the input directly to the layer's output.",
      "simpleExplanation": "It provides a \"shortcut\" for information to bypass a layer, helping deep networks train more stably.",
      "analogy": "A residual connection is like a bypass lane: if the main road is blocked, traffic (information) can still get through.",
      "steps": [
        "Calculate the layer transformation F(x)",
        "Add the input x to it",
        "Produce the final result x + F(x)"
      ],
      "rigorousNote": "A residual block learns the incremental change F(x), so the final output is y = x + F(x).",
      "workedExample": "If very deep networks rewrite their representations at every layer, they tend to degrade; residual connections alleviate this.",
      "commonMistake": "Thinking a residual connection replaces the layer operation; it is actually a shortcut added alongside the operation.",
      "quiz": {
        "question": "What is the common form of a residual connection?",
        "choices": [
          "y = x · F(x)",
          "y = x + F(x)",
          "y = 0",
          "y = softmax(x)"
        ],
        "explanation": "A standard residual block outputs the sum of the input and the layer's transformation."
      }
    }
  },
  {
    "conceptId": "feed-forward",
    "quizCorrectIndex": 0,
    "zh": {
      "primaryExplanation": "如果说自注意力阶段就像全班同学围坐在一起热烈讨论、互相借阅笔记，那么紧接着的前馈网络就是让每个人“回到自己的书桌前”。在这个独立的环节里，每个词语不需要再左顾右盼与其他词交流，而是关起门来，通过两层私有的数学变换对自己刚才收集到的丰富信息进行消化、提炼并升级成更深刻的抽象概念。",
      "primaryExplanations": {
        "story": "如果说自注意力阶段就像全班同学围坐在一起热烈讨论、互相借阅笔记，那么紧接着的前馈网络就是让每个人“回到自己的书桌前”。在这个独立的环节里，每个词语不需要再左顾右盼与其他词交流，而是关起门来，通过两层私有的数学变换对自己刚才收集到的丰富信息进行消化、提炼并升级成更深刻的抽象概念。",
        "visual": "在架构剖面图上，前馈网络就像一根两头窄、中间宽的特征沙漏或膨胀舱。输入维度为 512 的特征向量首先被推入一个扩容到 2048 维的高维展示厅，经由非线性激活函数的筛选激发后，再被重新压缩回 512 维的紧凑空间。这一扩展再收缩的几何变换在每个位置上独立发生，像一个个独立运转的微型加工车间。",
        "rigorous": "位置前馈网络（Position-wise Feed-Forward Network）是应用于序列中每个位置向量的完全相同且相互独立的多层感知机结构，数学形式为 FFN(x) = max(0, xW_1 + b_1)W_2 + b_2（或采用 GeLU/SwiGLU 变体）。它通过跨通道线性投影与非线性激活对注意力混合后的特征进行逐位置高维非线性重塑，承担了模型大量参数与概念记忆存储的职能。"
      },
      "oneSentenceIdea": "前馈网络对每个位置做两层线性变换。",
      "simpleExplanation": "注意力负责“交流”，前馈负责“各自加工”每个位置的特征。",
      "analogy": "前馈像每个人拿到资料后在自己桌上整理。",
      "steps": [
        "线性升维",
        "非线性激活",
        "线性降回原维度"
      ],
      "rigorousNote": "FFN(x)=W₂σ(W₁x+b₁)+b₂，逐位置独立作用。",
      "workedExample": "把 512 维先升到 2048 维再压回，增强表达能力。",
      "commonMistake": "以为前馈会在不同位置之间混合信息。",
      "quiz": {
        "question": "Transformer 中的前馈网络通常作用于？",
        "choices": [
          "每个位置独立",
          "只作用于第一个 token",
          "整个 batch 混在一起乱序",
          "只处理图片背景"
        ],
        "explanation": "FFN 按位置独立计算，不混合序列位置。"
      }
    },
    "en": {
      "primaryExplanation": "If self-attention is like students gathered in a noisy group brainstorm sharing notes across the table, the feed-forward network is the quiet study desk they return to afterward. In this solitary phase, each token stops conferring with other words in the sentence and processes what it just learned through private layers of calculation, synthesizing the shared clues into a deeper, mature representation.",
      "primaryExplanations": {
        "story": "If self-attention is like students gathered in a noisy group brainstorm sharing notes across the table, the feed-forward network is the quiet study desk they return to afterward. In this solitary phase, each token stops conferring with other words in the sentence and processes what it just learned through private layers of calculation, synthesizing the shared clues into a deeper, mature representation.",
        "visual": "In architecture schematics, the position-wise feed-forward module resembles an expanding and contracting hourglass. A token vector of 512 numbers enters a wide chamber that fans out into 2048 dimensions, passes through a non-linear activation threshold, and then compresses back down into its original 512-dimension footprint. Crucially, this operation happens identically and independently at every point along the sequence line.",
        "rigorous": "A position-wise feed-forward network (FFN) applies identical, independent two-layer affine transformations separated by non-linear activations to each sequence coordinate: FFN(x) = σ(xW_1 + b_1)W_2 + b_2. By projecting features into an expanded intermediate subspace (often 4x the hidden dimension) and back, the FFN applies non-linear capacity to representations without introducing token-to-token cross-communication."
      },
      "oneSentenceIdea": "A feed-forward network applies two linear transformations to each position individually.",
      "simpleExplanation": "While attention handles \"communication\" between words, the feed-forward network handles the \"individual processing\" for each position's features.",
      "analogy": "Feed-forward is like employees returning to their separate desks to process the documents they just received in a meeting.",
      "steps": [
        "Linearly project to a higher dimension",
        "Apply a non-linear activation",
        "Linearly project back down to the original dimension"
      ],
      "rigorousNote": "FFN(x) = W₂σ(W₁x+b₁) + b₂, applied independently to each position.",
      "workedExample": "Projecting a 512-dimensional vector up to 2048 dimensions and back down increases the network's expressive capacity.",
      "commonMistake": "Thinking the feed-forward network mixes information across different positions.",
      "quiz": {
        "question": "In a Transformer, how does the feed-forward network typically operate?",
        "choices": [
          "Independently on each position",
          "Only on the very first token",
          "By scrambling the entire batch together",
          "By exclusively processing image backgrounds"
        ],
        "explanation": "The FFN computes point-wise, acting independently on each position without mixing sequence tokens."
      }
    }
  },
  {
    "conceptId": "multi-head-attention",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "侦探调查案件时，如果只有一位警探，他往往只能盯着某一种线索不放；但如果成立专案组，有的警官专门排查通话记录，有的警官核实不在场证明，有的警官分析监控录像，破案线索就会全面得多。多头注意力正是通过并行派出多个独立的注意力“观察员”，从语法搭配、代词指代、远距离语义等多种视角同时打量句子，最后汇总成一份全面的调查报告。",
      "primaryExplanations": {
        "story": "侦探调查案件时，如果只有一位警探，他往往只能盯着某一种线索不放；但如果成立专案组，有的警官专门排查通话记录，有的警官核实不在场证明，有的警官分析监控录像，破案线索就会全面得多。多头注意力正是通过并行派出多个独立的注意力“观察员”，从语法搭配、代词指代、远距离语义等多种视角同时打量句子，最后汇总成一份全面的调查报告。",
        "visual": "把单头注意力想象成一只单眼望远镜，而多头注意力则是昆虫精巧的复眼系统。并排排列的 8 个或更多个镜头各自安装了不同颜色的滤光镜与焦距，同时从不同的角度对焦同一个画面；有的镜头发现在画面左侧有紧密的近邻关联，有的镜头在远端寻找主谓对应。最后，所有镜头的视野画面被拼合在同一张大银幕上，构成多维立体图景。",
        "rigorous": "多头注意力（Multi-Head Attention）通过将隐层空间投影到多个低维子空间，并行执行独立的缩放点积注意力运算：MHA(Q, K, V) = Concat(head_1, ..., head_h)W^O，其中每个头使用专属的投影矩阵 W_i^Q, W_i^K, W_i^V。这一机制允许模型在不同表征子空间中同时关注来自不同位置和不同类型的信息，有效克服了单组注意力权重在多模态关系建模上的容量瓶颈。"
      },
      "oneSentenceIdea": "多头注意力并行学习多组关系子空间。",
      "simpleExplanation": "一个头可能关注语法，另一个头关注指代，合起来更全面。",
      "analogy": "多头像多位编辑同时审一篇稿，各看不同方面。",
      "steps": [
        "把表示分成多个头",
        "各自做注意力",
        "拼接并线性融合"
      ],
      "rigorousNote": "MultiHead=Concat(head₁…head_h)W^O。",
      "workedExample": "8 个头可同时建模局部搭配与长距离依赖。",
      "commonMistake": "以为多头只是简单重复同一计算。",
      "quiz": {
        "question": "多头注意力的好处主要是？",
        "choices": [
          "只能看一个方向",
          "并行捕获不同类型的依赖",
          "完全取消计算",
          "只用于图像分类"
        ],
        "explanation": "不同头可关注不同子空间关系，再合并信息。"
      }
    },
    "en": {
      "primaryExplanation": "If a detective investigates a crime alone, they might obsess over financial transactions while overlooking physical alibis. A task force of specialists divides the inquiry: one tracks money, another reviews security camera footage, and a third interviews witnesses, assembling a far richer picture. Multi-head attention deploys multiple independent attention heads in parallel, allowing different heads to monitor syntax, pronoun links, and long-range semantic bonds simultaneously.",
      "primaryExplanations": {
        "story": "If a detective investigates a crime alone, they might obsess over financial transactions while overlooking physical alibis. A task force of specialists divides the inquiry: one tracks money, another reviews security camera footage, and a third interviews witnesses, assembling a far richer picture. Multi-head attention deploys multiple independent attention heads in parallel, allowing different heads to monitor syntax, pronoun links, and long-range semantic bonds simultaneously.",
        "visual": "Visualize single-head attention as a monocular spyglass and multi-head attention as a compound insect eye with eight distinct facets. Each facet is fitted with a specialized optical filter tuned to a unique frequency: one facet tracks nearby grammatical ties, another captures subject-verb agreements across wide intervals, and others monitor rhythm or punctuation. Merging the views of all eight facets projects a multi-channel panoramic view of the text.",
        "rigorous": "Multi-Head Attention projects queries, keys, and values into h distinct lower-dimensional subspaces, computes parallel scaled dot-product attention per head, and concatenates the resulting vectors before applying a final linear projection: MHA(Q, K, V) = Concat(head_1, ..., head_h)W^O. This design enables the architecture to simultaneously attend to information from different representation subspaces at different positions, avoiding representational bottlenecks."
      },
      "oneSentenceIdea": "Multi-head attention learns multiple relational subspaces in parallel.",
      "simpleExplanation": "One \"head\" might focus on grammar, while another focuses on pronouns. Together, they provide a more comprehensive understanding.",
      "analogy": "Multi-head attention is like a team of editors reviewing a manuscript simultaneously, each looking for different specific things.",
      "steps": [
        "Split the representation into multiple heads",
        "Perform attention independently in each head",
        "Concatenate the results and apply a linear projection"
      ],
      "rigorousNote": "MultiHead = Concat(head₁...head_h)W^O.",
      "workedExample": "Using 8 heads allows the model to simultaneously capture local word pairings and long-distance dependencies.",
      "commonMistake": "Assuming the multiple heads are just repeating the exact same calculation.",
      "quiz": {
        "question": "What is the main benefit of multi-head attention?",
        "choices": [
          "It can only look in one direction",
          "It captures different types of dependencies in parallel",
          "It cancels out all computations entirely",
          "It is used exclusively for image classification"
        ],
        "explanation": "Different heads attend to different subspaces of relationships, and their information is then combined."
      }
    }
  },
  {
    "conceptId": "encoder-decoder",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "在联合国大会上进行同声传译时，听写译员首先全神贯注地聆听演讲者的中文发言，并在脑海中梳理出完整的发言纲领；随后，交传译员根据这份思考好的思想纲领，结合自己已经说出的英文前情，一步一步翻译出得体的后续英文。编码器-解码器架构正是这种分工：编码器负责充分理解和压缩输入信息，解码器则依据这份理解并在已生成内容的指引下逐步输出目标成果。",
      "primaryExplanations": {
        "story": "在联合国大会上进行同声传译时，听写译员首先全神贯注地聆听演讲者的中文发言，并在脑海中梳理出完整的发言纲领；随后，交传译员根据这份思考好的思想纲领，结合自己已经说出的英文前情，一步一步翻译出得体的后续英文。编码器-解码器架构正是这种分工：编码器负责充分理解和压缩输入信息，解码器则依据这份理解并在已生成内容的指引下逐步输出目标成果。",
        "visual": "把编码器-解码器看作两座隔水相望、由跨河缆车相连的处理塔楼。左侧的编码塔是一组层叠的计算平台，原料从底部输入后逐层向上过滤蒸馏，在塔顶凝结成一份关于源句子的全局特征蓝图；缆车把这份蓝图运送到右侧的解码塔，解码塔一边读取蓝图，一边以自回归单向流水线的方式，自底向上逐字打印出译文序列。",
        "rigorous": "编码器-解码器（Encoder-Decoder）是经典的序列到序列（Seq2Seq）深度架构。编码器通过堆叠双向自注意力与前馈层，将变长输入序列 X 映射为富含上下文的隐层状态序列 H；解码器则利用因果掩码自注意力防止未来信息泄漏，并通过交叉注意力（Cross-Attention）持续将编码器隐状态 H 作为键与值进行检索集成，自回归生成目标序列 Y。"
      },
      "oneSentenceIdea": "编码器读入源序列，解码器生成目标序列。",
      "simpleExplanation": "翻译式任务常先理解原文，再一步步写出译文。",
      "analogy": "先做笔记摘要（编码），再按摘要写文章（解码）。",
      "steps": [
        "编码器压缩源信息",
        "解码器逐步生成",
        "用注意力对齐源与目标"
      ],
      "rigorousNote": "编码器-解码器是序列到序列的条件生成结构。",
      "workedExample": "中译英：编码中文句子，解码生成英文 token。",
      "commonMistake": "以为解码可以一次性“猜完”而不看源信息。",
      "quiz": {
        "question": "编码器-解码器结构中，解码器主要负责？",
        "choices": [
          "只删除源句子",
          "逐步生成目标序列",
          "给界面换主题",
          "压缩磁盘"
        ],
        "explanation": "解码器在给定编码表示下自回归生成输出。"
      }
    },
    "en": {
      "primaryExplanation": "In high-level diplomatic translation, an intake interpreter listens intently to a speech in German, summarizing the core arguments onto a notepad. A second interpreter reads those bullet points and, considering what has already been spoken in French, delivers the translation sentence by sentence. The encoder-decoder architecture operates this way: an encoder digests the entire input context, while a decoder references that summary to generate the target sequence one token at a time.",
      "primaryExplanations": {
        "story": "In high-level diplomatic translation, an intake interpreter listens intently to a speech in German, summarizing the core arguments onto a notepad. A second interpreter reads those bullet points and, considering what has already been spoken in French, delivers the translation sentence by sentence. The encoder-decoder architecture operates this way: an encoder digests the entire input context, while a decoder references that summary to generate the target sequence one token at a time.",
        "visual": "Picture the encoder and decoder as twin towers connected by an overhead suspension bridge. The left tower (encoder) stacks bidirectional processing floors that refine raw input text into a consolidated contextual blueprint at the roof. This blueprint is carried across the bridge into the right tower (decoder), where masked, step-by-step conveyor belts consult the blueprint while generating the output tokens from left to right.",
        "rigorous": "The Encoder-Decoder is a sequence-to-sequence architectural paradigm comprising two complementary subnetworks. The encoder uses bidirectional self-attention stacks to transform variable-length input sequences into latent continuous representations H ∈ R^{T_x x d}. The autoregressive decoder employs causal masked attention over past generated tokens alongside cross-attention over encoder states H to emit target tokens step by step until a termination condition is reached."
      },
      "oneSentenceIdea": "The encoder reads the source sequence, and the decoder generates the target sequence.",
      "simpleExplanation": "In tasks like translation, the model first \"understands\" the original text, then writes out the translation step-by-step.",
      "analogy": "It's like taking notes (encoding) and then writing an essay based on those notes (decoding).",
      "steps": [
        "The encoder compresses the source information",
        "The decoder generates output step-by-step",
        "Attention is used to align the source and target"
      ],
      "rigorousNote": "The encoder-decoder is a sequence-to-sequence conditional generation architecture.",
      "workedExample": "Translating Chinese to English: encode the Chinese sentence, then decode to generate English tokens.",
      "commonMistake": "Thinking the decoder can \"guess\" the entire output all at once without consulting the source information.",
      "quiz": {
        "question": "In an encoder-decoder architecture, what is the decoder primarily responsible for?",
        "choices": [
          "Deleting the source sentence",
          "Generating the target sequence step-by-step",
          "Changing the UI theme",
          "Compressing the hard drive"
        ],
        "explanation": "The decoder generates outputs auto-regressively, conditioned on the encoded representation."
      }
    }
  },
  {
    "conceptId": "transformer",
    "quizCorrectIndex": 1,
    "zh": {
      "primaryExplanation": "在 Transformer 问世之前，计算机处理语言就像听磁带录音机：必须顺着磁带一秒一秒往后放，前面没听完就不能放后面，处理长篇文章时既耗时又容易忘掉开头的伏笔。Transformer 改变了这种串行排队的方式，它像一本同时摊开的书，借助自注意力机制让所有字句瞬间实现全局互通，并通过多层结构进行并行计算。它极大地提升了处理效率，但在长序列显存占用和逻辑推理幻觉等方面依然存在需要面对的工程挑战。",
      "primaryExplanations": {
        "story": "在 Transformer 问世之前，计算机处理语言就像听磁带录音机：必须顺着磁带一秒一秒往后放，前面没听完就不能放后面，处理长篇文章时既耗时又容易忘掉开头的伏笔。Transformer 改变了这种串行排队的方式，它像一本同时摊开的书，借助自注意力机制让所有字句瞬间实现全局互通，并通过多层结构进行并行计算。它极大地提升了处理效率，但在长序列显存占用和逻辑推理幻觉等方面依然存在需要面对的工程挑战。",
        "visual": "在架构宏图上，Transformer 是一套由并排立柱、跨层直通跳线与注意力光网构建的张量处理工厂。输入序列被一字排开，自注意力的光网横向拉通所有位置，前馈网络的垂直管道纵向加深概念提炼，残差立交桥与层归一化则稳稳托住各层之间的数据流动。没有传统循环网络的时间倒带链条，整座结构展现出高度并行化、层叠式的现代张量矩阵吞吐风貌。",
        "rigorous": "Transformer 是一种完全基于自注意力机制与前馈网络堆叠构建的序列建模架构，彻底摒弃了传统的循环神经网络（RNN）时序递归与卷积操作。其核心组件包括输入嵌入与位置编码、多头自注意力模块、逐位置前馈网络、残差连接以及层归一化。Transformer 展现出高度的硬件并行化计算效率与长程依赖建模能力，但其标准的自注意力计算具有对序列长度的二次方复杂度，且无法从根本上消除幻觉或分布外错误。"
      },
      "oneSentenceIdea": "Transformer 是完全基于注意力的序列建模架构。",
      "simpleExplanation": "它用自注意力建模上下文，用前馈和残差等模块堆成深层网络。",
      "analogy": "Transformer 像高效会议室：每个人都能直接听取相关发言。",
      "steps": [
        "输入嵌入加位置编码",
        "多头自注意力与前馈交替",
        "堆叠多层得到表示或生成"
      ],
      "rigorousNote": "Transformer 由注意力子层与 FFN 子层经残差连接堆叠而成。",
      "workedExample": "BERT、GPT 等模型都建立在 Transformer 块之上。",
      "commonMistake": "把 Transformer 简单等同于某个聊天机器人产品。",
      "quiz": {
        "question": "Transformer 的核心组件之一是？",
        "choices": [
          "卷积核尺寸",
          "自注意力机制",
          "决策树分裂",
          "页面路由"
        ],
        "explanation": "自注意力建模任意位置依赖，是 Transformer 的关键。"
      }
    },
    "en": {
      "primaryExplanation": "Before the Transformer, language models read sentences like an old cassette tape, advancing one second at a time through sequential recurrence and often forgetting clues dropped at the beginning by the time they reached the end. The Transformer replaced this single-file queue: it views an entire paragraph simultaneously, using self-attention to connect related words across arbitrary distances in parallel. While this architecture powers modern language systems, it still faces challenges like quadratic memory scaling and occasional hallucinations.",
      "primaryExplanations": {
        "story": "Before the Transformer, language models read sentences like an old cassette tape, advancing one second at a time through sequential recurrence and often forgetting clues dropped at the beginning by the time they reached the end. The Transformer replaced this single-file queue: it views an entire paragraph simultaneously, using self-attention to connect related words across arbitrary distances in parallel. While this architecture powers modern language systems, it still faces challenges like quadratic memory scaling and occasional hallucinations.",
        "visual": "In a blueprint cross-section, the Transformer appears as a high-throughput computational factory built on vertical stacks of alternating tensor floors. Instead of a looping circular conveyor belt, data vectors enter in parallel along the ground floor, connect laterally through horizontal multi-head attention grids, pass through vertical feed-forward amplification chambers, and ride stabilizing residual express lifts. The whole structure is designed for simultaneous, non-recurrent batch processing.",
        "rigorous": "The Transformer is a sequence transduction architecture founded entirely upon stacked self-attention and position-wise feed-forward networks, dispensing with recurrence and convolutions. By pairing multi-head self-attention with residual skip paths, layer normalization, and positional encodings, it enables massive hardware parallelism and robust long-range dependency capture. Nevertheless, canonical dot-product attention scales quadratically O(T^2) with sequence length, and the architecture provides no theoretical immunity against hallucinations or out-of-distribution errors."
      },
      "oneSentenceIdea": "Transformer is a sequence modeling architecture based entirely on attention.",
      "simpleExplanation": "It uses self-attention to model context, stacking modules like feed-forward and residual connections into a deep network.",
      "analogy": "The Transformer is like a highly efficient meeting room: everyone can directly hear the most relevant speakers without going through a chain of command.",
      "steps": [
        "Add positional encoding to input embeddings",
        "Alternate multi-head self-attention with feed-forward layers",
        "Stack multiple layers to obtain representations or generate text"
      ],
      "rigorousNote": "A Transformer is built by stacking attention sublayers and FFN sublayers, connected via residual connections and layer normalization.",
      "workedExample": "Models like BERT and GPT are built entirely on top of Transformer blocks.",
      "commonMistake": "Equating the Transformer architecture simply with a specific chatbot product.",
      "quiz": {
        "question": "What is one of the core components of a Transformer?",
        "choices": [
          "Convolutional kernel sizes",
          "Self-attention mechanisms",
          "Decision tree splits",
          "Page routing"
        ],
        "explanation": "Self-attention models arbitrary positional dependencies and is the key to the Transformer architecture."
      }
    }
  }
];

export function getLesson(conceptId: string, locale: Locale): Lesson | undefined {
  const bilingual = bilingualLessons.find(b => b.conceptId === conceptId);
  if (!bilingual) return undefined;
  const content = bilingual[locale];
  return {
    conceptId: bilingual.conceptId,
    ...content,
    primaryExplanation: content.primaryExplanation || content.primaryExplanations.story,
    primaryExplanations: content.primaryExplanations,
    quiz: {
      ...content.quiz,
      correctIndex: bilingual.quizCorrectIndex,
    }
  };
}

export function getAllLessons(locale: Locale): readonly Lesson[] {
  return bilingualLessons.map(b => getLesson(b.conceptId, locale) as Lesson);
}

// To maintain compatibility with existing export if needed anywhere
export const lessons: readonly Lesson[] = getAllLessons('zh');

function isValidQuiz(quiz: LessonQuiz): boolean {
  if (quiz.question.trim().length === 0) return false;
  if (quiz.choices.length < 2) return false;
  if (quiz.explanation.trim().length === 0) return false;
  if (
    !Number.isInteger(quiz.correctIndex) ||
    quiz.correctIndex < 0 ||
    quiz.correctIndex >= quiz.choices.length
  ) {
    return false;
  }
  return quiz.choices.every((choice) => choice.trim().length > 0);
}

export function validateLessons(
  candidate: readonly Lesson[],
  conceptIds: readonly string[],
): void {
  const known = new Set(conceptIds);
  const seen = new Set<string>();

  for (const lesson of candidate) {
    if (!known.has(lesson.conceptId)) {
      throw new Error(`Unknown lesson conceptId: ${lesson.conceptId}`);
    }
    if (seen.has(lesson.conceptId)) {
      throw new Error(`Duplicate lesson conceptId: ${lesson.conceptId}`);
    }
    seen.add(lesson.conceptId);

    if (
      lesson.primaryExplanation.trim().length === 0 ||
      !lesson.primaryExplanations?.story?.trim() ||
      !lesson.primaryExplanations?.visual?.trim() ||
      !lesson.primaryExplanations?.rigorous?.trim() ||
      lesson.primaryExplanations.story === lesson.primaryExplanations.visual ||
      lesson.primaryExplanations.visual === lesson.primaryExplanations.rigorous ||
      lesson.primaryExplanations.story === lesson.primaryExplanations.rigorous ||
      lesson.oneSentenceIdea.trim().length === 0 ||
      lesson.simpleExplanation.trim().length === 0 ||
      lesson.analogy.trim().length === 0 ||
      lesson.rigorousNote.trim().length === 0 ||
      lesson.workedExample.trim().length === 0 ||
      lesson.commonMistake.trim().length === 0
    ) {
      throw new Error(`Lesson ${lesson.conceptId} has invalid or duplicate primaryExplanations across styles`);
    }
    if (lesson.steps.length < 2 || lesson.steps.length > 4) {
      throw new Error(
        `Lesson ${lesson.conceptId} must have 2-4 steps, got ${lesson.steps.length}`,
      );
    }
    for (const step of lesson.steps) {
      if (step.trim().length === 0) {
        throw new Error(`Lesson ${lesson.conceptId} has empty step`);
      }
    }
    if (!isValidQuiz(lesson.quiz)) {
      throw new Error(`Lesson ${lesson.conceptId} has invalid quiz`);
    }
  }

  for (const id of conceptIds) {
    if (!seen.has(id)) {
      throw new Error(`Missing lesson for concept: ${id}`);
    }
  }
}

// Validate both locales at load time
validateLessons(getAllLessons('zh'), [
  'numbers',
  'variables',
  'algebra',
  'function',
  'vector',
  'sequence',
  'probability',
  'derivative',
  'loss-function',
  'matrix',
  'dot-product',
  'tokenization',
  'neural-network',
  'embedding',
  'gradient-descent',
  'softmax',
  'attention',
  'self-attention',
  'positional-encoding',
  'layer-norm',
  'residual-connection',
  'feed-forward',
  'multi-head-attention',
  'encoder-decoder',
  'transformer',
]);

validateLessons(getAllLessons('en'), [
  'numbers',
  'variables',
  'algebra',
  'function',
  'vector',
  'sequence',
  'probability',
  'derivative',
  'loss-function',
  'matrix',
  'dot-product',
  'tokenization',
  'neural-network',
  'embedding',
  'gradient-descent',
  'softmax',
  'attention',
  'self-attention',
  'positional-encoding',
  'layer-norm',
  'residual-connection',
  'feed-forward',
  'multi-head-attention',
  'encoder-decoder',
  'transformer',
]);
