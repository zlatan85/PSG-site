const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const readJson = (file) => {
  const fullPath = path.join(process.cwd(), 'data', file);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
};

const normalizeImage = (value) => {
  if (!value) return '/api/placeholder/300/400';
  const trimmed = value.split('/api/placeholder')[0].trim();
  return trimmed.length > 0 ? trimmed : '/api/placeholder/300/400';
};

async function main() {
  const news = readJson('news.json') || [];
  const matches = readJson('matches.json') || [];
  const liveMatch = readJson('live-match.json');
  const fanWall = readJson('fan-wall.json') || [];
  const squad = readJson('squad.json') || { players: [], staff: [] };
  const users = readJson('users.json') || [];
  const sessions = readJson('sessions.json') || [];

  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.fanWallPost.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.liveMatch.deleteMany();

  if (users.length) {
    await prisma.user.createMany({
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        salt: user.salt,
        passwordHash: user.passwordHash,
        emailVerified: user.emailVerified ?? false,
        verificationCode: user.verificationCode ?? null,
        verificationExpiresAt: user.verificationExpiresAt ? new Date(user.verificationExpiresAt) : null,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      })),
    });
  }

  if (sessions.length) {
    await prisma.session.createMany({
      data: sessions.map((session) => ({
        token: session.token,
        userId: session.userId,
        createdAt: new Date(session.createdAt),
        expiresAt: new Date(session.expiresAt),
      })),
    });
  }

  if (news.length) {
    await prisma.newsArticle.createMany({
      data: news.map((item) => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        content: item.content ?? null,
        image: item.image,
        date: item.date,
      })),
    });
  }

  if (matches.length) {
    await prisma.match.createMany({
      data: matches.map((match) => ({
        id: match.id,
        date: match.date,
        time: match.time,
        home: match.home,
        away: match.away,
        competition: match.competition,
        stadium: match.stadium,
        status: match.status,
        score: match.score ?? null,
        result: match.result ?? null,
      })),
    });
  }

  if (fanWall.length) {
    await prisma.fanWallPost.createMany({
      data: fanWall.map((post) => ({
        id: post.id,
        name: post.name,
        handle: post.handle || null,
        message: post.message,
        time: post.time || null,
        approved: post.approved ?? false,
      })),
    });
  }

  if (squad.players.length) {
    await prisma.player.createMany({
      data: squad.players.map((player) => ({
        id: player.id,
        name: player.name,
        position: player.position,
        groupName: player.group,
        number: player.number,
        nationality: player.nationality,
        age: player.age,
        image: normalizeImage(player.image),
      })),
    });
  }

  if (squad.staff.length) {
    await prisma.staff.createMany({
      data: squad.staff.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        nationality: member.nationality,
        image: normalizeImage(member.image),
      })),
    });
  }

  if (liveMatch) {
    await prisma.liveMatch.create({
      data: {
        id: 1,
        payload: liveMatch,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed complete');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
