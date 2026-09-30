import type {
  DocumentReadiness,
  DocumentReadinessItem,
  RequiredDocument,
  StudentDocument,
} from '@/types';

/**
 * Document readiness is derived, never stored
 * (docs/06-DATA-AI-SPECS.md §33).
 */

function isExpired(document: StudentDocument, now = new Date()): boolean {
  if (document.status === 'EXPIRED') return true;
  if (!document.expiryDate) return false;
  const expiry = new Date(document.expiryDate);
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() < now.getTime();
}

function itemState(document: StudentDocument): DocumentReadinessItem['state'] {
  if (isExpired(document)) return 'EXPIRED';
  if (document.status === 'NEEDS_ATTENTION' || document.status === 'INVALID') return 'NEEDS_ATTENTION';
  if (document.status === 'VERIFIED' || document.status === 'UPLOADED' || document.status === 'PROCESSING') {
    return 'AVAILABLE';
  }
  return 'MISSING';
}

export function calculateReadiness(
  requiredDocuments: RequiredDocument[],
  wallet: StudentDocument[],
): DocumentReadiness {
  const items: DocumentReadinessItem[] = requiredDocuments
    .filter((required) => required.required)
    .map((required) => {
      const document =
        wallet.find((doc) => doc.documentType === required.documentType && itemState(doc) !== 'EXPIRED') ?? null;
      return {
        requiredDocument: required,
        document,
        state: document ? itemState(document) : 'MISSING',
      };
    })
    .sort((a, b) => a.requiredDocument.sortOrder - b.requiredDocument.sortOrder);

  return {
    requiredCount: items.length,
    availableCount: items.filter((i) => i.state === 'AVAILABLE').length,
    missingCount: items.filter((i) => i.state === 'MISSING').length,
    attentionCount: items.filter((i) => i.state === 'NEEDS_ATTENTION' || i.state === 'EXPIRED').length,
    items,
  };
}

export function readinessHeadline(readiness: DocumentReadiness): string {
  return `${readiness.availableCount} / ${readiness.requiredCount} documents available`;
}
