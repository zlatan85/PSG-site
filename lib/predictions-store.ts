import { prisma } from './db';

export interface PredictionEntry {
  id: number;
  name: string;
  handle: string;
  homeScore: number;
  awayScore: number;
  approved: boolean;
  createdAt: string;
}

export async function readPredictions(): Promise<PredictionEntry[]> {
  const predictions = await prisma.fanPrediction.findMany({ orderBy: { createdAt: 'desc' } });
  return predictions.map((item) => ({
    id: item.id,
    name: item.name,
    handle: item.handle ?? '',
    homeScore: item.homeScore,
    awayScore: item.awayScore,
    approved: item.approved,
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function writePredictions(predictions: PredictionEntry[]): Promise<void> {
  await prisma.fanPrediction.deleteMany();
  if (predictions.length > 0) {
    await prisma.fanPrediction.createMany({
      data: predictions.map((item) => ({
        id: item.id,
        name: item.name,
        handle: item.handle || null,
        homeScore: item.homeScore,
        awayScore: item.awayScore,
        approved: item.approved,
        createdAt: new Date(item.createdAt),
      })),
    });
  }
}
