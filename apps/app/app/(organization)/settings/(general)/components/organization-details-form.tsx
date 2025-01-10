'use client';

import { updateOrganization } from '@/actions/organization/update';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useState } from 'react';
import type { FormEventHandler } from 'react';

type OrganizationDetailsFormProperties = {
  readonly defaultName: string;
  readonly defaultSlug: string;
};

export const OrganizationDetailsForm = ({
  defaultName,
  defaultSlug,
}: OrganizationDetailsFormProperties) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(defaultSlug);
  const disabled = loading || !name.trim() || !slug.trim();

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateOrganization({
        name,
        // slug,
      });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <Input
        label="Name"
        value={name}
        onChangeText={setName}
        className="bg-background"
        placeholder="Eververse"
      />
      <Input
        label="Slug"
        value={slug}
        onChangeText={setSlug}
        placeholder="eververse"
        className="bg-background"
        disabled
      />
      <Button type="submit" disabled={disabled}>
        Save
      </Button>
    </form>
  );
};
