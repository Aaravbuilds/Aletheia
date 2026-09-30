import { requireStudent } from '@/lib/auth/guards';
import { calculateProfileCompletion, getProfileById } from '@/lib/db/profiles';
import { ProfileForm } from '@/components/profile/profile-form';
import { SectionHeading } from '@/components/ui/card';

export const metadata = { title: 'My profile' };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await requireStudent();
  const { welcome } = await searchParams;
  const profile = getProfileById(user.studentId);

  if (!profile) {
    return <p className="text-sm text-muted">Your profile could not be loaded. Please sign in again.</p>;
  }

  const completion = calculateProfileCompletion(profile);

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Profile"
        title="Your details"
        description="These details are used only to check the eligibility conditions recorded for each scheme. Aletheia never decides eligibility on its own and never shares them with any external service."
      />

      <ProfileForm profile={profile} completion={completion} welcome={welcome === '1'} />
    </div>
  );
}
