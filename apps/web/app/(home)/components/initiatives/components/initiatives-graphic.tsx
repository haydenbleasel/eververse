import { ArrowRightIcon } from 'lucide-react';
import Image from 'next/image';

const initiatives = [
  {
    id: '1',
    title: 'Improve the onboarding experience',
    description: 'Create a more welcoming experience for new users.',
    emoji: '👋',
    team: ['/example-user-1.jpg', '/example-user-2.jpg', '/example-user-3.jpg'],
  },
  {
    id: '2',
    title: 'Create a unified design system',
    description: 'Develop a consistent design language for the product.',
    emoji: '🎨',
    team: ['/example-user-4.jpg'],
  },
  {
    id: '3',
    title: 'Optimize the checkout flow',
    description: 'Increase conversions by improving the checkout process.',
    emoji: '💳',
    team: ['/example-user-5.jpg', '/example-user-6.jpg'],
  },
];

export const InitiativesGraphic = () => (
  <div className="flex h-full w-full items-center justify-center p-8">
    <div className="grid gap-1">
      {initiatives.map((initiative) => (
        <div
          key={initiative.id}
          className="flex items-center justify-between gap-8 rounded-lg border bg-background px-4 py-2 shadow-sm"
        >
          <span className="flex items-center gap-4">
            <p className="shrink-0 text-xl">{initiative.emoji}</p>
            <span>
              <h2 className="m-0 truncate font-medium text-sm">
                {initiative.title}
              </h2>
              <p className="m-0 truncate text-muted-foreground text-xs">
                {initiative.description}
              </p>
            </span>
          </span>
          <div className="flex items-center justify-end gap-4">
            <div className="-space-x-1 flex shrink-0 items-center hover:space-x-1">
              {initiative.team.map((member) => (
                <Image
                  key={member}
                  src={member}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full transition-all"
                />
              ))}
            </div>
            <ArrowRightIcon
              size={16}
              className="shrink-0 text-muted-foreground"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);
