'use client';

import { cn } from '@repo/design-system/lib/utils';
import {
  LazyMotion,
  domMax,
  m,
  useDragControls,
  useInView,
} from 'motion/react';
import { useRef, useState } from 'react';

const tags = [
  { text: '👋 Onboarding', left: '60%', top: '-5%' },
  { text: '💸 Billing', left: '10%', top: '10%' },
  { text: '👉 Login', left: '50%', top: '20%' },
  { text: '🛒 Checkout', left: '20%', top: '35%' },
  { text: '🏠 Dashboard', left: '70%', top: '50%' },
  { text: '⚡️ Admin', left: '-2%', top: '60%' },
  { text: '📈 Analytics', left: '50%', top: '70%' },
  { text: '📱 Mobile', left: '10%', top: '85%' },
  { text: '🎨 Design', left: '60%', top: '80%' },
  { text: '🤖 Automation', left: '45%', top: '45%' },
  { text: '📧 Email', left: '90%', top: '60%' },
  { text: '📝 Blog', left: '-5%', top: '30%' },
  { text: '📚 Docs', left: '80%', top: '40%' },
  { text: '🔍 SEO', left: '35%', top: '85%' },
  { text: '📦 Integrations', left: '70%', top: '20%' },
  { text: '🔒 Security', left: '40%', top: '10%' },
  { text: '🔧 Settings', left: '90%', top: '0%' },
  { text: '📊 Reporting', left: '25%', top: '60%' },
];

const DraggableTag = ({
  text,
  left,
  top,
  index,
}: (typeof tags)[0] & {
  readonly index: number;
}) => {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <m.div
      className={cn(
        'absolute flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border bg-card p-3 pr-5 font-medium',
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      )}
      style={{ left, top }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.25, bounce: 0.5, type: 'spring' }}
      drag
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      dragControls={controls}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <p>{text}</p>
    </m.div>
  );
};

export const TagsGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: 'all' });

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <div className="not-prose flex flex-wrap gap-2">
      <LazyMotion features={domMax}>
        {tags.map((tag, index) => (
          <DraggableTag key={tag.text} index={index} {...tag} />
        ))}
      </LazyMotion>
    </div>
  );
};
