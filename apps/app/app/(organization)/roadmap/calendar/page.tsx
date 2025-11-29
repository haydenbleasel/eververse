import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { database } from "@/lib/database";
import { Calendar } from "./components/calendar";

export const metadata: Metadata = createMetadata({
  title: "Calendar",
  description: "See a calendar view of your organization’s features.",
});

const Roadmap = async () => {
  const features = await database.feature.findMany({
    where: {
      startAt: { not: null },
    },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      group: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      initiatives: {
        select: {
          id: true,
          title: true,
        },
      },
      release: {
        select: {
          id: true,
          title: true,
        },
      },
      ownerId: true,
      status: {
        select: {
          id: true,
          name: true,
          order: true,
          complete: true,
          color: true,
        },
      },
    },
    orderBy: { startAt: "asc" },
  });

  return (
    <Calendar
      features={features.map((feature) => ({
        endAt: feature.endAt ?? new Date(),
        id: feature.id,
        name: feature.title,
        startAt: feature.startAt ?? new Date(),
        status: {
          color: feature.status?.color,
          id: feature.status?.id,
          name: feature.status?.name,
        },
      }))}
    />
  );
};

export default Roadmap;
