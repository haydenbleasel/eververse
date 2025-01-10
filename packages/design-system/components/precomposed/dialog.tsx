'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Button } from '../ui/button';
import * as DialogComponent from '../ui/dialog';

export type DialogProperties = ComponentProps<typeof DialogComponent.Dialog> & {
  readonly title?: ReactNode;
  readonly description?: ReactNode;
  readonly trigger?: ReactNode;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly footer?: ReactNode;
  readonly cta?: string;
  readonly className?: string;
};

export const Dialog = ({
  title,
  description,
  trigger,
  onClick,
  disabled,
  cta,
  footer,
  children,
  className,
  ...properties
}: DialogProperties) => (
  <DialogComponent.Dialog {...properties}>
    {trigger ? (
      <DialogComponent.DialogTrigger asChild>
        <div className="shrink-0">{trigger}</div>
      </DialogComponent.DialogTrigger>
    ) : null}
    <DialogComponent.DialogContent className={className}>
      {(title ?? description) ? (
        <DialogComponent.DialogHeader>
          {title ? (
            <DialogComponent.DialogTitle>{title}</DialogComponent.DialogTitle>
          ) : null}
          {description ? (
            <DialogComponent.DialogDescription>
              {description}
            </DialogComponent.DialogDescription>
          ) : null}
        </DialogComponent.DialogHeader>
      ) : null}
      {children}
      {(footer ?? (cta && onClick)) ? (
        <DialogComponent.DialogFooter className="flex items-center justify-between gap-3 sm:justify-between">
          {footer ? <div>{footer}</div> : null}
          {cta && onClick ? (
            <Button onClick={onClick} disabled={disabled}>
              {cta}
            </Button>
          ) : null}
        </DialogComponent.DialogFooter>
      ) : null}
    </DialogComponent.DialogContent>
  </DialogComponent.Dialog>
);
