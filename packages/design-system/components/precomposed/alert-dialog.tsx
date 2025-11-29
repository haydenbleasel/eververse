"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";

// biome-ignore lint/performance/noNamespaceImport: we're using the primitive component
import * as AlertDialogComponent from "../ui/alert-dialog";
import { Button } from "../ui/button";

export type AlertDialogProperties = ComponentProps<
  typeof AlertDialogComponent.AlertDialog
> & {
  readonly title: string;
  readonly description: string;
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly cta?: string;
  readonly trigger?: ReactNode;
};

export const AlertDialog = ({
  title,
  description,
  onClick,
  disabled,
  trigger,
  cta = "Delete",
  children,
  ...properties
}: AlertDialogProperties) => (
  <AlertDialogComponent.AlertDialog {...properties}>
    {trigger ? (
      <AlertDialogComponent.AlertDialogTrigger asChild>
        <div className="shrink-0">{trigger}</div>
      </AlertDialogComponent.AlertDialogTrigger>
    ) : null}
    <AlertDialogComponent.AlertDialogContent>
      <AlertDialogComponent.AlertDialogHeader>
        <AlertDialogComponent.AlertDialogTitle>
          {title}
        </AlertDialogComponent.AlertDialogTitle>
        <AlertDialogComponent.AlertDialogDescription>
          {description}
        </AlertDialogComponent.AlertDialogDescription>
      </AlertDialogComponent.AlertDialogHeader>
      {children}
      <AlertDialogComponent.AlertDialogFooter>
        <AlertDialogComponent.AlertDialogCancel>
          Cancel
        </AlertDialogComponent.AlertDialogCancel>
        <AlertDialogPrimitive.Action asChild>
          <Button disabled={disabled} onClick={onClick} variant="destructive">
            {cta}
          </Button>
        </AlertDialogPrimitive.Action>
      </AlertDialogComponent.AlertDialogFooter>
    </AlertDialogComponent.AlertDialogContent>
  </AlertDialogComponent.AlertDialog>
);
