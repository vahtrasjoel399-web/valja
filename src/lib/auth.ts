import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

const ADMIN_COOKIE = 'vp_admin';
const GALLERY_COOKIE = (galleryId: string) => `vp_g_${galleryId}`;

async function sign(payload: Record<string, unknown>, days: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secret());
}

async function verify(token: string | undefined): Promise<Record<string, unknown> | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

/* ---------- admin session ---------- */

export async function setAdminSession() {
  const token = await sign({ role: 'admin' }, 7);
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const payload = await verify(token);
  return payload?.role === 'admin';
}

/* ---------- gallery access session ---------- */

export async function setGalleryAccess(galleryId: string) {
  const token = await sign({ g: galleryId }, 30);
  (await cookies()).set(GALLERY_COOKIE(galleryId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** Access is granted when the gallery has no password, the visitor unlocked it, or an admin is logged in. */
export async function hasGalleryAccess(
  galleryId: string,
  passwordHash: string | null,
): Promise<boolean> {
  if (!passwordHash) return true;
  if (await isAdmin()) return true;
  const token = (await cookies()).get(GALLERY_COOKIE(galleryId))?.value;
  const payload = await verify(token);
  return payload?.g === galleryId;
}
