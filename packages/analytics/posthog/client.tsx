'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { type ReactNode, useEffect } from 'react';
import { keys } from '../keys';

type PostHogProviderProps = {
  children: ReactNode;
};

export const identify = posthog.identify;

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    posthog.init(keys().NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      capture_pageview: false, // We capture pageviews manually
      capture_pageleave: true, // Enable pageleave capture
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
};

export const pageview = (pathname: string, searchParams: URLSearchParams) => {
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += `?${search}`;
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
};
