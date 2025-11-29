import type { ReactNode } from "react";

type TemplatesLayoutProps = {
  children: ReactNode;
};

const TemplatesLayout = ({ children }: TemplatesLayoutProps) => (
  <div className="px-6 py-16">
    <div className="mx-auto grid w-full max-w-3xl gap-6">{children}</div>
  </div>
);

export default TemplatesLayout;
