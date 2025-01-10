'use client';

import { createExampleContent } from '@/actions/example-content/create';
import { deleteExampleContent } from '@/actions/example-content/delete';
import { skipExampleContent } from '@/actions/example-content/skip';
import type { Organization } from '@prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { ChevronsRightIcon, ImportIcon, ZapIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type OnboardingButtonProperties = {
  readonly onClick: () => void;
  readonly icon: typeof ZapIcon;
  readonly title: string;
  readonly description: string;
  readonly disabled?: boolean;
};

const OnboardingButton = ({
  onClick,
  icon: Icon,
  title,
  description,
  disabled,
}: OnboardingButtonProperties) => (
  <Button
    className="h-auto whitespace-pre-wrap p-4 text-left"
    variant="secondary"
    onClick={onClick}
    disabled={disabled}
  >
    <span className="flex w-full items-start gap-2">
      <Icon size={16} className="shrink-0 text-muted-foreground" />
      <span className="flex flex-col gap-1">
        <span className="block">{title}</span>
        <span className="block font-normal text-muted-foreground">
          {description}
        </span>
      </span>
    </span>
  </Button>
);

type OnboardingOptionsProperties = {
  readonly type: Organization['onboardingType'];
};

export const OnboardingOptions = ({ type }: OnboardingOptionsProperties) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSkip = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await skipExampleContent();

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExampleContent = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await createExampleContent();

      if (error) {
        throw new Error(error);
      }

      toast.success(
        'Example content created successfully! Go ahead and explore.'
      );
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExampleContent = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await deleteExampleContent();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  let buttons = [
    {
      icon: ZapIcon,
      title: 'Create example content',
      description:
        'This will create a handful of fake feedback, features, changelogs and more for you to explore. You can delete them by coming back to this page.',
      onClick: handleCreateExampleContent,
    },
    {
      icon: ChevronsRightIcon,
      title: 'Create my own content',
      description:
        'I want to start from a blank slate, without any example content.',
      onClick: handleSkip,
    },
    {
      icon: ImportIcon,
      title: 'Import from Productboard or Canny',
      description:
        "I'm currently a Productboard or Canny user and I want to import my data to Eververse.",
      onClick: () => router.push('/settings/import'),
    },
  ];

  if (type === 'EXAMPLE') {
    buttons = [
      {
        icon: ZapIcon,
        title: 'Remove example content',
        description:
          "Hopefully our example content helped you get started. You can remove it when you're ready.",
        onClick: handleDeleteExampleContent,
      },
    ];
  }

  return (
    <div className="flex flex-col gap-4">
      {buttons.map(({ icon, title, description, onClick }) => (
        <OnboardingButton
          key={title}
          icon={icon}
          title={title}
          description={description}
          onClick={onClick}
          disabled={loading}
        />
      ))}
    </div>
  );
};
