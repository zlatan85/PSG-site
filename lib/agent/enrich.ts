import { prisma } from '../db';

const pickCategory = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes('mercato') || normalized.includes('transfert')) return 'Mercato';
  if (normalized.includes('bless') || normalized.includes('sante')) return 'Infirmerie';
  if (normalized.includes('ligue 1') || normalized.includes('championnat')) return 'Ligue 1';
  if (normalized.includes('champions') || normalized.includes('ldc')) return 'Ligue des champions';
  return 'Actualite';
};

export const enrichCluster = async (clusterId: number) => {
  const cluster = await prisma.cluster.findUnique({ where: { id: clusterId } });
  if (!cluster) return null;

  const category = pickCategory(cluster.topicTitle);
  const confidence = cluster.confidence;

  await prisma.cluster.update({
    where: { id: clusterId },
    data: { category, confidence },
  });

  return { category, confidence };
};
