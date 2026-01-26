import { prisma } from '../db';
import { fuzzy } from 'fast-fuzzy';

const HOURS_48 = 48 * 60 * 60 * 1000;

const pickTopicTitle = (titles: string[]) => titles.sort((a, b) => a.length - b.length)[0] || 'Actu PSG';

export const clusterIngestItems = async () => {
  const since = new Date(Date.now() - HOURS_48);
  const items = await prisma.ingestItem.findMany({
    where: {
      fetchedAt: { gte: since },
      clusterItems: { none: {} },
    },
  });

  const clusters = await prisma.cluster.findMany({
    where: { createdAt: { gte: since } },
    include: { items: { include: { item: true } } },
  });

  let created = 0;
  let linked = 0;

  for (const item of items) {
    let bestClusterId: number | null = null;
    let bestScore = 0;

    for (const cluster of clusters) {
      const titles = cluster.items.map((entry) => entry.item.title).filter(Boolean);
      for (const title of titles) {
        const score = Math.round(fuzzy(item.title, title) * 100);
        if (score > bestScore) {
          bestScore = score;
          bestClusterId = cluster.id;
        }
      }
    }

    if (bestClusterId && bestScore >= 80) {
      await prisma.clusterItem.create({
        data: {
          clusterId: bestClusterId,
          itemId: item.id,
          similarity: bestScore,
        },
      });
      linked += 1;
      continue;
    }

    const cluster = await prisma.cluster.create({
      data: {
        topicTitle: pickTopicTitle([item.title]),
        status: 'pending',
        category: null,
        confidence: 0.5,
        items: { create: [{ itemId: item.id, similarity: null }] },
      },
    });
    clusters.push({ ...cluster, items: [{ id: 0, clusterId: cluster.id, itemId: item.id, similarity: null, item }] });
    created += 1;
  }

  return { created, linked };
};
