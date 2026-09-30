import { NextResponse } from 'next/server';

import { getSessionUser } from '@/lib/auth/session';
import { getDocumentFile, getDocumentById } from '@/lib/db/documents';
import { listAllApplications, listApplicationDocuments } from '@/lib/db/applications';
import { readUpload } from '@/lib/storage/uploads';

/**
 * Authenticated file streaming (docs/05 §10, §34).
 *
 * Files live outside /public and are only served after a server-side
 * ownership check. A student may read their own documents; an administrator
 * may read a document only when it is attached to an application in review.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  const document = getDocumentById(id);
  if (!document) return new NextResponse('Not found', { status: 404 });

  if (user.role === 'STUDENT') {
    if (!user.studentId || document.studentId !== user.studentId) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  } else {
    const attached = listAllApplications().some((application) =>
      listApplicationDocuments(application.id).some((record) => record.documentId === id),
    );
    if (!attached) return new NextResponse('Forbidden', { status: 403 });
  }

  const file = getDocumentFile(id);

  if (file) {
    try {
      const { bytes, mimeType } = readUpload(file.storageKey);
      return new NextResponse(new Uint8Array(bytes), {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `inline; filename="${file.fileName.replace(/"/g, '')}"`,
          'Cache-Control': 'private, no-store',
        },
      });
    } catch {
      return new NextResponse('Stored file is unavailable.', { status: 404 });
    }
  }

  // Seeded demonstration documents have no binary. Return a readable notice
  // instead of pretending a file exists.
  if (document.source === 'DIGILOCKER' || document.source === 'IMPORTED' || document.source === 'UPLOAD') {
    return new NextResponse(renderPlaceholder(document.documentName, document.fileName), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
    });
  }

  return new NextResponse('No file is attached to this document.', { status: 404 });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (character) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character] ?? character,
  );
}

function renderPlaceholder(name: string, fileName: string | null): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(
    name,
  )}</title></head><body style="margin:0;font-family:ui-sans-serif,system-ui,sans-serif;background:#faf7f2;color:#2b2320;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:2rem"><main style="max-width:32rem;background:#fff;border:1px solid #e7ded1;border-radius:12px;padding:2rem"><p style="margin:0 0 .5rem;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:#8a7f74">Aletheia demonstration record</p><h1 style="margin:0 0 .75rem;font-size:1.35rem">${escapeHtml(
    name,
  )}</h1><p style="margin:0;color:#6b6157;line-height:1.6">This is a synthetic document used for the prototype demonstration. No real certificate or personal data is stored for seeded records${
    fileName ? ` (expected file: ${escapeHtml(fileName)})` : ''
  }.</p></main></body></html>`;
}
