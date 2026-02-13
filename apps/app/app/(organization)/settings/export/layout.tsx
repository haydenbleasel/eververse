import type { ReactNode } from "react";

type ExportLayoutProps = {
  children: ReactNode;
};

const ExportLayout = ({ children }: ExportLayoutProps) => (
  <div className="px-6 py-16">
    <div className="mx-auto grid w-full max-w-3xl gap-6">{children}</div>
  </div>
);

export default ExportLayout;
