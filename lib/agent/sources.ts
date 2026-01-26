import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../db';

export type SourceConfig = {
  name: string;
  type: string;
  url: string;
  language: string;
  reliabilityWeight?: number;
  isActive?: boolean;
};

export const loadSourcesConfig = async (): Promise<SourceConfig[]> => {
  const filePath = path.join(process.cwd(), 'config', 'sources.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as SourceConfig[];
  return Array.isArray(parsed) ? parsed : [];
};

export const syncSources = async () => {
  const sources = await loadSourcesConfig();
  const results = [] as { url: string; created: boolean }[];

  for (const source of sources) {
    const existing = await prisma.source.findUnique({ where: { url: source.url } });
    if (existing) {
      await prisma.source.update({
        where: { id: existing.id },
        data: {
          name: source.name,
          type: source.type,
          language: source.language,
          reliabilityWeight: source.reliabilityWeight ?? existing.reliabilityWeight,
          isActive: source.isActive ?? existing.isActive,
        },
      });
      results.push({ url: source.url, created: false });
    } else {
      await prisma.source.create({
        data: {
          name: source.name,
          type: source.type,
          url: source.url,
          language: source.language,
          reliabilityWeight: source.reliabilityWeight ?? 0.5,
          isActive: source.isActive ?? true,
        },
      });
      results.push({ url: source.url, created: true });
    }
  }

  return results;
};
