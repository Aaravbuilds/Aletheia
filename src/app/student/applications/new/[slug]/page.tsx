import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { requireStudent } from '@/lib/auth/guards';
import { getProfileById } from '@/lib/db/profiles';
import { getSchemeBySlugWithRelations } from '@/lib/db/schemes';
import { findOpenApplication } from '@/lib/db/applications';
import { listDocuments } from '@/lib/db/documents';
import { draftFromProfile } from '@/lib/applications/draft';
import { ApplicationWizard } from '@/components/applications/application-wizard';
import { SectionHeading } from '@/components/ui/card';
import { Alert } from '@/components/ui/feedback';
import { DOCUMENT_SOURCE_NOTICE } from '@/lib/domain/copy';

export const metadata = { title: 'New application' };

export default async function NewApplicationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireStudent();

  const profile = getProfileById(user.studentId);
  if (!profile) return <Alert tone="warning">Complete your profile before starting an application.</Alert>;

  const scheme = getSchemeBySlugWithRelations(slug);
  if (!scheme) notFound();

  const existing = findOpenApplication(profile.id, scheme.id);

  if (existing && existing.status !== 'DRAFT') {
    return (
      <Alert tone="info" title="You already have an application for this scheme">
        <Link href={`/student/applications/${existing.id}`} className="font-medium underline underline-offset-4">
          Open {existing.applicationNumber}
        </Link>
      </Alert>
    );
  }

  const draft = existing?.draftData ?? draftFromProfile(profile);

  return (
    <div className="space-y-6">
      <Link
        href={`/student/scholarships/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-maroon"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to {scheme.shortName}
      </Link>

      <SectionHeading
        eyebrow={existing ? `Draft ${existing.applicationNumber || ''}`.trim() : 'Draft application'}
        title={scheme.name}
        description="Five short steps and a final review. Your answers are saved as a draft, and nothing is submitted until you confirm."
      />

      <Alert tone="info">{DOCUMENT_SOURCE_NOTICE}</Alert>

      <ApplicationWizard
        initialApplicationId={existing?.id}
        schemeSlug={slug}
        initialDraft={draft}
        initialStep={existing?.currentStep ?? 1}
        requiredDocuments={scheme.requiredDocuments}
        wallet={listDocuments(profile.id)}
      />
    </div>
  );
}
