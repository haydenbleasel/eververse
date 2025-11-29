"use client";

import type { User } from "@repo/backend/auth";
import { EververseRole } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import type {
  FeatureStatus,
  Group,
  Prisma,
  Product,
  Release,
} from "@repo/backend/prisma/client";
import { DataTableColumnHeader } from "@repo/design-system/components/data-table-column-header";
import { Link } from "@repo/design-system/components/link";
import { Checkbox } from "@repo/design-system/components/precomposed/checkbox";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useInfiniteQuery } from "@tanstack/react-query";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  FilterIcon,
  LinkIcon,
  SparkleIcon,
  UserCircleIcon,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { ComponentProps, FormEventHandler } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GetFeaturesResponse } from "@/actions/feature/list";
import { getFeatures } from "@/actions/feature/list";
import { AvatarTooltip } from "@/components/avatar-tooltip";
import { EmptyState } from "@/components/empty-state";
import { useFeatureForm } from "@/components/feature-form/use-feature-form";
import { Header } from "@/components/header";
import { calculateRice } from "@/lib/rice";
import { FeatureRiceScore } from "../[feature]/components/feature-rice-score";
import { FeaturesListFilter } from "./features-list-filter";
import { FeaturesToolbar } from "./features-toolbar";

type FeaturesListProperties = {
  readonly title?: string;
  readonly editable?: boolean;
  readonly breadcrumbs?: ComponentProps<typeof Header>["breadcrumbs"];
  readonly statuses: Pick<FeatureStatus, "color" | "id" | "name" | "order">[];
  readonly query: Partial<Prisma.FeatureWhereInput>;
  readonly count: number;
  readonly products: Pick<Product, "emoji" | "id" | "name">[];
  readonly releases: Pick<Release, "id" | "title">[];
  readonly groups: Pick<
    Group,
    "emoji" | "id" | "name" | "parentGroupId" | "productId"
  >[];
  readonly members: User[];
  readonly role?: string;
};

const createColumns = (
  members: User[],
  editable: boolean
): ColumnDef<GetFeaturesResponse[number]>[] => [
  {
    id: "select",
    enableSorting: false,
    header: ({ table }) =>
      editable ? (
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(Boolean(value))
          }
        />
      ) : null,
    cell: ({ row }) =>
      editable ? (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        />
      ) : null,
  },
  {
    accessorKey: "title",
    sortingFn: (rowA, rowB) =>
      rowA.original.title.localeCompare(rowB.original.title, undefined, {
        sensitivity: "base",
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
        breadcrumbs.push("...");
      }

      if (row.original.group) {
        breadcrumbs.push(row.original.group.name);
      }

      return (
        <Link
          className="block max-w-[300px] overflow-hidden"
          href={`/features/${row.original.id}`}
        >
          <span className="block truncate">{row.original.title}</span>
          <span className="block truncate text-muted-foreground text-xs">
            {breadcrumbs.join(" / ")}
          </span>
        </Link>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
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
    id: "owner",
    accessorKey: "ownerId",
    sortingFn: (rowA, rowB) => {
      const memberA = members.find(
        (member) => member.id === rowA.original.ownerId
      );
      const memberB = members.find(
        (member) => member.id === rowB.original.ownerId
      );

      const memberAName = memberA ? getUserName(memberA) : "";
      const memberBName = memberB ? getUserName(memberB) : "";

      if (!(memberAName || memberBName)) {
        return 0;
      }

      if (!memberAName) {
        return 1;
      }

      if (!memberBName) {
        return -1;
      }

      return memberAName.localeCompare(memberBName, undefined, {
        sensitivity: "base",
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
      const name = member ? getUserName(member) : "";

      if (!(member && name)) {
        return <p className="text-muted-foreground">None</p>;
      }

      return (
        <AvatarTooltip
          fallback={name.slice(0, 2).toUpperCase()}
          src={member.user_metadata.image_url}
          subtitle={member.id}
          title={name}
        />
      );
    },
  },
  {
    accessorFn: (row) => row.rice ?? row.aiRice,
    id: "rice",
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
        {row.original.rice || row.original.aiRice ? null : (
          <p className="text-muted-foreground">None</p>
        )}
      </>
    ),
  },
  {
    id: "feedback",
    accessorKey: "_count.feedback",
    sortingFn: (rowA, rowB) =>
      rowA.original._count.feedback - rowB.original._count.feedback,
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Feedback" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <LinkIcon className="text-muted-foreground" size={16} />
        {row.original._count.feedback}
      </div>
    ),
  },
  {
    id: "portal",
    accessorKey: "portalFeature.portalId",
    sortingFn: (rowA, rowB) => {
      const portalA = rowA.original.portalFeature?.portalId ?? "";
      const portalB = rowB.original.portalFeature?.portalId ?? "";

      return portalA.localeCompare(portalB, undefined, { sensitivity: "base" });
    },
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Portal" />
    ),
    cell: ({ row }) =>
      row.original.portalFeature?.portalId ? (
        <Button asChild size="icon" variant="link">
          <a
            aria-label="Portal"
            href={`/api/portal?feature=${row.original.id}`}
            rel="noreferrer"
            target="_blank"
          >
            <ZapIcon size={16} />
          </a>
        </Button>
      ) : null,
  },
  {
    id: "connection",
    accessorKey: "connection.href",
    sortingFn: (rowA, rowB) => {
      const portalA = rowA.original.connection?.href ?? "";
      const portalB = rowB.original.connection?.href ?? "";

      return portalA.localeCompare(portalB, undefined, { sensitivity: "base" });
    },
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Link" />
    ),
    cell: ({ row }) => {
      let featureConnectionSource = "";

      if (row.original.connection?.type === "GITHUB") {
        featureConnectionSource = "/github.svg";
      } else if (row.original.connection?.type === "JIRA") {
        featureConnectionSource = "/jira.svg";
      } else if (row.original.connection?.type === "LINEAR") {
        featureConnectionSource = "/linear.svg";
      }

      return row.original.connection ? (
        <Button asChild size="icon" variant="link">
          <a
            aria-label="Connection"
            href={row.original.connection.href}
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt=""
              height={16}
              src={featureConnectionSource}
              width={16}
            />
          </a>
        </Button>
      ) : null;
    },
  },
  {
    accessorKey: "createdAt",
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <p className="whitespace-nowrap text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    ),
  },
];

