import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { StackCard } from '@repo/design-system/components/stack-card';
import { createMetadata } from '@repo/seo/metadata';
import { BookIcon, BuildingIcon, TrashIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DeleteOrganizationForm } from './components/delete-organization-form';
import { OrganizationDetailsForm } from './components/organization-details-form';
import { OrganizationLogoForm } from './components/organization-logo-form';
import { ProductDescriptionForm } from './components/product-description-form';

export const metadata: Metadata = createMetadata({
  title: 'General Settings',
  description: 'General settings for your organization.',
});

const GeneralSettings = async () => {
  const [organizationId, user] = await Promise.all([
    currentOrganizationId(),
    currentUser(),
  ]);

  if (!organizationId || !user) {
    notFound();
  }

  const organization = await database.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      name: true,
      slug: true,
      productDescription: true,
      logoUrl: true,
    },
  });

  if (!organization) {
    notFound();
  }

  return (
    <div className="px-6 py-16">
      <div className="mx-auto grid w-full max-w-3xl gap-6">
        <div className="grid gap-2">
          <h1 className="m-0 font-semibold text-4xl tracking-tight">
            Settings
          </h1>
          <p className="mt-2 mb-0 text-muted-foreground">
            Manage your organization&apos;s settings.
          </p>
        </div>
        <StackCard
          title="Organization Details"
          icon={BuildingIcon}
          className="flex items-start gap-8"
        >
          <OrganizationDetailsForm
            defaultName={organization.name}
            defaultSlug={organization.slug}
          />
          <div>
            <OrganizationLogoForm
              organizationId={organizationId}
              logoUrl={organization.logoUrl}
            />
            {organization.logoUrl && (
              <p className="mt-1 text-center text-muted-foreground text-xs">
                Click or drag-and-drop to change
              </p>
            )}
          </div>
        </StackCard>
        <StackCard
          title="Product Description"
          icon={BookIcon}
          className="grid gap-2"
        >
          <p className="text-muted-foreground text-sm">
            By telling us about your product and its users, our AI can help you
            triage and prioritize your feedback.
          </p>
          <ProductDescriptionForm
            defaultValue={organization.productDescription ?? ''}
          />
        </StackCard>
        <StackCard
          title="Danger Zone"
          icon={TrashIcon}
          className="grid gap-2"
        >
          <DeleteOrganizationForm 
            organizationName={organization.name} 
            userRole={user.user_metadata.organization_role}
          />
        </StackCard>
      </div>
    </div>
  );
};

export default GeneralSettings;
