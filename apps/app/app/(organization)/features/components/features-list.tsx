'use client';

import { DataTableColumnHeader } from '@repo/design-system/components/data-table-column-header';
import { Link } from '@repo/design-system/components/link';
import { Checkbox } from '@repo/design-system/components/precomposed/checkbox';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  FilterIcon,
  LinkIcon,
  SparkleIcon,
  UserCircleIcon,
  ZapIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getFeatures } from '@/actions/feature/list';
import type { GetFeaturesResponse } from '@/actions/feature/list';
import { AvatarTooltip } from '@/components/avatar-tooltip';
import { EmptyState } from '@/components/empty-state';
import { useFeatureForm } from '@/components/feature-form/use-feature-form';
import { Header } from '@/components/header';
import { calculateRice } from '@/lib/rice';
import type { User } from '@repo/backend/auth';
import { EververseRole } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import type {
  FeatureStatus,
  Group,
  Prisma,
  Product,
  Release,
} from '@repo/backend/prisma/client';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import type { ComponentProps, FormEventHandler } from 'react';
import { FeatureRiceScore } from '../[feature]/components/feature-rice-score';
import { FeaturesListFilter } from './features-list-filter';
import { FeaturesToolbar } from './features-toolbar';

type FeaturesListProperties = {
  readonly title?: string;
  readonly editable?: boolean;
  readonly breadcrumbs?: ComponentProps<typeof Header>['breadcrumbs'];
  readonly statuses: Pick<FeatureStatus, 'color' | 'id' | 'name' | 'order'>[];
  readonly query: Partial<Prisma.FeatureWhereInput>;
  readonly count: number;
  readonly products: Pick<Product, 'emoji' | 'id' | 'name'>[];
  readonly releases: Pick<Release, 'id' | 'title'>[];
  readonly groups: Pick<
    Group,
    'emoji' | 'id' | 'name' | 'parentGroupId' | 'productId'
  >[];
  readonly members: User[];
  readonly role?: string;
};

