import { z } from 'zod';

const shortText = (max: number) => z.string().trim().min(1).max(max);

export const ExploreRequestSchema = z.object({
  topic: shortText(160),
  locale: z.enum(['zh', 'en']),
}).strict();

export const ExploreArticleSchema = z.object({
  title: shortText(160),
  lede: shortText(500),
  paragraphs: z.array(shortText(1800)).min(2).max(8),
  fable: z.object({
    title: shortText(160),
    paragraphs: z.array(shortText(1800)).min(3).max(6),
    reveal: shortText(800),
    mappings: z.array(z.object({
      image: shortText(120),
      meaning: shortText(500),
    }).strict()).min(2).max(6),
  }).strict().nullable(),
  related: z.array(z.object({
    topic: shortText(160),
    connection: shortText(200),
  }).strict()).min(2).max(8),
}).strict();

export type ExploreRequest = z.infer<typeof ExploreRequestSchema>;
export type ExploreArticle = z.infer<typeof ExploreArticleSchema>;
