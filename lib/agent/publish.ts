import { prisma } from '../db';

const DEFAULT_IMAGE = '/api/placeholder/1200/700';

const formatDate = () => new Date().toISOString().slice(0, 10);

export const publishDraft = async (draftId: number) => {
  const draft = await prisma.generatedArticle.findUnique({
    where: { id: draftId },
    include: { cluster: true },
  });

  if (!draft) {
    throw new Error('Draft introuvable');
  }

  if (!draft.sources || (Array.isArray(draft.sources) && draft.sources.length === 0)) {
    throw new Error('Sources manquantes');
  }

  const news = await prisma.newsArticle.create({
    data: {
      title: draft.title,
      excerpt: draft.excerpt,
      content: draft.content,
      image: draft.imageUrl?.trim() || DEFAULT_IMAGE,
      date: formatDate(),
    },
  });

  await prisma.generatedArticle.update({
    where: { id: draft.id },
    data: {
      status: 'published',
      publishedAt: new Date(),
    },
  });

  await prisma.cluster.update({
    where: { id: draft.clusterId },
    data: { status: 'published' },
  });

  return news;
};
