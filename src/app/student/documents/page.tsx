import { requireStudent } from '@/lib/auth/guards';
import { listDocumentsWithFindings } from '@/lib/db/documents';
import { digiLockerService } from '@/lib/digilocker/service';
import { getStudentMatches } from '@/lib/matching/service';
import { activeAiProvider, aiProviderLabel } from '@/lib/ai';
import { DocumentWallet, DigiLockerImportForm, UploadDocumentForm } from '@/components/documents/document-wallet';
import { Card, CardContent, CardHeader, CardTitle, SectionHeading } from '@/components/ui/card';
import { Alert } from '@/components/ui/feedback';
import { AI_BOUNDARY_NOTICE } from '@/lib/domain/copy';

export const metadata = { title: 'My documents' };

export default async function DocumentsPage() {
  const user = await requireStudent();
  const documents = listDocumentsWithFindings(user.studentId);
  const demoRecords = await digiLockerService.listDocuments();
  const matches = getStudentMatches(user.studentId);
  const provider = activeAiProvider();

  const usable = documents.filter((document) =>
    ['VERIFIED', 'UPLOADED', 'PROCESSING'].includes(document.status),
  );
  const attention = documents.filter((document) =>
    ['NEEDS_ATTENTION', 'INVALID', 'EXPIRED'].includes(document.status),
  );

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Document wallet"
        title="Your documents, stored once and reused"
        description="Upload a document once and attach the same record to any application that needs it. Replacing a document archives the old copy."
        action={<ProviderStatus provider={provider} label={aiProviderLabel()} />}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile label="Ready to use" value={usable.length} hint="Can be attached to an application" />
        <SummaryTile label="Need attention" value={attention.length} hint="Read this before you apply" />
        <SummaryTile
          label="Reusable across"
          value={matches.filter((match) => match.status !== 'NOT_MATCHING').length}
          hint="Schemes your documents can serve"
        />
      </div>

      {attention.length > 0 ? (
        <Alert tone="warning" title={`${attention.length} document(s) need attention`}>
          Aletheia flagged these automatically. A reviewing officer makes the final call — but you can expect a
          correction request if the issue is real.
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentWallet documents={documents} />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add a document</CardTitle>
            <p className="text-sm text-muted">
              Aletheia classifies the file, reads what it can and records observations for a reviewer.
            </p>
          </CardHeader>
          <CardContent>
            <UploadDocumentForm />
            <p className="mt-4 text-xs leading-relaxed text-muted">{AI_BOUNDARY_NOTICE}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo DigiLocker Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <DigiLockerImportForm records={demoRecords} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1.5 font-display text-2xl text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
    </div>
  );
}

function ProviderStatus({ provider, label }: { provider: 'GROQ' | 'MOCK'; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted"
      title={
        provider === 'GROQ'
          ? 'Document reading is happening through the Groq API.'
          : 'No AI key is configured, so the offline demonstration provider is used. The workflow is unaffected.'
      }
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${provider === 'GROQ' ? 'bg-status-success' : 'bg-slate'}`}
        aria-hidden
      />
      AI provider: {label}
    </span>
  );
}
