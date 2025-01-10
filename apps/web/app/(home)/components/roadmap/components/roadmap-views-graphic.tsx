'use client';

import { Select } from '@repo/design-system/components/precomposed/select';
import { Switch } from '@repo/design-system/components/precomposed/switch';

import { useState } from 'react';

const timeframes = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
  { value: 'two-year', label: '2 Years' },
];

const groupByOptions = [
  { value: 'feature', label: 'Feature' },
  { value: 'product', label: 'Product' },
  { value: 'group', label: 'Group' },
  { value: 'owner', label: 'Owner' },
];

export const RoadmapViewsGraphic = () => {
  const [timeframe, setTimeframe] = useState<string>(timeframes[0].value);
  const [groupBy, setGroupBy] = useState<string>(groupByOptions[0].value);

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex w-full flex-col gap-2">
        <Select
          value={timeframe}
          onChange={setTimeframe}
          data={timeframes}
          type="timeframe"
        />
        <Select
          value={groupBy}
          onChange={setGroupBy}
          data={groupByOptions}
          type="grouping"
        />
        <Switch description="Show completed" />
      </div>
    </div>
  );
};