const createColumns = (
  members: User[],
  editable: boolean
): ColumnDef<GetFeaturesResponse[number]>[] => [
  {
    id: 'select',
    enableSorting: false,
    header: ({ table }) =>
      editable ? (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(Boolean(value))
          }
          aria-label="Select all"
        />
      ) : null,
    cell: ({ row }) =>
      editable ? (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label="Select row"
        />
      ) : null,
  },
  {
    accessorKey: 'title',
    sortingFn: (rowA, rowB) =>
      rowA.original.title.localeCompare(rowB.original.title, undefined, {
        sensitivity: 'base',
      }),
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const breadcrumbs = [];

      if (row.original.product) {
        breadcrumbs.push(row.original.product.name);
      }

      if (row.original.group?.parentGroupId) {
        breadcrumbs.push('...');
      }

      if (row.original.group) {
        breadcrumbs.push(row.original.group.name);
      }

      return (
        <Link
          href={`/features/${row.original.id}`}
          className="block max-w-[300px] overflow-hidden"
        >
          <span className="block truncate">{row.original.title}</span>
          <span className="block truncate text-muted-foreground text-xs">
            {breadcrumbs.join(' / ')}
          </span>
        </Link>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    sortingFn: (rowA, rowB) =>
      rowA.original.status.order - rowB.original.status.order,
    filterFn: (row, _id, value: string[]) =>
      value.includes(row.original.status.id),
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="h-2 w-2">
        <Tooltip content={row.original.status.name}>
          <div
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: row.original.status.color }}
          />
        </Tooltip>
      </div>
    ),
  },
  {
    id: 'owner',
    accessorKey: 'ownerId',
    sortingFn: (rowA, rowB) => {
      const memberA = members.find(
        (member) => member.id === rowA.original.ownerId
      );
      const memberB = members.find(
        (member) => member.id === rowB.original.ownerId
      );

      const memberAName = memberA ? getUserName(memberA) : '';
      const memberBName = memberB ? getUserName(memberB) : '';

      if (!memberAName && !memberBName) {
        return 0;
      }

      if (!memberAName) {
        return 1;
      }

      if (!memberBName) {
        return -1;
      }

      return memberAName.localeCompare(memberBName, undefined, {
        sensitivity: 'base',
      });
    },
    filterFn: (row, _id, value: string[]) =>
      value.includes(row.original.ownerId),
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    cell: ({ row }) => {
      const member = members.find(({ id }) => id === row.original.ownerId);
      const name = member ? getUserName(member) : '';

      if (!member || !name) {
        return <p className="text-muted-foreground">None</p>;
      }

      return (
        <AvatarTooltip
          fallback={name.slice(0, 2).toUpperCase()}
          title={name}
          subtitle={member.id}
          src={member.user_metadata.image_url}
        />
      );
    },
  },
  {
    accessorFn: (row) => row.rice ?? row.aiRice,
    id: 'rice',
    sortingFn: (rowA, rowB) => {
      const riceA = rowA.original.rice ?? rowA.original.aiRice;
      const riceB = rowB.original.rice ?? rowB.original.aiRice;

      const calculatedRiceA = riceA ? calculateRice(riceA) : 0;
      const calculatedRiceB = riceB ? calculateRice(riceB) : 0;

      return calculatedRiceA - calculatedRiceB;
    },
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RICE" />
    ),
    cell: ({ row }) => (
      <>
        {row.original.rice ? (
          <FeatureRiceScore rice={row.original.rice} />
        ) : null}
        {row.original.aiRice && !row.original.rice ? (
          <div className="flex items-center gap-2 text-violet-500 dark:text-violet-400">
            <SparkleIcon size={16} />
            <FeatureRiceScore rice={row.original.aiRice} />
          </div>
        ) : null}
        {!row.original.rice && !row.original.aiRice ? (
          <p className="text-muted-foreground">None</p>
        ) : null}
      </>
    ),
  },
  {
    id: 'feedback',
    accessorKey: '_count.feedback',
    sortingFn: (rowA, rowB) =>
      rowA.original._count.feedback - rowB.original._count.feedback,
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Feedback" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <LinkIcon size={16} className="text-muted-foreground" />
        {row.original._count.feedback}
      </div>
    ),
  },
  {
    id: 'portal',
    accessorKey: 'portalFeature.portalId',
    sortingFn: (rowA, rowB) => {
      const portalA = rowA.original.portalFeature?.portalId ?? '';
      const portalB = rowB.original.portalFeature?.portalId ?? '';

      return portalA.localeCompare(portalB, undefined, { sensitivity: 'base' });
    },
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Portal" />
    ),
    cell: ({ row }) =>
      row.original.portalFeature?.portalId ? (
        <Button size="icon" variant="link" asChild>
          <a
            href={`/api/portal?feature=${row.original.id}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Portal"
          >
            <ZapIcon size={16} />
          </a>
        </Button>
      ) : null,
  },
  {
    id: 'connection',
    accessorKey: 'connection.href',
    sortingFn: (rowA, rowB) => {
      const portalA = rowA.original.connection?.href ?? '';
      const portalB = rowB.original.connection?.href ?? '';

      return portalA.localeCompare(portalB, undefined, { sensitivity: 'base' });
    },
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Link" />
    ),
    cell: ({ row }) => {
      let featureConnectionSource = '';

      if (row.original.connection?.githubInstallationId) {
        featureConnectionSource = '/github.svg';
      } else if (row.original.connection?.atlassianInstallationId) {
        featureConnectionSource = '/jira.svg';
      } else if (row.original.connection?.linearInstallationId) {
        featureConnectionSource = '/linear.svg';
      }

      return row.original.connection ? (
        <Button asChild size="icon" variant="link">
          <a
            href={row.original.connection.href}
            target="_blank"
            rel="noreferrer"
            aria-label="Connection"
          >
            <Image
              src={featureConnectionSource}
              width={16}
              height={16}
              alt=""
            />
          </a>
        </Button>
      ) : null;
    },
  },
  {
    accessorKey: 'createdAt',
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <p className="whitespace-nowrap text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
    ),
  },
];

export const FeaturesList = ({
  title = 'Features',
  breadcrumbs,
  statuses,
  query,
  count,
  products,
  groups,
  releases,
  editable = false,
  members,
  role,
}: FeaturesListProperties) => {
  const router = useRouter();
  const { show } = useFeatureForm();
  const parameters = useParams();
  const { data, error, fetchNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['features', query],
    queryFn: async ({ pageParam }) => {
      const response = await getFeatures(pageParam, query);

      if ('error' in response) {
        throw response.error;
      }

      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParameter) =>
      lastPage.length === 0 ? undefined : lastPageParameter + 1,
    getPreviousPageParam: (_firstPage, _allPages, firstPageParameter) =>
      firstPageParameter <= 1 ? undefined : firstPageParameter - 1,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const searchParams = useSearchParams();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    searchParams.size
      ? [
          {
            id: searchParams.get('id') as string,
            value: JSON.parse(searchParams.get('value') as string),
          },
        ]
      : []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const flatData = useMemo(() => data?.pages.flat() ?? [], [data]);
  const totalDbRowCount = data?.pages.at(0)?.at(0)?.meta.total ?? 0;
  const totalFetched = flatData.length;
  const columns = useMemo(
    () => createColumns(members, editable),
    [members, editable]
  );

  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id);

  useEffect(() => {
    if (error) {
      handleError(error.message);
    }
  }, [error]);

  const fetchMoreOnBottomReached = useCallback(() => {
    const { scrollY, innerHeight } = window;
    const { scrollHeight } = document.documentElement;

    // Once the user has scrolled within 200px of the bottom of the page, fetch more data if we can
    if (
      scrollHeight - scrollY - innerHeight < 200 &&
      !isFetching &&
      totalFetched < totalDbRowCount
    ) {
      fetchNextPage().catch(handleError);
    }
  }, [fetchNextPage, isFetching, totalFetched, totalDbRowCount]);

  useEffect(() => {
    window.addEventListener('scroll', fetchMoreOnBottomReached);

    return () => {
      window.removeEventListener('scroll', fetchMoreOnBottomReached);
    };
  }, [fetchMoreOnBottomReached]);

  const handleShow = () => {
    const groupId =
      typeof parameters.group === 'string' ? parameters.group : undefined;
    let productId =
      typeof parameters.product === 'string' ? parameters.product : undefined;

    if (parameters.group) {
      productId =
        groups.find(({ id }) => id === parameters.group)?.productId ??
        undefined;
    }

    show({ groupId, productId });
  };

  const uniqueStatuses: {
    label: string;
    value: string;
    color: string;
  }[] = [];

  for (const status of statuses) {
    uniqueStatuses.push({
      label: status.name,
      value: status.id,
      color: status.color,
    });
  }

  const handleSearch: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = formData.get('search') as string;

    if (search === '-') {
      return;
    }

    if (search) {
      router.push(`/features/search?query=${encodeURIComponent(search)}`);
    } else {
      router.push('/features');
    }
  };

  const handleToolbarClose = () => {
    setRowSelection({});
  };

  return (
    <>
      <Header title={title} badge={count} breadcrumbs={breadcrumbs}>
        <div className="-m-2 flex flex-1 items-center justify-end gap-2">
          <FeaturesListFilter
            icon={FilterIcon}
            title="Status"
            options={uniqueStatuses}
            column={table.getColumn('status')}
            renderItem={(item) => {
              const source = uniqueStatuses.find(
                (status) => status.value === item.value
              );

              if (!source) {
                return null;
              }

              return (
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  {item.label}
                </div>
              );
            }}
          />
          <FeaturesListFilter
            icon={UserCircleIcon}
            title="Owner"
            options={
              members.map((member) => ({
                label: getUserName(member),
                value: member.id ?? '',
                color: '',
              })) ?? []
            }
            column={table.getColumn('owner')}
            renderItem={(item) => {
              const member = members.find(({ id }) => id === item.value);

              if (!member) {
                return null;
              }

              return (
                <div className="flex items-center gap-2">
                  <Image
                    src={member.user_metadata.image_url}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  {item.label}
                </div>
              );
            }}
          />
          <form onSubmit={handleSearch}>
            <Input
              name="search"
              placeholder="Search"
              className="h-8 w-48 bg-background text-xs"
            />
          </form>
          {role === EververseRole.Member ? null : (
            <Button onClick={handleShow} size="sm" className="shrink-0">
              Create
            </Button>
          )}
        </div>
      </Header>

      <Table>
        <TableHeader className="sticky top-[45px] z-10 bg-backdrop/90 backdrop-blur-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="h-[53px]"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 py-16 text-center"
              >
                <EmptyState
                  title="No features found."
                  description="Try adjusting your filters or search query."
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {table.getFilteredSelectedRowModel().rows.length > 0 && editable ? (
        <FeaturesToolbar
          groups={groups}
          products={products}
          releases={releases}
          selected={selectedRows}
          statuses={statuses}
          onClose={handleToolbarClose}
          members={members}
        />
      ) : null}
    </>
  );
};
