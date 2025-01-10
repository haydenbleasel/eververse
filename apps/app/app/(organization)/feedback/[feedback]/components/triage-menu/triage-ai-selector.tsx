import type { Feature, FeatureStatus } from '@prisma/client';
import { useDebouncedEffect } from '@react-hookz/web';
import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { handleError } from '@repo/design-system/lib/handle-error';
import { SparklesIcon } from 'lucide-react';
import { useEditor } from 'novel';
import { useState } from 'react';
import { getFeatureRecommendations } from '../../actions/get-feature-recommendations';

type TriageAiSelectorProperties = {
  readonly features: (Pick<Feature, 'id' | 'title'> & {
    readonly status: Pick<FeatureStatus, 'color'>;
  })[];
  readonly onSelect: (id: string) => void;
  readonly value: string[];
};

export const TriageAISelector = ({
  features,
  onSelect,
  value,
}: TriageAiSelectorProperties) => {
  const { editor } = useEditor();
  const [recommended, setRecommended] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const recommendedFeatures = features.filter(({ id }) =>
    recommended.includes(id)
  );
  const [previousText, setPreviousText] = useState<string>('');

  useDebouncedEffect(
    async () => {
      if (loading || !editor) {
        return;
      }

      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ' '
      );

      if (selectedText === previousText) {
        return;
      }

      setPreviousText(selectedText);
      setLoading(true);

      try {
        const response = await getFeatureRecommendations(selectedText);

        if ('error' in response) {
          throw new Error(response.error);
        }

        setRecommended(response.data);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    [value],
    500
  );

  return (
    <div className="space-y-1.5 p-3">
      <Label
        htmlFor="triage-menu"
        className="flex items-center gap-2 text-violet-500 dark:text-violet-400"
      >
        <SparklesIcon size={16} /> Suggested features
      </Label>
      {loading ? (
        <LoadingCircle />
      ) : (
        <div>
          {recommendedFeatures.map((feature) => (
            <Button
              key={feature.id}
              variant="ghost"
              className="flex h-auto w-full items-center gap-2 px-2 py-1.5 text-left font-normal text-sm"
              onClick={() => onSelect(feature.id)}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: feature.status.color }}
              />
              <span className="flex-1 truncate">{feature.title}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
