export interface DiagnosticQuestion {
  id: string;
  conceptId: string;
  question: string;
  choices: readonly string[];
  correctIndex: number;
}

export const diagnosticQuestions: readonly DiagnosticQuestion[] = [
  {
    id: 'diag-vector',
    conceptId: 'vector',
    question: '向量最适合用来表示什么？',
    choices: ['一段纯文本', '一组有方向的数值', '一个数据库表', '一句自然语言'],
    correctIndex: 1,
  },
  {
    id: 'diag-matrix',
    conceptId: 'matrix',
    question: '矩阵在神经网络里通常扮演什么角色？',
    choices: [
      '保存网页缓存',
      '编译源代码',
      '描述线性变换与参数',
      '管理用户会话',
    ],
    correctIndex: 2,
  },
  {
    id: 'diag-probability',
    conceptId: 'probability',
    question: '概率取值的合理范围是？',
    choices: ['只能是整数', '任意负数', '必须大于 100', '0 到 1 之间'],
    correctIndex: 3,
  },
  {
    id: 'diag-neural-network',
    conceptId: 'neural-network',
    question: '神经网络大致可以看成什么？',
    choices: [
      '固定不变的查找表',
      '可学习的函数近似器',
      '操作系统进程调度器',
      '文件压缩工具',
    ],
    correctIndex: 1,
  },
  {
    id: 'diag-attention',
    conceptId: 'attention',
    question: '注意力机制主要在做什么？',
    choices: [
      '按相关性对信息加权汇总',
      '把文本翻译成二进制',
      '随机打乱序列顺序',
      '压缩图片像素',
    ],
    correctIndex: 0,
  },
] as const;
