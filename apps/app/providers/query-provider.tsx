'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        /*
         * With SSR, we usually want to set some default staleTime
         * above 0 to avoid refetching immediately on the client
         */
        staleTime: 60 * 1000,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  /*
   * Browser: make a new query client if we don't already have one
   * This is very important so we don't re-make a new client if React
   * supsends during the initial render. This may not be needed if we
   * have a suspense boundary BELOW the creation of the query client
   */
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
};

type QueryProviderProperties = {
  readonly children: ReactNode;
};

export const QueryProvider = ({ children }: QueryProviderProperties) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      {children}
    </QueryClientProvider>
  );
};
