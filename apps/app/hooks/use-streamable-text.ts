import { readStreamableValue } from '@repo/ai/rsc';
import type { StreamableValue } from '@repo/ai/rsc';
import { useEffect, useState } from 'react';

export const useStreamableText = (
  content: StreamableValue<string> | string
): string => {
  const [rawContent, setRawContent] = useState(
    typeof content === 'string' ? content : ''
  );

  useEffect(() => {
    (async () => {
      if (typeof content === 'object') {
        let value = '';
        for await (const delta of readStreamableValue(content)) {
          if (typeof delta === 'string') {
            setRawContent((value += delta));
          }
        }
      }
    })();
  }, [content]);

  return rawContent;
};
