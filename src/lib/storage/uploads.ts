import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Local file storage for the prototype.
 *
 * Files are stored outside the public directory and are only ever served
 * through an authenticated route that checks ownership (docs/05 §10, §34).
 */

const UPLOAD_ROOT = path.resolve(process.cwd(), process.env.STORAGE_PATH || '.data/uploads');
export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const ACCEPTED_UPLOAD_ATTRIBUTE = '.pdf,.jpg,.jpeg,.png,.webp';

export interface StoredFile {
  storageKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
}

export interface UploadValidationError {
  ok: false;
  error: string;
}

export type UploadValidationResult = { ok: true } | UploadValidationError;

export function validateUpload(input: { fileName: string; mimeType: string; size: number }): UploadValidationResult {
  if (!ALLOWED_MIME_TYPES[input.mimeType]) {
    return {
      ok: false,
      error: 'Only PDF, JPG, PNG and WEBP files can be uploaded.',
    };
  }
  if (input.size <= 0) {
    return { ok: false, error: 'The selected file is empty.' };
  }
  if (input.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `The file is larger than the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB limit.`,
    };
  }
  if (!/\.[a-z0-9]{2,5}$/i.test(input.fileName)) {
    return { ok: false, error: 'The file name does not have a valid extension.' };
  }
  return { ok: true };
}

function extensionFor(mimeType: string): string {
  return ALLOWED_MIME_TYPES[mimeType] ?? 'bin';
}

export function storeUpload(input: {
  studentId: string;
  fileName: string;
  mimeType: string;
  bytes: Buffer;
}): StoredFile {
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
  const key = path.join(input.studentId, `${randomUUID()}.${extensionFor(input.mimeType)}`);
  const target = path.resolve(UPLOAD_ROOT, key);
  const directory = path.dirname(target);
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
  writeFileSync(target, input.bytes);
  return {
    storageKey: key,
    fileName: safeName,
    mimeType: input.mimeType,
    fileSize: input.bytes.byteLength,
    checksum: createHash('sha256').update(input.bytes).digest('hex'),
  };
}

export function readUpload(storageKey: string): { bytes: Buffer; mimeType: string } {
  const target = path.resolve(UPLOAD_ROOT, storageKey);
  if (!target.startsWith(UPLOAD_ROOT)) {
    throw new Error('Invalid storage key.');
  }
  if (!existsSync(target)) {
    throw new Error('File not found.');
  }
  const extension = path.extname(target).slice(1);
  const mimeType = Object.entries(ALLOWED_MIME_TYPES).find(([, ext]) => ext === extension)?.[0] ?? 'application/octet-stream';
  return { bytes: readFileSync(target), mimeType };
}

export function deleteUpload(storageKey: string): void {
  const target = path.resolve(UPLOAD_ROOT, storageKey);
  if (!target.startsWith(UPLOAD_ROOT)) return;
  if (existsSync(target)) unlinkSync(target);
}

export function uploadRoot(): string {
  return UPLOAD_ROOT;
}
