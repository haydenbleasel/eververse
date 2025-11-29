import type { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { lazy, Suspense } from "react";

const fallback = (
  <div
    style={{
      background: "hsl(var(--card))",
      width: 16,
      height: 16,
      flexShrink: 0,
      borderRadius: "100%",
    }}
  />
);

type DynamicIconProperties = Omit<LucideProps, "ref"> & {
  readonly name: keyof typeof dynamicIconImports;
};

export const DynamicIcon = ({ name, ...properties }: DynamicIconProperties) => {
  const LucideIcon = lazy(dynamicIconImports[name]);

  return (
    <Suspense fallback={fallback}>
      <LucideIcon {...properties} />
    </Suspense>
  );
};
