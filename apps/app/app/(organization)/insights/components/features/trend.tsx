import { database } from '@/lib/database';

export const FeaturesTrend = async () => {
  const features = await database.feature.findMany({
    select: {
      status: {
        select: {
          name: true,
        },
      },
    },
  });

  const statusCount: {
    name: string;
    count: number;
  }[] = [];

  for (const feature of features) {
    const status = feature.status.name;
    const existingStatus = statusCount.find((s) => s.name === status);

    if (existingStatus) {
      existingStatus.count++;
    } else {
      statusCount.push({
        name: status,
        count: 1,
      });
    }
  }

  const highestCountFeature = statusCount.reduce((prev, current) => {
    return prev.count > current.count ? prev : current;
  }, statusCount[0]);

  return (
    <p className="text-muted-foreground text-sm">
      Most of your features are {highestCountFeature.name}.
    </p>
  );
};
