import crypto from 'crypto';
import { prisma } from './db';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  salt: string;
  passwordHash: string;
  emailVerified?: boolean;
  verificationCode?: string;
  verificationExpiresAt?: string;
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  userId: number;
  createdAt: string;
  expiresAt: string;
}

export async function readUsers(): Promise<UserRecord[]> {
  const users = await prisma.user.findMany();
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    salt: user.salt,
    passwordHash: user.passwordHash,
    emailVerified: user.emailVerified,
    verificationCode: user.verificationCode ?? undefined,
    verificationExpiresAt: user.verificationExpiresAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
  }));
}

export async function writeUsers(users: UserRecord[]): Promise<void> {
  await prisma.$transaction(
    users.map((user) =>
      prisma.user.upsert({
        where: { id: user.id },
        update: {
          name: user.name,
          email: user.email,
          salt: user.salt,
          passwordHash: user.passwordHash,
          emailVerified: user.emailVerified ?? false,
          verificationCode: user.verificationCode ?? null,
          verificationExpiresAt: user.verificationExpiresAt ? new Date(user.verificationExpiresAt) : null,
        },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          salt: user.salt,
          passwordHash: user.passwordHash,
          emailVerified: user.emailVerified ?? false,
          verificationCode: user.verificationCode ?? null,
          verificationExpiresAt: user.verificationExpiresAt ? new Date(user.verificationExpiresAt) : null,
          createdAt: new Date(user.createdAt),
        },
      })
    )
  );
}

export async function readSessions(): Promise<SessionRecord[]> {
  const sessions = await prisma.session.findMany();
  return sessions.map((session) => ({
    token: session.token,
    userId: session.userId,
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
  }));
}

export async function writeSessions(sessions: SessionRecord[]): Promise<void> {
  await prisma.$transaction(
    sessions.map((session) =>
      prisma.session.upsert({
        where: { token: session.token },
        update: {
          userId: session.userId,
          createdAt: new Date(session.createdAt),
          expiresAt: new Date(session.expiresAt),
        },
        create: {
          token: session.token,
          userId: session.userId,
          createdAt: new Date(session.createdAt),
          expiresAt: new Date(session.expiresAt),
        },
      })
    )
  );
}

export function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

export function createSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function createSessionToken(): string {
  return crypto.randomUUID();
}

export function sessionExpiry(days = 7): string {
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return expiresAt.toISOString();
}

export function createVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function verificationExpiry(minutes = 30): string {
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
  return expiresAt.toISOString();
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id: number): Promise<UserRecord | undefined> {
  const users = await readUsers();
  return users.find((user) => user.id === id);
}

export async function getUserFromToken(token: string | null): Promise<UserRecord | null> {
  if (!token) return null;
  const sessions = await readSessions();
  const session = sessions.find((item) => item.token === token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await writeSessions(sessions.filter((item) => item.token !== token));
    return null;
  }

  return findUserById(session.userId) ?? null;
}
