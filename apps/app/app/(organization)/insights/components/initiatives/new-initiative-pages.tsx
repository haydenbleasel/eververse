import { database } from '@/lib/database';
import { currentMembers } from '@repo/backend/auth/utils';
import { StackCard } from '@repo/design-system/components/stack-card';
import { FrameIcon, NotebookIcon, PaperclipIcon } from 'lucide-react';
import { InitiativePageCard } from './initiative-page-card';

export const NewInitiativePages = async () => {
  const [pages, canvases, members] = await Promise.all([
    database.initiativePage.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        creatorId: true,
        initiativeId: true,
      },
    }),
    database.initiativeCanvas.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        creatorId: true,
        initiativeId: true,
      },
    }),
    currentMembers(),
  ]);

  const getOwner = (userId: string) => {
    return members.find((member) => member.id === userId);
  };

  const pagesData = pages.map((page) => ({
    id: `${page.initiativeId}/${page.id}`,
    title: page.title,
    date: page.createdAt,
    icon: () => <NotebookIcon size={16} className="text-muted-foreground" />,
    owner: getOwner(page.creatorId),
  }));

  const canvasesData = canvases.map((canvas) => ({
    id: `${canvas.initiativeId}/${canvas.id}`,
    title: canvas.title,
    date: canvas.createdAt,
    icon: () => <FrameIcon size={16} className="text-muted-foreground" />,
    owner: getOwner(canvas.creatorId),
  }));

  const data = [...pagesData, ...canvasesData].sort((itemA, itemB) => {
    return new Date(itemB.date).getTime() - new Date(itemA.date).getTime();
  });

  return (
    <StackCard
      className="p-0"
      title="New Initiative Pages"
      icon={PaperclipIcon}
    >
      <div className="flex flex-col gap-px p-1">
        {data.map((item) => (
          <InitiativePageCard key={item.id} {...item} />
        ))}
      </div>
    </StackCard>
  );
};
