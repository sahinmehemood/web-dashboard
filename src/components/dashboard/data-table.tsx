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
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDir, setSortDir] = useState<SortDir>(initialSortDir);

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
            {sorted.length === 0 ? (
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
              sorted.map((row, i) => (
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

      {footerCount && (
        <div className="border-t border-border px-4 py-2.5 text-right">
          {footerCount(sorted.length, data.length)}
        </div>
      )}
    </div>
  );
}