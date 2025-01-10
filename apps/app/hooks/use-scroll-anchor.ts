import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';

export const useScrollAnchor = (): {
  messagesRef: MutableRefObject<HTMLDivElement | null>;
  scrollRef: MutableRefObject<HTMLDivElement | null>;
  visibilityRef: MutableRefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
  isAtBottom: boolean;
  isVisible: boolean;
} => {
  const messagesReference = useRef<HTMLDivElement>(null);
  const scrollReference = useRef<HTMLDivElement>(null);
  const visibilityReference = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messagesReference.current) {
      messagesReference.current.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    if (messagesReference.current && isAtBottom && !isVisible) {
      messagesReference.current.scrollIntoView({
        block: 'end',
      });
    }
  }, [isAtBottom, isVisible]);

  useEffect(() => {
    const { current } = scrollReference;

    if (!current) {
      return;
    }

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      const offset = 25;
      const newIsAtBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - offset;

      setIsAtBottom(newIsAtBottom);
    };

    current.addEventListener('scroll', handleScroll);

    return () => {
      current.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!visibilityReference.current) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        }
      },
      {
        rootMargin: '0px 0px -150px 0px',
      }
    );

    observer.observe(visibilityReference.current);

    return () => {
      observer.disconnect();
    };
  });

  return {
    messagesRef: messagesReference,
    scrollRef: scrollReference,
    visibilityRef: visibilityReference,
    scrollToBottom,
    isAtBottom,
    isVisible,
  };
};
