import { ExternalLink, ShieldQuestion } from 'lucide-react';

import { requireAdmin } from '@/lib/auth/guards';
import { listAllRules, listAllRequiredDocuments, listSchemes } from '@/lib/db/schemes';
import { Card, CardContent, CardHeader, CardTitle, Divider, SectionHeading } from '@/components/ui/card';
import { Alert } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { SOURCE_VERIFICATION_NOTICE, INDICATIVE_BADGE, VERIFIED_BADGE } from '@/lib/domain/copy';
import { DOCUMENT_TYPE_LABEL } from '@/lib/domain/workflow';
import { formatDate } from '@/lib/utils';
import type { EligibilityRuleType, RequirementSource } from '@/types';

const RULE_TYPE_LABEL: Record<EligibilityRuleType, string> = {
  CATEGORY: 'Social category',
  ST_STATUS: 'Scheduled Tribe status',
  PVTG_STATUS: 'PVTG status',
  EDUCATION_LEVEL: 'Education level',
  FAMILY_INCOME: 'Annual family income',
  STATE: 'Domicile state',
  INSTITUTION: 'Institution',
  COURSE: 'Course',
  ACADEMIC_SCORE: 'Academic score',
};

const REQUIREMENT_SOURCE_LABEL: Record<RequirementSource, string> = {
  VERIFIED: VERIFIED_BADGE,
  INDICATIVE: INDICATIVE_BADGE,
};

export const metadata = { title: 'Scheme data' };

export default async function AdminSchemesPage() {
  await requireAdmin();

  const schemes = listSchemes(true);
  const rules = listAllRules();
  const documents = listAllRequiredDocuments();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Transparency"
        title="Recorded scheme data"
        description="Exactly what Aletheia knows about each scheme, and where it came from. Read-only during the prototype."
      />

      <Alert tone="warning" icon={<ShieldQuestion className="h-4 w-4" aria-hidden />}>
        {SOURCE_VERIFICATION_NOTICE} Aletheia never invents or updates government rules — a person must transcribe an
        official update into the source files.
      </Alert>

      <div className="space-y-5">
        {schemes.map((scheme) => {
          const schemeRules = rules.filter((rule) => rule.schemeId === scheme.id);
          const schemeDocuments = documents.filter((document) => document.schemeId === scheme.id);

          return (
            <Card key={scheme.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>{scheme.name}</CardTitle>
                      {!scheme.isActive ? <Badge tone="neutral">Inactive</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {scheme.sourceTitle} · version {scheme.schemeVersion} · recorded {formatDate(scheme.lastVerifiedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="maroon">
                      {scheme.schemeClass === 'CENTRALLY_SPONSORED' ? 'Centrally sponsored' : 'Central sector'}
                    </Badge>
                    <Badge tone="outline">{scheme.type}</Badge>
                    <a
                      href={scheme.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-xs font-medium text-maroon hover:underline underline-offset-4"
                    >
                      Source
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Eligibility rules</p>
                    <ul className="mt-2 space-y-2">
                      {schemeRules.map((rule) => (
                        <li key={rule.id} className="text-sm">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-ink">{RULE_TYPE_LABEL[rule.ruleType] ?? rule.ruleType}</span>
                            {!rule.required ? <span className="text-xs text-muted">(supporting)</span> : null}
                          </span>
                          <span className="block text-xs text-muted">{rule.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Required documents (indicative)
                    </p>
                    <ul className="mt-2 space-y-2">
                      {schemeDocuments.map((document) => (
                        <li key={document.id} className="text-sm">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-ink">
                              {document.documentName || DOCUMENT_TYPE_LABEL[document.documentType]}
                            </span>
                            <Badge tone={document.required ? 'neutral' : 'outline'}>
                              {document.required ? 'Required' : 'Supporting'}
                            </Badge>
                          </span>
                          <span className="block text-xs text-muted">{document.description}</span>
                          <span className="block text-[0.6875rem] text-muted/80">
                            {REQUIREMENT_SOURCE_LABEL[document.requirementSource] ?? document.requirementSource}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Divider />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Recorded benefits</p>
                  <ul className="mt-2 space-y-1.5">
                    {scheme.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-2 text-sm text-ink/90">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" aria-hidden />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {scheme.benefitsVerificationNote ? (
                    <p className="mt-2 text-xs text-muted">{scheme.benefitsVerificationNote}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
