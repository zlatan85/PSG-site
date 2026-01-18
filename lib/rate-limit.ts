type RateRecord = {
  lastHit: number;
};

const memoryStore = new Map<string, RateRecord>();

export function getClientFingerprint(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : headers.get('x-real-ip') || 'unknown';
  const ua = headers.get('user-agent') || 'unknown';
  return `${ip}::${ua}`;
}

export function isRateLimited(key: string, cooldownMs: number): boolean {
  const now = Date.now();
  const record = memoryStore.get(key);
  if (!record) {
    memoryStore.set(key, { lastHit: now });
    return false;
  }
  if (now - record.lastHit < cooldownMs) {
    return true;
  }
  record.lastHit = now;
  memoryStore.set(key, record);
  return false;
}
