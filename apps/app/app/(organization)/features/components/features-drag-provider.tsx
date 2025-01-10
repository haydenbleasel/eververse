'use client';

import type { GetFeatureResponse } from '@/actions/feature/get';
import { updateFeature } from '@/actions/feature/update';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Group, Product } from '@prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { FeatureItem } from './feature-item';

type FeaturesDragProviderProperties = {
  readonly products: (Pick<Product, 'emoji' | 'id' | 'name'> & {
    readonly groups: Pick<Group, 'emoji' | 'id' | 'name' | 'parentGroupId'>[];
  })[];
  readonly features: GetFeatureResponse[];
  readonly children: ReactNode;
};

export const FeaturesDragProvider = ({
  features,
  products,
  children,
}: FeaturesDragProviderProperties) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const queryClient = new QueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (!active.id) {
      return;
    }

    setActiveId(active.id.toString());
  };

  const handleDragEnd = async ({ over }: DragEndEvent) => {
    if (!over || !activeId) {
      return;
    }

    const product = products.find(({ id }) => id === over.id);

    // Moved to a product
    if (product) {
      try {
        await updateFeature(activeId, { productId: product.id, groupId: null });
        await queryClient.invalidateQueries({
          queryKey: ['features'],
        });

        toast.success(`Successfully moved feature to ${product.name}`);
      } catch (error) {
        handleError(error);
      }
      return;
    }

    const group = products
      .flatMap(({ groups }) => groups)
      .find(({ id }) => id === over.id);

    // Moved to "All"
    if (!group) {
      try {
        await updateFeature(activeId, { productId: null, groupId: null });
        await queryClient.invalidateQueries({
          queryKey: ['features'],
        });

        toast.success('Successfully removed feature from products and groups.');
      } catch (error) {
        handleError(error);
      }

      return;
    }

    // Moved to a group
    const groupProduct = products.find(({ groups }) => groups.includes(group));

    if (!groupProduct) {
      handleError('Product not found');
      return;
    }

    try {
      await updateFeature(activeId, {
        productId: groupProduct.id,
        groupId: group.id,
      });
      await queryClient.invalidateQueries({
        queryKey: ['features'],
      });

      toast.success(
        `Successfully moved feature to ${group.name} under ${groupProduct.name}`
      );
    } catch (error) {
      handleError(error);
    }

    setActiveId(null);
  };

  const activeFeature = features.find((feature) => feature.id === activeId);

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      {children}
      <DragOverlay>
        {activeFeature ? (
          <div className="max-w-sm overflow-hidden rounded opacity-70">
            <FeatureItem feature={activeFeature} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
