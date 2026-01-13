import { NextResponse } from 'next/server';
import { readSquad, writeSquad, type PlayerEntry, type PlayerGroup, type StaffEntry } from '../../../lib/squad-store';

export const dynamic = 'force-dynamic';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidGroup = (value: unknown): value is PlayerGroup =>
  value === 'goalkeeper' || value === 'defender' || value === 'midfielder' || value === 'forward';

const toNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const sanitizePlayer = (payload: any, id: number): PlayerEntry | null => {
  const numberValue = toNumber(payload?.number);
  const ageValue = toNumber(payload?.age);
  if (
    !isNonEmptyString(payload?.name) ||
    !isNonEmptyString(payload?.position) ||
    !isNonEmptyString(payload?.nationality) ||
    !isValidGroup(payload?.group) ||
    numberValue === null ||
    ageValue === null
  ) {
    return null;
  }

  return {
    id,
    name: payload.name.trim(),
    position: payload.position.trim(),
    group: payload.group,
    number: numberValue,
    nationality: payload.nationality.trim(),
    age: ageValue,
    image: isNonEmptyString(payload.image) ? payload.image.trim() : '/api/placeholder/300/400',
  };
};

const sanitizeStaff = (payload: any, id: number): StaffEntry | null => {
  if (
    !isNonEmptyString(payload?.name) ||
    !isNonEmptyString(payload?.role) ||
    !isNonEmptyString(payload?.nationality)
  ) {
    return null;
  }

  return {
    id,
    name: payload.name.trim(),
    role: payload.role.trim(),
    nationality: payload.nationality.trim(),
    image: isNonEmptyString(payload.image) ? payload.image.trim() : '/api/placeholder/300/400',
  };
};

export async function GET() {
  const squad = await readSquad();
  return NextResponse.json(squad);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const kind = payload?.kind;
  if (kind !== 'player' && kind !== 'staff') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const squad = await readSquad();
  if (kind === 'player') {
    const nextId = squad.players.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
    const player = sanitizePlayer(payload, nextId);
    if (!player) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const nextPlayers = [...squad.players, player];
    await writeSquad({ ...squad, players: nextPlayers });
    return NextResponse.json(player, { status: 201 });
  }

  const nextId = squad.staff.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const staff = sanitizeStaff(payload, nextId);
  if (!staff) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const nextStaff = [...squad.staff, staff];
  await writeSquad({ ...squad, staff: nextStaff });
  return NextResponse.json(staff, { status: 201 });
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const kind = payload?.kind;
  if (typeof payload?.id !== 'number' || (kind !== 'player' && kind !== 'staff')) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const squad = await readSquad();
  if (kind === 'player') {
    const index = squad.players.findIndex((item) => item.id === payload.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const merged = {
      ...squad.players[index],
      ...payload,
    };
    const player = sanitizePlayer(merged, payload.id);
    if (!player) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const nextPlayers = [...squad.players];
    nextPlayers[index] = player;
    await writeSquad({ ...squad, players: nextPlayers });
    return NextResponse.json(player);
  }

  const index = squad.staff.findIndex((item) => item.id === payload.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const merged = {
    ...squad.staff[index],
    ...payload,
  };
  const staff = sanitizeStaff(merged, payload.id);
  if (!staff) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const nextStaff = [...squad.staff];
  nextStaff[index] = staff;
  await writeSquad({ ...squad, staff: nextStaff });
  return NextResponse.json(staff);
}

export async function DELETE(request: Request) {
  const payload = await request.json();
  const kind = payload?.kind;
  if (typeof payload?.id !== 'number' || (kind !== 'player' && kind !== 'staff')) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const squad = await readSquad();
  if (kind === 'player') {
    const nextPlayers = squad.players.filter((item) => item.id !== payload.id);
    if (nextPlayers.length === squad.players.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await writeSquad({ ...squad, players: nextPlayers });
    return NextResponse.json({ ok: true });
  }

  const nextStaff = squad.staff.filter((item) => item.id !== payload.id);
  if (nextStaff.length === squad.staff.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await writeSquad({ ...squad, staff: nextStaff });
  return NextResponse.json({ ok: true });
}
