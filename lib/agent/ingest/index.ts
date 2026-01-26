import { prisma } from '../../db';
import { syncSources } from '../sources';
import { ingestRssSource } from './rss';
import { ingestUrlListSource } from './urlList';

export const ingestSources = async () => {
  await syncSources();
  const sources = await prisma.source.findMany({ where: { isActive: true } });
  const results = [] as { source: string; created: number; error?: string }[];

  for (const source of sources) {
    if (source.type === 'rss') {
      results.push(await ingestRssSource(source));
      continue;
    }
    if (source.type === 'url_list') {
      results.push(await ingestUrlListSource(source));
      continue;
    }
  }

  return results;
};
