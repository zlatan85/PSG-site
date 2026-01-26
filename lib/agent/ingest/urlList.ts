import { load } from 'cheerio';
import { prisma } from '../../db';
import type { Source } from '@prisma/client';
import { isPsgTopic } from './filters';

const fetchWithTimeout = async (url: string, timeoutMs = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'PSG-News-Agent/0.1 (+https://ulteampsgx.site)' },
    });
    if (!response.ok) return null;
    return await response.text();
  } finally {
    clearTimeout(id);
  }
};

const extractMeta = (html: string) => {
  const $ = load(html);
  const title = $('meta[property="og:title"]').attr('content') || $('title').text();
  const desc =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    '';
  const canonical = $('link[rel="canonical"]').attr('href');
  return {
    title: title?.trim() ?? '',
    excerpt: desc?.trim() ?? '',
    canonical: canonical?.trim() ?? '',
  };
};

export const ingestUrlListSource = async (source: Source) => {
  const html = await fetchWithTimeout(source.url);
  if (!html) return { source: source.url, created: 0 };

  const { title, excerpt, canonical } = extractMeta(html);
  const url = canonical || source.url;

  const existing = await prisma.ingestItem.findUnique({ where: { url } });
  if (existing || !title || !isPsgTopic(title)) {
    return { source: source.url, created: 0 };
  }

  await prisma.ingestItem.create({
    data: {
      sourceId: source.id,
      url,
      title,
      publishedAt: null,
      language: source.language,
      excerptShort: excerpt || null,
      rawText: null,
    },
  });

  return { source: source.url, created: 1 };
};
