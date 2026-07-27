import { sql } from '@vercel/postgres';

export { sql };

/* Lazy, idempotent schema creation — runs once per serverless instance. */
let ready: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!ready) ready = migrate();
  return ready;
}

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS galleries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      password_hash text,
      views integer NOT NULL DEFAULT 0,
      zip_downloads integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
      filename text NOT NULL,
      key_original text NOT NULL,
      key_medium text NOT NULL,
      key_thumb text NOT NULL,
      width integer NOT NULL DEFAULT 0,
      height integer NOT NULL DEFAULT 0,
      size_bytes bigint NOT NULL DEFAULT 0,
      downloads integer NOT NULL DEFAULT 0,
      position integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_photos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      category text NOT NULL,
      title text NOT NULL DEFAULT '',
      key_medium text NOT NULL,
      key_thumb text NOT NULL,
      width integer NOT NULL DEFAULT 0,
      height integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS photos_gallery_idx ON photos(gallery_id, position, created_at)`;
}

export type GalleryRow = {
  id: string;
  slug: string;
  title: string;
  password_hash: string | null;
  views: number;
  zip_downloads: number;
  created_at: string;
};

export type PhotoRow = {
  id: string;
  gallery_id: string;
  filename: string;
  key_original: string;
  key_medium: string;
  key_thumb: string;
  width: number;
  height: number;
  size_bytes: number;
  downloads: number;
  position: number;
  created_at: string;
};
