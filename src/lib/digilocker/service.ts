import { DOCUMENT_TYPE_LABEL } from '@/lib/domain/workflow';
import type { DigiLockerDocument, DocumentType } from '@/types';

/**
 * DIGILOCKER BOUNDARY
 *
 * This is a DEMO ONLY integration. No request is made to DigiLocker or any
 * government service, no OAuth consent is simulated, and nothing here should
 * ever be presented as a live government connection
 * (opencode-master-prompt §12).
 */

export interface DigiLockerService {
  readonly isDemo: boolean;
  readonly label: string;
  listDocuments(): Promise<DigiLockerDocument[]>;
  fetchDocument(externalId: string): Promise<DigiLockerDocument | null>;
}

const DEMO_DOCUMENTS: DigiLockerDocument[] = [
  {
    externalId: 'dl-demo-st-001',
    documentType: 'ST_CERTIFICATE',
    documentName: 'Scheduled Tribe Certificate (Demo record)',
    issuer: 'District Collector, Dahod (demo data)',
    issuedOn: '2019-08-14',
    sizeLabel: '182 KB',
  },
  {
    externalId: 'dl-demo-marks-002',
    documentType: 'MARKSHEET',
    documentName: 'Class XII Marksheet (demo record)',
    issuer: 'Gujarat Secondary and Higher Secondary Education Board (demo data)',
    issuedOn: '2022-04-20',
    sizeLabel: '240 KB',
  },
  {
    externalId: 'dl-demo-bank-003',
    documentType: 'BANK_PROOF',
    documentName: 'Bank account proof (demo record)',
    issuer: 'Demo bank branch, Anand',
    issuedOn: '2026-01-08',
    sizeLabel: '96 KB',
  },
];

export class MockDigiLockerService implements DigiLockerService {
  readonly isDemo = true;
  readonly label = 'Demo DigiLocker Connection';

  async listDocuments(): Promise<DigiLockerDocument[]> {
    return DEMO_DOCUMENTS.map((item) => ({ ...item }));
  }

  async fetchDocument(externalId: string): Promise<DigiLockerDocument | null> {
    const found = DEMO_DOCUMENTS.find((item) => item.externalId === externalId);
    return found ? { ...found } : null;
  }
}

export function describeDemoDocument(document: DigiLockerDocument): string {
  return `${DOCUMENT_TYPE_LABEL[document.documentType]} — issued by ${document.issuer} on ${document.issuedOn}`;
}

export const digiLockerService: DigiLockerService = new MockDigiLockerService();
