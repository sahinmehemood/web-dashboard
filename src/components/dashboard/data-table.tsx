import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  headerClassName?: string;
  className?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  searchKeys?: (keyof T & string)[];
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  initialSortKey?: string;
  initialSortDir?: "asc" | "desc";
  footerCount?: (count: number, total: number) => ReactNode;
  pagination?: {
    enabled: boolean;
    defaultPageSize?: number;
    pageSizeOptions?: number[];
    showPageSizeSelector?: boolean;
  };
}

type SortDir = "asc" | "desc";

function cellValue<T>(row: T, col: DataTableColumn<T>): string | number {
  if (col.sortValue) return col.sortValue(row);
  const raw = (row as Record<string, unknown>)[col.key];
  if (typeof raw === "string" || typeof raw === "number") return raw;
  return String(raw ?? "");
}

export function DataTable<T>({
  columns,
  data,
  searchKeys = [],
  searchPlaceholder = "Search…",
  toolbar,
  emptyTitle = "No results",
  emptyDescription = "No rows match your current filters. Try adjusting the search or filters.",
  initialSortKey,
  initialSortDir = "asc",
  footerCount,
  pagination,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDir, setSortDir] = useState<SortDir>(initialSortDir);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.defaultPageSize ?? 10);

  const filtered = useMemo(() => {
    if (!query.trim() || searchKeys.length === 0) return data;
    const q = query.trim().toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) =>
        String((row as Record<string, unknown>)[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = cellValue(a, col);
      const vb = cellValue(b, col);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const toggleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    if (!pagination?.enabled) return sorted;
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pagination?.enabled, safePage, pageSize]);

  if (pagination?.enabled && sorted.length === 0 && query.trim()) {
    return (
      <div className="w-full">
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          {searchKeys.length > 0 ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 pl-8 text-xs"
              />
            </div>
          ) : (
            <span />
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Search className="size-5" />
                      </EmptyMedia>
                      <EmptyTitle>{emptyTitle}</EmptyTitle>
                      <EmptyDescription>{emptyDescription}</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuery("");
                          setSortKey(undefined);
                        }}
                      >
                        Clear search
                      </Button>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(searchKeys.length > 0 || toolbar) && (
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          {searchKeys.length > 0 ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 pl-8 text-xs"
              />
            </div>
          ) : (
            <span />
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    col.sortable && "select-none",
                    col.headerClassName,
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1 font-medium uppercase tracking-wide text-[11px] hover:text-foreground transition-colors",
                        sortKey === col.key && "text-foreground",
                      )}
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 && !query.trim() ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Search className="size-5" />
                      </EmptyMedia>
                      <EmptyTitle>{emptyTitle}</EmptyTitle>
                      <EmptyDescription>{emptyDescription}</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuery("");
                          setSortKey(undefined);
                        }}
                      >
                        Clear search
                      </Button>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination?.enabled && sorted.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Showing {(safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
            </span>
            {pagination.showPageSizeSelector !== false && (
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  {(pagination.pageSizeOptions ?? [10, 25, 50, 100]).map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={safePage === 1}
                  className={safePage === 1 ? "pointer-events-none opacity-40" : ""}
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (totalPages <= 7) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={safePage === p}
                        onClick={(e) => { e.preventDefault(); setPage(p); }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (p === 1 || p === totalPages || (p >= safePage - 1 && p <= safePage + 1)) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={safePage === p}
                        onClick={(e) => { e.preventDefault(); setPage(p); }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (p === safePage - 2 || p === safePage + 2) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={safePage === totalPages}
                  className={safePage === totalPages ? "pointer-events-none opacity-40" : ""}
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {footerCount && (
        <div className="border-t border-border px-4 py-2.5 text-right">
          {footerCount(paginated.length, data.length)}
        </div>
      )}
    </div>
  );
}