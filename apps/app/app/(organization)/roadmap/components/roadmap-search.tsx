import { Input } from '@repo/design-system/components/precomposed/input';
import { SearchIcon } from 'lucide-react';

type RoadmapSearchProperties = {
  readonly value: string;
  readonly onChange: (search: string) => void;
};

export const RoadmapSearch = ({ value, onChange }: RoadmapSearchProperties) => (
  <div className="relative max-w-[16rem] shrink-0">
    <SearchIcon
      size={16}
      className="-translate-y-1/2 absolute top-1/2 left-3 transform text-muted-foreground"
    />
    <Input
      placeholder="Search"
      value={value}
      onChangeText={onChange}
      className="bg-background pl-8"
      maxLength={191}
      autoComplete="off"
    />
  </div>
);
