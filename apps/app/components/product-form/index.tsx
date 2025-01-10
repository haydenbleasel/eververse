'use client';

import { createProduct } from '@/actions/product/create';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProductForm } from './use-product-form';

export const ProductForm = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const disabled = !name.trim() || loading;
  const { isOpen, toggle, hide } = useProductForm();

  const handleCreate = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { id, error } = await createProduct(name);

      if (error) {
        throw new Error(error);
      }

      if (!id) {
        throw new Error('Something went wrong');
      }

      setName('');

      hide();
      router.push(`/features/products/${id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={toggle}
      modal={false}
      title={
        <p className="font-medium text-muted-foreground text-sm tracking-tight">
          Create a product
        </p>
      }
      className="max-w-2xl"
      cta="Create product"
      onClick={handleCreate}
      disabled={disabled}
    >
      <Input
        placeholder="Admin Dashboard"
        value={name}
        onChangeText={setName}
        className="border-none p-0 font-medium text-lg shadow-none focus-visible:ring-0"
        maxLength={191}
        autoComplete="off"
      />
    </Dialog>
  );
};
