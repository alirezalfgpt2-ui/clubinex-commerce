/**
 * 🔄 هوک صفحه‌بندی مبتنی بر Cursor
 * — قابل استفاده مجدد در تمام لیست‌های بزرگ
 * — صفحه‌بندی سمت سرور (نه لود همه داده‌ها)
 * — جستجو و مرتب‌سازی
 * — مکانیزم loadMore برای اسکرول بی‌نهایت
 */
import { useState, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { FunctionReference } from "convex/server";

interface UseCursorPaginationOptions {
  pageSize?: number;
}

interface UseCursorPaginationResult<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  totalEstimate: number;
  loadMore: () => void;
  reset: () => void;
  page: number;
  nextPage: () => void;
  prevPage: () => void;
}

/**
 * استفاده:
 * ```tsx
 * const { items, hasMore, loadMore, isLoading } = useCursorPagination(
 *   api.products.listPaginated,
 *   { sortBy, search, activeOnly: true }
 * );
 * ```
 */
export function useCursorPagination<T extends { _id: string; _creationTime: number }>(
  queryFn: FunctionReference<"query">,
  args: Record<string, unknown> = {},
  options: UseCursorPaginationOptions = {}
): UseCursorPaginationResult<T> {
  const { pageSize = 20 } = options;
  const [cursors, setCursors] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const currentCursor = cursors.length > 0 ? cursors[cursors.length - 1] : undefined;

  const queryArgs = useMemo(() => ({
    ...args,
    limit: pageSize,
    cursor: currentCursor,
  }), [args, pageSize, currentCursor]);

  const data = useQuery(queryFn, queryArgs as any);
  const isLoading = data === undefined;

  const items = useMemo(() => {
    if (!data) return [];
    return (data.results || []) as T[];
  }, [data]);

  const hasMore = (data as any)?.hasMore ?? false;
  const totalEstimate = (data as any)?.totalEstimate ?? 0;

  const loadMore = useCallback(() => {
    if ((data as any)?.nextCursor) {
      setCursors((prev) => [...prev, (data as any).nextCursor]);
      setPage((p) => p + 1);
    }
  }, [data]);

  const nextPage = useCallback(() => {
    if (hasMore) loadMore();
  }, [hasMore, loadMore]);

  const prevPage = useCallback(() => {
    if (cursors.length > 0) {
      setCursors((prev) => prev.slice(0, -1));
      setPage((p) => Math.max(1, p - 1));
    }
  }, [cursors.length]);

  const reset = useCallback(() => {
    setCursors([]);
    setPage(1);
  }, []);

  return {
    items,
    hasMore,
    isLoading,
    totalEstimate,
    loadMore,
    reset,
    page,
    nextPage,
    prevPage,
  };
}
