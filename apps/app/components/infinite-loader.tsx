import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type InfiniteLoaderProperties = {
  readonly onView: () => Promise<unknown>;
  readonly loading?: boolean;
};

export const InfiniteLoader = ({
  onView,
  loading,
}: InfiniteLoaderProperties) => {
  const [visible, setVisible] = useState(false);
  const listReference = useRef<HTMLDivElement>(null);
  const inView = useInView(listReference, {});

  useEffect(() => {
    if (loading) {
      return;
    }

    if (visible) {
      onView()
        .then(() => setVisible(false))
        .catch(handleError);
    } else if (inView) {
      setVisible(true);
    }
  }, [inView, onView, visible, loading]);

  return (
    <div
      ref={listReference}
      className="flex w-full items-center justify-center p-3"
    >
      <LoadingCircle />
    </div>
  );
};