export const FeaturesList = ({
  title = "Features",
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
    queryKey: ["features", query],
    queryFn: async ({ pageParam }) => {
      const response = await getFeatures(pageParam, query);

      if ("error" in response) {
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
    { id: "createdAt", desc: true },
  ]);
  const searchParams = useSearchParams();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    searchParams.size
      ? [
          {
            id: searchParams.get("id") as string,
            value: JSON.parse(searchParams.get("value") as string),
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
    window.addEventListener("scroll", fetchMoreOnBottomReached);

    return () => {
      window.removeEventListener("scroll", fetchMoreOnBottomReached);
    };
  }, [fetchMoreOnBottomReached]);

  const handleShow = () => {
    const groupId =
      typeof parameters.group === "string" ? parameters.group : undefined;
    let productId =
      typeof parameters.product === "string" ? parameters.product : undefined;

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
    const search = formData.get("search") as string;

    if (search === "-") {
      return;
    }

    if (search) {
      router.push(`/features/search?query=${encodeURIComponent(search)}`);
    } else {
      router.push("/features");
    }
  };

  const handleToolbarClose = () => {
    setRowSelection({});
  };

  return (
    <>
      <Header badge={count} breadcrumbs={breadcrumbs} title={title}>
        <div className="-m-2 flex flex-1 items-center justify-end gap-2">
          <FeaturesListFilter
            column={table.getColumn("status")}
            icon={FilterIcon}
            options={uniqueStatuses}
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
            title="Status"
          />
          <FeaturesListFilter
            column={table.getColumn("owner")}
            icon={UserCircleIcon}
            options={
              members.map((member) => ({
                label: getUserName(member),
                value: member.id ?? "",
                color: "",
              })) ?? []
            }
            renderItem={(item) => {
              const member = members.find(({ id }) => id === item.value);

              if (!member) {
                return null;
              }

              return (
                <div className="flex items-center gap-2">
                  <Image
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                    height={20}
                    src={member.user_metadata.image_url}
                    width={20}
                  />
                  {item.label}
                </div>
              );
            }}
            title="Owner"
          />
          <form onSubmit={handleSearch}>
            <Input
              className="h-8 w-48 bg-background text-xs"
              name="search"
              placeholder="Search"
            />
          </form>
          {role === EververseRole.Member ? null : (
            <Button className="shrink-0" onClick={handleShow} size="sm">
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
                className="h-[53px]"
                data-state={row.getIsSelected() && "selected"}
                key={row.id}
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
                className="h-24 py-16 text-center"
                colSpan={columns.length}
              >
                <EmptyState
                  description="Try adjusting your filters or search query."
                  title="No features found."
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {table.getFilteredSelectedRowModel().rows.length > 0 && editable ? (
        <FeaturesToolbar
          groups={groups}
          members={members}
          onClose={handleToolbarClose}
          products={products}
          releases={releases}
          selected={selectedRows}
          statuses={statuses}
        />
      ) : null}
    </>
  );
};
