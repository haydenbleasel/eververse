"use client";

import { EververseRole, type User } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@repo/design-system/components/kibo-ui/table";
import { Select } from "@repo/design-system/components/precomposed/select";
import { Badge } from "@repo/design-system/components/ui/badge";
import { handleError } from "@repo/design-system/lib/handle-error";
import { capitalize } from "@repo/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useCallback } from "react";
import { toast } from "sonner";
import { updateUserRole } from "@/actions/users/update";
import { DeleteUserButton } from "./delete-user-button";

type MembersTableProps = {
  data: User[];
};

export const MembersTable = ({ data }: MembersTableProps) => {
  const handleUpdateUserRole = useCallback(
    async (userId: string, value: EververseRole) => {
      try {
        const response = await updateUserRole(userId, value);

        if (response.error) {
          throw new Error(response.error);
        }

        toast.success("User role updated");
      } catch (error) {
        handleError(error);
      }
    },
    []
  );

  const columns: ColumnDef<(typeof data)[number]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="relative">
            {row.original.user_metadata.image_url ? (
              <Image
                alt={getUserName(row.original)}
                className="m-0 h-6 w-6 rounded-full"
                height={24}
                src={row.original.user_metadata.image_url}
                unoptimized
                width={24}
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted" />
            )}
          </div>
          <div>
            <span className="font-medium">{getUserName(row.original)}</span>
            <div className="text-muted-foreground text-xs">
              {row.original.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: ({ column }) => (
        <TableColumnHeader className="text-xs" column={column} title="Status" />
      ),
      cell: ({ row }) =>
        row.original.email_confirmed_at ? (
          <Badge className="border-success text-success" variant="outline">
            Active
          </Badge>
        ) : (
          <Badge className="border-warning text-warning" variant="outline">
            Invited
          </Badge>
        ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Joined" />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(new Date(row.original.created_at)),
    },
    {
      accessorKey: "user_metadata.organization_role",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => (
        <Select
          data={Object.values(EververseRole).map((role) => ({
            label: capitalize(role),
            value: role,
          }))}
          onChange={(value) =>
            handleUpdateUserRole(row.original.id, value as EververseRole)
          }
          value={row.original.user_metadata.organization_role}
        />
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <TableColumnHeader
          className="text-xs"
          column={column}
          title="Actions"
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.user_metadata.organization_role ===
          EververseRole.Admin ? null : (
            <DeleteUserButton userId={row.original.id} />
          )}
        </div>
      ),
    },
  ];

  return (
    <TableProvider columns={columns} data={data}>
      <TableHeader>
        {({ headerGroup }) => (
          <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
            {({ header }) => <TableHead header={header} key={header.id} />}
          </TableHeaderGroup>
        )}
      </TableHeader>
      <TableBody>
        {({ row }) => (
          <TableRow key={row.id} row={row}>
            {({ cell }) => <TableCell cell={cell} key={cell.id} />}
          </TableRow>
        )}
      </TableBody>
    </TableProvider>
  );
};
