import { FeedbackItem } from '@/app/(organization)/feedback/components/feedback-item';
import type { Feedback } from '@repo/backend/prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';
import { NodeViewWrapper } from '@repo/editor';
import { useEffect, useState } from 'react';
import { fetchLink } from './fetch-link';
import type { FetchLinkResponse } from './fetch-link';

type FeedbackLinkComponentProperties = {
  readonly id: Feedback['id'];
};

export const FeedbackLinkComponent = ({
  id,
}: FeedbackLinkComponentProperties) => {
  const [data, setData] = useState<FetchLinkResponse | null>(null);

  useEffect(() => {
    if (data) {
      return;
    }

    const loadData = async () => {
      const response = await fetchLink(id);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No data');
      }

      return response.data;
    };

    loadData().then(setData).catch(handleError);
  }, [data, id]);

  if (!data) {
    return null;
  }

  return (
    <NodeViewWrapper className="not-prose w-full overflow-hidden rounded-lg border bg-card text-foreground text-sm">
      <FeedbackItem feedback={data} />
    </NodeViewWrapper>
  );
};
