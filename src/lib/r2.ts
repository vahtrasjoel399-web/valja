import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.R2_ACCOUNT_ID!;
export const BUCKET = process.env.R2_BUCKET!;

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/** Presigned PUT for direct browser upload of the untouched original. */
export function presignPut(key: string, contentType: string) {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 3600 },
  );
}

/** Presigned GET; optionally force download with the original filename. */
export function presignGet(
  key: string,
  opts?: { downloadName?: string; expiresIn?: number },
) {
  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ...(opts?.downloadName
        ? {
            ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(opts.downloadName)}`,
          }
        : {}),
    }),
    { expiresIn: opts?.expiresIn ?? 3600 },
  );
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const bytes = await res.Body!.transformToByteArray();
  return Buffer.from(bytes);
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  await r2.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
}

export async function deleteKeys(keys: string[]) {
  if (!keys.length) return;
  // S3 DeleteObjects caps at 1000 keys per call
  for (let i = 0; i < keys.length; i += 1000) {
    await r2.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })) },
      }),
    );
  }
}
