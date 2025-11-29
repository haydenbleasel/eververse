import type { ComponentProps, ReactNode } from "react";
import * as DropdownMenuComponent from "../ui/dropdown-menu";

export type DropdownMenuProperties = ComponentProps<
  typeof DropdownMenuComponent.DropdownMenu
> & {
  readonly data: ComponentProps<
    typeof DropdownMenuComponent.DropdownMenuItem
  >[];
  readonly children: ReactNode;
  readonly label?: string;
};

export const DropdownMenu = ({
  data,
  children,
  label,
  ...properties
}: DropdownMenuProperties) => (
  <DropdownMenuComponent.DropdownMenu {...properties}>
    <DropdownMenuComponent.DropdownMenuTrigger asChild>
      <div>{children}</div>
    </DropdownMenuComponent.DropdownMenuTrigger>
    <DropdownMenuComponent.DropdownMenuContent>
      {label ? (
        <>
          <DropdownMenuComponent.DropdownMenuLabel>
            {label}
          </DropdownMenuComponent.DropdownMenuLabel>
          <DropdownMenuComponent.DropdownMenuSeparator />
        </>
      ) : null}
      {data.map((item, index) => (
        <DropdownMenuComponent.DropdownMenuItem {...item} key={index} />
      ))}
    </DropdownMenuComponent.DropdownMenuContent>
  </DropdownMenuComponent.DropdownMenu>
);
