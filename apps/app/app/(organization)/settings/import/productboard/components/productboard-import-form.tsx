'use client';

import { productboardImport } from '@/actions/productboard-import/create';
import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEventHandler } from 'react';

export const ProductboardImportForm = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const disabled = !token.trim() || loading;
  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await productboardImport(token);

      if ('error' in response) {
        throw new Error(response.error);
      }

      setToken('');
      toast.success(
        "We're importing your Productboard data. This may take up to 30 minutes depending on the size of your data."
      );

      router.push(`/settings/import/productboard/${response.id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <Input
        value={token}
        onChangeText={setToken}
        placeholder="Your Productboard API token"
        className="w-full"
        autoComplete="off"
      />
      <Button type="submit" disabled={disabled}>
        {loading ? <LoadingCircle /> : 'Import'}
      </Button>
    </form>
  );
};
