import { prisma } from './db';

export type PlayerGroup = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';

export interface PlayerEntry {
  id: number;
  name: string;
  position: string;
  group: PlayerGroup;
  number: number;
  nationality: string;
  age: number;
  image: string;
}

export interface StaffEntry {
  id: number;
  name: string;
  role: string;
  nationality: string;
  image: string;
}

export interface SquadData {
  players: PlayerEntry[];
  staff: StaffEntry[];
}

export async function readSquad(): Promise<SquadData> {
  const [players, staff] = await Promise.all([
    prisma.player.findMany(),
    prisma.staff.findMany(),
  ]);
  return {
    players: players.map((player) => ({
      id: player.id,
      name: player.name,
      position: player.position,
      group: player.groupName as PlayerGroup,
      number: player.number,
      nationality: player.nationality,
      age: player.age,
      image: player.image,
    })),
    staff: staff.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      nationality: member.nationality,
      image: member.image,
    })),
  };
}

export async function writeSquad(data: SquadData): Promise<void> {
  await prisma.player.deleteMany();
  await prisma.staff.deleteMany();
  if (data.players.length > 0) {
    await prisma.player.createMany({
      data: data.players.map((player) => ({
        id: player.id,
        name: player.name,
        position: player.position,
        groupName: player.group,
        number: player.number,
        nationality: player.nationality,
        age: player.age,
        image: player.image,
      })),
    });
  }
  if (data.staff.length > 0) {
    await prisma.staff.createMany({
      data: data.staff.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        nationality: member.nationality,
        image: member.image,
      })),
    });
  }
}
