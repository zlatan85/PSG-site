import Parser from 'rss-parser';
import { prisma } from '../../db';
import type { Source } from '@prisma/client';
import { isPsgTopic } from './filters';

const parser = new Parser({ timeout: 8000 });

const safeDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const sanitizeXml = (value: string) =>
  value.replace(/&(?![a-zA-Z]+;|#\d+;|#x[a-fA-F0-9]+;)/g, '&amp;');

const escapeAllEntities = (value: string) => value.replace(/&/g, '&amp;');

const fetchRssText = async (url: string) => {
  const response = await fetch(url, {
    headers: { 'user-agent': 'PSG-News-Agent/0.1 (+https://ulteampsgx.site)' },
  });
  if (!response.ok) {
    throw new Error(`RSS fetch failed (${response.status})`);
  }
  return response.text();
};

const extractRssItemsFallback = (xml: string) => {
  const items = [] as {
    title: string;
    link: string;
    isoDate?: string;
    contentSnippet?: string;
  }[];
  const blocks = xml.split(/<item>/i).slice(1);
  for (const block of blocks) {
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1]?.trim() ||
      block.match(/<title>(.*?)<\/title>/i)?.[1]?.trim();
    const link = block.match(/<link>(.*?)<\/link>/i)?.[1]?.trim();
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/i)?.[1]?.trim();
    const description = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i)?.[1]?.trim() ||
      block.match(/<description>(.*?)<\/description>/i)?.[1]?.trim();
    if (title && link) {
      items.push({ title, link, isoDate: pubDate, contentSnippet: description });
    }
  }
  return items;
};

export const ingestRssSource = async (source: Source) => {
  let created = 0;
  try {
    const raw = await fetchRssText(source.url);
    let feed;
    try {
      feed = await parser.parseString(sanitizeXml(raw));
    } catch (innerError) {
      try {
        feed = await parser.parseString(escapeAllEntities(raw));
      } catch (fallbackError) {
        const fallbackItems = extractRssItemsFallback(raw);
        feed = { items: fallbackItems };
      }
    }

    for (const item of feed.items ?? []) {
      const url = item.link?.trim();
      const title = item.title?.trim();
      if (!url || !title) continue;
      if (!isPsgTopic(title)) continue;

      const existing = await prisma.ingestItem.findUnique({ where: { url } });
      if (existing) continue;

      await prisma.ingestItem.create({
        data: {
          sourceId: source.id,
          url,
          title,
          publishedAt: safeDate(item.isoDate ?? item.pubDate ?? undefined),
          language: source.language,
          excerptShort: item.contentSnippet?.trim() ?? null,
          rawText: item.content?.trim() ?? null,
        },
      });
      created += 1;
    }

    return { source: source.url, created };
  } catch (error) {
    console.error('RSS ingest failed', source.url, error);
    return { source: source.url, created, error: 'RSS parse failed' };
  }
};
