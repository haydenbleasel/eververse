"use client";

import * as RoadmapUiCalendar from "@repo/design-system/components/ui/kibo-ui/calendar";
import type { ComponentProps } from "react";

type CalendarProperties = {
  readonly features: ComponentProps<
    typeof RoadmapUiCalendar.CalendarBody
  >["features"];
};

export const Calendar = ({ features }: CalendarProperties) => {
  const earliestYear =
    features
      .filter((feature) => feature.startAt)
      .map((feature) => feature.startAt.getFullYear())
      .sort()
      .at(0) ?? new Date().getFullYear();

  const latestYear =
    features
      .filter((feature) => feature.endAt)
      .map((feature) => feature.endAt.getFullYear())
      .sort()
      .at(-1) ?? new Date().getFullYear();

  return (
    <RoadmapUiCalendar.CalendarProvider className="border-b bg-background">
      <RoadmapUiCalendar.CalendarDate>
        <RoadmapUiCalendar.CalendarDatePicker>
          <RoadmapUiCalendar.CalendarMonthPicker />
          <RoadmapUiCalendar.CalendarYearPicker
            end={latestYear}
            start={earliestYear}
          />
        </RoadmapUiCalendar.CalendarDatePicker>
        <RoadmapUiCalendar.CalendarDatePagination />
      </RoadmapUiCalendar.CalendarDate>
      <RoadmapUiCalendar.CalendarHeader />
      <RoadmapUiCalendar.CalendarBody features={features}>
        {({ feature }) => (
          <RoadmapUiCalendar.CalendarItem feature={feature} key={feature.id} />
        )}
      </RoadmapUiCalendar.CalendarBody>
    </RoadmapUiCalendar.CalendarProvider>
  );
};
