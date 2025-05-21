'use client';

import type {
  Feature,
  FeatureStatus,
  Feedback,
  Group,
  Product,
} from '@repo/backend/prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import { Separator } from '@repo/design-system/components/ui/separator';
import { handleError } from '@repo/design-system/lib/handle-error';
import { EditorBubble, useEditor } from 'novel';
import { useEffect, useState } from 'react';
import { updateFeatureFeedbackConnections } from '../../actions/update-feature-feedback-connections';
import { TriageAISelector } from './triage-ai-selector';
import { TriageFeatureSelector } from './triage-feature-selector';
import { TriageSelectedFeatures } from './triage-selected-features';

type TriageMenuProperties = {
  readonly feedbackId: Feedback['id'];
  readonly features: (Pick<Feature, 'id' | 'title'> & {
    readonly status: Pick<FeatureStatus, 'color'>;
    readonly product: Pick<Product, 'name'> | null;
    readonly group: Pick<Group, 'name'> | null;
  })[];
  readonly aiEnabled: boolean;
};

const dataAttribute = 'feedback-feature';

export const TriageMenu = ({
  feedbackId,
  features,
  aiEnabled,
}: TriageMenuProperties) => {
  const { editor } = useEditor();
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const attributes = editor.getAttributes(dataAttribute) as {
      'data-feature': string | null;
    };

    const featureValue = attributes['data-feature'];

    if (featureValue) {
      const existingFeatures = featureValue.split(',');
      setValue(existingFeatures);
    } else {
      setValue([]);
    }
  }, [editor, editor?.state.selection]);

  if (!editor) {
    return null;
  }

  const handleRemoveMark = () => {
    editor.chain().focus().unsetMark(dataAttribute).run();
    updateFeatureFeedbackConnections(feedbackId, []).catch(handleError);
  };

  const handleSelect = (feature: string) => {
    // Check if there is a selection
    const { from, to } = editor.state.selection;

    if (from === to) {
      return;
    }

    const newFeatures = value.includes(feature)
      ? value.filter((featureId) => featureId !== feature)
      : [...value, feature];

    if (newFeatures.length === 0) {
      editor.chain().focus().unsetMark(dataAttribute).run();
      return;
    }

    // Add the feedback-feature mark if it doesn't exist
    if (!editor.isActive(dataAttribute)) {
      editor.chain().focus().setMark(dataAttribute).run();
    }

    // Adding any new features to the selected text
    editor
      .chain()
      .setMark(dataAttribute, {
        'data-feature': newFeatures.join(','),
      })
      .run();

    updateFeatureFeedbackConnections(feedbackId, newFeatures).catch(
      handleError
    );
  };

  return (
    <EditorBubble
      tippyOptions={{
        placement: 'bottom-start',
        appendTo: () => document.body,
      }}
      className="w-fit max-w-[90vw] overflow-hidden rounded border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
    >
      {value.length > 0 ? (
        <>
          <TriageSelectedFeatures
            onSelect={handleSelect}
            value={value}
            features={features}
          />
          <Separator />
        </>
      ) : null}
      {aiEnabled ? (
        <>
          <TriageAISelector
            onSelect={handleSelect}
            value={value}
            features={features.filter((feature) => !value.includes(feature.id))}
          />
          <Separator />
        </>
      ) : null}
      <TriageFeatureSelector
        onSelect={handleSelect}
        features={features.filter((feature) => !value.includes(feature.id))}
      />
      {value.length > 0 ? (
        <>
          <Separator />
          <div className="p-3">
            <Button
              onClick={handleRemoveMark}
              className="w-full text-left"
              variant="destructive"
              size="sm"
            >
              Disconnect features
            </Button>
          </div>
        </>
      ) : null}
    </EditorBubble>
  );
};
