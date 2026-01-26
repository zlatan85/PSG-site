import { prisma } from '@/lib/db';
import { load } from 'cheerio';

const MANUAL_SOURCE = {
  name: 'Manuel',
  type: 'manual',
  url: 'manual://psg',
  language: 'fr',
  reliabilityWeight: 0.8,
  isActive: true,
};

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

const ensureManualSource = async () => {
  const existing = await prisma.source.findUnique({ where: { url: MANUAL_SOURCE.url } });
  if (existing) return existing;
  return prisma.source.create({ data: MANUAL_SOURCE });
};

export const ingestManualUrls = async (urls: string[]) => {
  const source = await ensureManualSource();
  const results: { url: string; created: boolean; error?: string }[] = [];

  for (const rawUrl of urls) {
    const trimmed = rawUrl.trim();
    if (!trimmed) continue;
    const existing = await prisma.ingestItem.findUnique({ where: { url: trimmed } });
    if (existing) {
      results.push({ url: trimmed, created: false });
      continue;
    }

    try {
      const html = await fetchWithTimeout(trimmed);
      if (!html) {
        results.push({ url: trimmed, created: false, error: 'Fetch failed' });
        continue;
      }

      const { title, excerpt, canonical } = extractMeta(html);
      if (!title) {
        results.push({ url: trimmed, created: false, error: 'Missing title' });
        continue;
      }

      await prisma.ingestItem.create({
        data: {
          sourceId: source.id,
          url: canonical || trimmed,
          title,
          publishedAt: null,
          language: 'fr',
          excerptShort: excerpt || null,
          rawText: null,
        },
      });

      results.push({ url: trimmed, created: true });
    } catch (error) {
      console.error('Manual ingest failed', trimmed, error);
      results.push({ url: trimmed, created: false, error: 'Ingest failed' });
    }
  }

  return results;
};
