'use client';

import { updateUserRole } from '@/actions/users/update';
import { EververseRole, type User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import { Select } from '@repo/design-system/components/precomposed/select';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from '@repo/design-system/components/ui/kibo-ui/table';
import { handleError } from '@repo/design-system/lib/handle-error';
import { capitalize } from '@repo/lib/format';
import type { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { DeleteUserButton } from './delete-user-button';

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

        toast.success('User role updated');
      } catch (error) {
        handleError(error);
      }
    },
    []
  );

  const columns: ColumnDef<(typeof data)[number]>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="relative">
            {row.original.user_metadata.image_url ? (
              <Image
                src={row.original.user_metadata.image_url}
                alt={getUserName(row.original)}
                width={24}
                height={24}
                unoptimized
                className="m-0 h-6 w-6 rounded-full"
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
      id: 'status',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Status" className="text-xs" />
      ),
      cell: ({ row }) =>
        row.original.email_confirmed_at ? (
          <Badge variant="outline" className="border-success text-success">
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="border-warning text-warning">
            Invited
          </Badge>
        ),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Joined" />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
        }).format(new Date(row.original.created_at)),
    },
    {
      accessorKey: 'user_metadata.organization_role',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => (
        <Select
          data={Object.values(EververseRole).map((role) => ({
            label: capitalize(role),
            value: role,
          }))}
          value={row.original.user_metadata.organization_role}
          onChange={(value) =>
            handleUpdateUserRole(row.original.id, value as EververseRole)
          }
        />
      ),
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <TableColumnHeader
          column={column}
          title="Actions"
          className="text-xs"
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
          <TableHeaderGroup key={headerGroup.id} headerGroup={headerGroup}>
            {({ header }) => <TableHead key={header.id} header={header} />}
          </TableHeaderGroup>
        )}
      </TableHeader>
      <TableBody>
        {({ row }) => (
          <TableRow key={row.id} row={row}>
            {({ cell }) => <TableCell key={cell.id} cell={cell} />}
          </TableRow>
        )}
      </TableBody>
    </TableProvider>
  );
};
