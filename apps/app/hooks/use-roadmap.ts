import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type RoadmapState = {
  peekId: string | null;
  setPeekId: (peekId: string | null) => void;
  range: 'daily' | 'monthly' | 'quarterly';
  setRange: (range: 'daily' | 'monthly' | 'quarterly') => void;
  grouping: 'feature' | 'product' | 'group' | 'owner' | 'release';
  setGrouping: (
    grouping: 'feature' | 'product' | 'group' | 'owner' | 'release'
  ) => void;
  filter: 'incomplete' | 'complete' | 'all';
  setFilter: (filter: 'incomplete' | 'complete' | 'all') => void;
  zoom: number;
  setZoom: (zoom: number) => void;
};

export const useRoadmap = create<RoadmapState>()(
  devtools(
    persist(
      (set) => ({
        peekId: null,
        setPeekId: (peekId: string | null) => set(() => ({ peekId })),
        range: 'quarterly',
        setRange: (range: 'daily' | 'monthly' | 'quarterly') =>
          set(() => ({ range })),
        grouping: 'feature',
        setGrouping: (
          grouping: 'feature' | 'product' | 'group' | 'owner' | 'release'
        ) => set(() => ({ grouping })),
        filter: 'incomplete',
        setFilter: (filter: 'incomplete' | 'complete' | 'all') =>
          set(() => ({ filter })),
        zoom: 100,
        setZoom: (zoom: number) => set(() => ({ zoom })),
      }),
      {
        name: 'eververse-roadmap',
      }
    )
  )
);
