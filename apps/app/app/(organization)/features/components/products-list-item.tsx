import { useFeatureForm } from '@/components/feature-form/use-feature-form';
import { useDroppable } from '@dnd-kit/core';
import { EververseRole } from '@repo/backend/auth';
import { Emoji } from '@repo/design-system/components/emoji';
import { EmojiSelector } from '@repo/design-system/components/emoji-selector';
import { Link } from '@repo/design-system/components/link';
import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { DropdownMenu } from '@repo/design-system/components/precomposed/dropdown-menu';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import { ChevronDown, MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

type ProductsListItemProperties = {
  readonly id: string;
  readonly active?: boolean;
  readonly emoji: string;
  readonly name: string;
  readonly href: string;
  readonly hasChildren?: boolean;
  readonly onEmojiSelect?: (emoji: string) => Promise<void>;
  readonly onRename?: (name: string) => Promise<void>;
  readonly onDelete?: () => Promise<void>;
  readonly createProps?: {
    readonly productId?: string;
    readonly groupId?: string;
  };
  readonly children?: ReactNode;
  readonly className?: string;
  readonly role?: string;
};

export const ProductsListItem = ({
  id,
  active,
  emoji,
  name,
  href,
  onEmojiSelect,
  onRename,
  onDelete,
  createProps,
  children,
  className,
  hasChildren,
  role,
}: ProductsListItemProperties) => {
  const featureForm = useFeatureForm();
  const [newName, setNewName] = useState(name);
  const [emojiLoading, setEmojiLoading] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isOver, setNodeRef } = useDroppable({ id });
  const [childrenOpen, setChildrenOpen] = useState(false);

  const handleEmojiSelect = async (newEmoji: string) => {
    if (emojiLoading || loading) {
      return;
    }

    setEmojiLoading(true);
    setLoading(true);

    try {
      await onEmojiSelect?.(newEmoji);
    } catch (error) {
      handleError(error);
    } finally {
      setEmojiLoading(false);
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (loading) {
      return;
    }

    setShowRenameDialog(false);

    try {
      await onRename?.(newName);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading) {
      return;
    }

    setShowDeleteDialog(false);

    try {
      await onDelete?.();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeature = () => {
    setTimeout(() => {
      featureForm.show(createProps);
    }, 250);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        className={cn(
          'group flex items-center gap-2 transition-colors',
          className,
          (active ?? isOver) &&
            'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
        )}
      >
        <div className="p-3 pr-0">
          {emojiLoading ? (
            <LoadingCircle />
          ) : (
            <div>
              {role === EververseRole.Member ? (
                <div className="flex h-4 w-4 items-center justify-center">
                  <p className="text-sm">
                    <Emoji id={emoji} size="0.825rem" />
                  </p>
                </div>
              ) : (
                <EmojiSelector
                  value={emoji}
                  onChange={handleEmojiSelect}
                  onError={handleError}
                />
              )}
            </div>
          )}
        </div>
        <Link
          className="flex-1 truncate py-3 text-sm transition-colors"
          href={href}
        >
          {name}
        </Link>
        <div className="-my-2 flex shrink-0 gap-px pr-1">
          {onRename && onDelete && role !== EververseRole.Member ? (
            <DropdownMenu
              data={[
                { onClick: handleCreateFeature, children: 'Create Feature' },
                {
                  onClick: () => setShowRenameDialog(true),
                  children: 'Rename',
                },
                {
                  onClick: () => setShowDeleteDialog(true),
                  children: 'Delete',
                },
              ]}
            >
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon
                  size={16}
                  className={cn(
                    active
                      ? 'text-violet-700 dark:text-violet-300'
                      : 'text-muted-foreground'
                  )}
                />
              </Button>
            </DropdownMenu>
          ) : null}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChildrenOpen(!childrenOpen)}
            >
              <ChevronDown
                size={16}
                className={cn(
                  'transition-transform',
                  active
                    ? 'text-violet-700 dark:text-violet-300'
                    : 'text-muted-foreground',
                  childrenOpen && 'rotate-180'
                )}
              />
            </Button>
          ) : null}
        </div>
      </div>
      {childrenOpen ? <div>{children}</div> : null}
      <Dialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        title={`Rename ${name}`}
        description={`Enter a new name for ${name} below.`}
        onClick={handleRename}
        disabled={loading}
        cta="Save"
      >
        <Input
          value={newName}
          onChangeText={setNewName}
          maxLength={191}
          autoComplete="off"
        />
      </Dialog>
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Are you absolutely sure?"
        description={`This will permanently delete ${name}. This action cannot be undone.`}
        onClick={handleDelete}
        disabled={loading}
      />
    </>
  );
};
