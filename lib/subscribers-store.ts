import { prisma } from './db';

export async function addSubscriber(email: string): Promise<'created' | 'exists'> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    throw new Error('Invalid email');
  }

  const existing = await prisma.emailSubscriber.findUnique({
    where: { email: normalized },
  });
  if (existing) {
    return 'exists';
  }

  await prisma.emailSubscriber.create({
    data: { email: normalized },
  });
  return 'created';
}
