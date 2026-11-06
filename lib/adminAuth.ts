import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// Basic auth for the admin dashboard. Fails closed: with no ADMIN_USERNAME or
// ADMIN_PASSWORD set in the environment, nobody gets in.
export function isAdmin(req: NextRequest): boolean {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return false;
  const header = req.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8');
  const i = decoded.indexOf(':');
  if (i < 0) return false;
  return same(decoded.slice(0, i), user) && same(decoded.slice(i + 1), pass);
}
