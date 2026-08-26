import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";

import { cx } from "../utils";

/** 分页器中可渲染的页码或省略号。 */
export type CxPaginationPageToken = number | "ellipsis-start" | "ellipsis-end";

/**
 * 根据当前页和总页数生成稳定的页码序列。
 *
 * 页数较多时只保留首尾页与当前页附近的页码，省略号使用带语义的
 * 字符串而不是魔法数字，便于调用方测试和自定义渲染。
 */
export function buildPageTokenList(
  currentPageNumber: number,
  pageCount: number,
): CxPaginationPageToken[] {
  const normalizedPageCount = Math.max(0, Math.floor(pageCount));
  if (normalizedPageCount <= 1) {
    return normalizedPageCount === 1 ? [1] : [];
  }

  const currentPage = Math.min(
    normalizedPageCount,
    Math.max(1, Math.floor(currentPageNumber)),
  );
  if (normalizedPageCount <= 7) {
    return Array.from({ length: normalizedPageCount }, (_, index) => index + 1);
  }

  const pageTokenList: CxPaginationPageToken[] = [1];
  if (currentPage > 4) {
    pageTokenList.push("ellipsis-start");
  }

  const nearbyStart = Math.max(2, currentPage - 1);
  const nearbyEnd = Math.min(normalizedPageCount - 1, currentPage + 1);
  for (let pageNumber = nearbyStart; pageNumber <= nearbyEnd; pageNumber += 1) {
    pageTokenList.push(pageNumber);
  }

  if (currentPage < normalizedPageCount - 3) {
    pageTokenList.push("ellipsis-end");
  }
  pageTokenList.push(normalizedPageCount);
  return pageTokenList;
}

/** CargoX Pagination 的公共属性。 */
export interface CxPaginationProps {
  /** 当前页，从 1 开始。 */
  currentPageNumber: number;
  /** 总页数。 */
  pageCount: number;
  /** 当前页变化回调。 */
  onPageChange: (pageNumber: number) => void;
  /** 左侧总数或记录范围文案。 */
  totalLabel?: string;
  /** 是否展示页大小选择器。 */
  showPageSize?: boolean;
  /** 页大小选项，默认 [10, 20, 50]。 */
  pageSizeOptionList?: number[];
  /** 当前页大小。 */
  pageSize?: number;
  /** 页大小变化回调。 */
  onPageSizeChange?: (pageSize: number) => void;
  /** 是否展示跳页输入框。 */
  showJumpTo?: boolean;
  /** 输入框占位文案。 */
  jumpToLabel?: string;
  /** 页大小选择器前的文案。 */
  pageSizeLabel?: string;
  /** 页面根节点的额外类名。 */
  className?: string;
}

/** CargoX 分页器，视觉规格与 Figma Pagination 对齐。 */
export function Pagination({
  className,
  currentPageNumber,
  jumpToLabel = "跳转",
  onPageChange,
  onPageSizeChange,
  pageCount,
  pageSize,
  pageSizeLabel = "每页",
  pageSizeOptionList = [10, 20, 50],
  showJumpTo = false,
  showPageSize = false,
  totalLabel,
}: CxPaginationProps) {
  const [jumpPageValue, setJumpPageValue] = useState("");
  const pageTokenList = useMemo(
    () => buildPageTokenList(currentPageNumber, pageCount),
    [currentPageNumber, pageCount],
  );
  const normalizedCurrentPage = Math.min(
    Math.max(1, Math.floor(currentPageNumber)),
    Math.max(1, Math.floor(pageCount)),
  );

  const changePage = (nextPageNumber: number) => {
    const normalizedPageNumber = Math.min(
      Math.max(1, Math.floor(nextPageNumber)),
      Math.max(1, Math.floor(pageCount)),
    );
    if (normalizedPageNumber !== normalizedCurrentPage) {
      onPageChange(normalizedPageNumber);
    }
  };

  const handleJumpChange = (event: ChangeEvent<HTMLInputElement>) => {
    setJumpPageValue(event.target.value.replace(/[^0-9]/g, ""));
  };

  const handleJumpKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }
    const jumpPageNumber = Number(jumpPageValue);
    if (Number.isFinite(jumpPageNumber) && jumpPageNumber > 0) {
      changePage(jumpPageNumber);
      setJumpPageValue("");
    }
  };

  return (
    <nav
      aria-label="分页"
      className={cx("cx-theme", "cx-pagination", className)}
    >
      {totalLabel ? <span className="cx-pagination__summary">{totalLabel}</span> : null}
      <span className="cx-pagination__pages">
        <button
          aria-label="上一页"
          className="cx-pagination__button"
          disabled={normalizedCurrentPage <= 1 || pageTokenList.length === 0}
          onClick={() => changePage(normalizedCurrentPage - 1)}
          type="button"
        >
          ‹
        </button>
        {pageTokenList.map((pageToken) =>
          typeof pageToken === "number" ? (
            <button
              aria-current={pageToken === normalizedCurrentPage ? "page" : undefined}
              aria-label={`第 ${pageToken} 页`}
              className={cx(
                "cx-pagination__button",
                pageToken === normalizedCurrentPage && "cx-pagination__button--current",
              )}
              key={pageToken}
              onClick={() => changePage(pageToken)}
              type="button"
            >
              {pageToken}
            </button>
          ) : (
            <span className="cx-pagination__ellipsis" key={pageToken}>
              …
            </span>
          ),
        )}
        <button
          aria-label="下一页"
          className="cx-pagination__button"
          disabled={
            normalizedCurrentPage >= Math.max(1, Math.floor(pageCount)) ||
            pageTokenList.length === 0
          }
          onClick={() => changePage(normalizedCurrentPage + 1)}
          type="button"
        >
          ›
        </button>
      </span>
      {showPageSize ? (
        <label className="cx-pagination__page-size">
          <span>{pageSizeLabel}</span>
          <select
            aria-label={pageSizeLabel}
            className="cx-pagination__page-size-control"
            onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
            value={pageSize ?? pageSizeOptionList[0] ?? ""}
          >
            {pageSizeOptionList.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {showJumpTo ? (
        <label className="cx-pagination__jump">
          <span>{jumpToLabel}</span>
          <input
            aria-label={jumpToLabel}
            className="cx-pagination__jump-input"
            inputMode="numeric"
            onChange={handleJumpChange}
            onKeyDown={handleJumpKeyDown}
            value={jumpPageValue}
          />
        </label>
      ) : null}
    </nav>
  );
}
