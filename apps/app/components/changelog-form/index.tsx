'use client';

import { createChangelog } from '@/actions/changelog/create';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { handleError } from '@repo/design-system/lib/handle-error';
import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { KeyboardEventHandler } from 'react';
import { useChangelogForm } from './use-changelog-form';

export const ChangelogForm = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const disabled = !name.trim() || loading;
  const { isOpen, toggle, hide } = useChangelogForm();
  const queryClient = new QueryClient();

  const handleCreate = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { id, error } = await createChangelog(name);

      if (error) {
        throw new Error(error);
      }

      if (!id) {
        throw new Error('Something went wrong');
      }

      setName('');

      hide();

      await queryClient.invalidateQueries({ queryKey: ['changelog'] });

      router.push(`/changelog/${id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={toggle}
      title={
        <p className="font-medium text-muted-foreground text-sm tracking-tight">
          Create a product update
        </p>
      }
      cta="Create product update"
      onClick={handleCreate}
      disabled={disabled}
      className="max-w-2xl"
      modal={false}
    >
      <Input
        placeholder="Product update 1.1"
        value={name}
        onChangeText={setName}
        className="border-none p-0 font-medium text-lg shadow-none focus-visible:ring-0"
        maxLength={191}
        autoComplete="off"
        onKeyDown={handleKeyDown}
      />
    </Dialog>
  );
};
