import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../db';
import { Prisma } from '@prisma/client';
import { generateText } from '../llm';

const loadPrompt = async (name: string) => {
  const filePath = path.join(process.cwd(), 'prompts', `${name}.prompt.md`);
  return fs.readFile(filePath, 'utf-8');
};

const renderPrompt = (template: string, variables: Record<string, string>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? '');

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);

const formatSources = (items: { name: string; url: string; date?: string | null }[]) =>
  items
    .map((item) => `- ${item.name} | ${item.url} | ${item.date ?? ''}`.trim())
    .join('\n');

const safeJsonParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return null;
  }
};

const ensureSourcesFooter = (content: string, sources: { name: string; url: string; date?: string | null }[]) => {
  const trimmed = content.trim();
  if (/\bSources\b/i.test(trimmed)) return trimmed;
  return `${trimmed}\n\nSources:\n${formatSources(sources)}`;
};

export const generateBriefForCluster = async (clusterId: number) => {
  const cluster = await prisma.cluster.findUnique({
    where: { id: clusterId },
    include: {
      items: { include: { item: { include: { source: true } } } },
    },
  });

  if (!cluster) {
    throw new Error('Cluster introuvable');
  }

  const sources = cluster.items.map((entry) => ({
    name: entry.item.source?.name ?? 'Source',
    url: entry.item.url,
    date: entry.item.publishedAt?.toISOString().slice(0, 10) ?? null,
  }));

  const promptTemplate = await loadPrompt('brief');
  const prompt = renderPrompt(promptTemplate, {
    sources: formatSources(sources),
  });

  const brief = await generateText({ prompt, temperature: 0.3, maxTokens: 500 });

  const content = await prisma.generatedContent.create({
    data: {
      clusterId: cluster.id,
      kind: 'brief',
      content: brief || 'Brief indisponible.',
    },
  });

  return content;
};

export const generateArticleDraft = async (clusterId: number) => {
  const cluster = await prisma.cluster.findUnique({
    where: { id: clusterId },
    include: {
      items: { include: { item: { include: { source: true } } } },
      contents: true,
    },
  });

  if (!cluster) {
    throw new Error('Cluster introuvable');
  }

  const sources = cluster.items.map((entry) => ({
    name: entry.item.source?.name ?? 'Source',
    url: entry.item.url,
    date: entry.item.publishedAt?.toISOString().slice(0, 10) ?? null,
  }));

  const brief =
    [...cluster.contents]
      .reverse()
      .find((item) => item.kind === 'brief')?.content ||
    sources.map((source) => `- ${source.name}: ${source.url}`).join('\n');

  const promptTemplate = await loadPrompt('article');
  const prompt = renderPrompt(promptTemplate, {
    sources: formatSources(sources),
    brief,
  });

  const raw = await generateText({ prompt, temperature: 0.4, maxTokens: 1200 });

  type ArticlePayload = {
    title: string;
    excerpt: string;
    content: string;
    sources?: { name: string; url: string; date?: string }[];
  };

  const parsed = safeJsonParse<ArticlePayload>(raw);
  const title = parsed?.title?.trim() || cluster.topicTitle;
  const excerpt = parsed?.excerpt?.trim() || `Tour d'horizon autour de ${cluster.topicTitle}.`;
  const content = ensureSourcesFooter(parsed?.content?.trim() || raw, sources);
  const finalSources = parsed?.sources?.length ? parsed.sources : sources;

  const baseSlug = slugify(title) || `cluster-${cluster.id}`;
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.generatedArticle.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const sourcesPayload = finalSources as unknown as Prisma.InputJsonValue;

  const draft = await prisma.generatedArticle.create({
    data: {
      clusterId: cluster.id,
      title,
      slug,
      excerpt,
      content,
      imageUrl: null,
      sources: sourcesPayload,
      status: 'draft',
    },
  });

  await prisma.cluster.update({
    where: { id: cluster.id },
    data: { status: 'draft' },
  });

  return draft;
};
