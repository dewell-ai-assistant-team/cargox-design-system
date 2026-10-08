import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import paginationChevronDownIcon from "../assets/icons/pagination-chevron-down.svg";
import paginationChevronLeftIcon from "../assets/icons/pagination-chevron-left.svg";
import paginationChevronRightIcon from "../assets/icons/pagination-chevron-right.svg";
import { cx } from "../utils";
import { buildPageTokenList } from "./pagination-utils";

export { buildPageTokenList, type CxPaginationPageToken } from "./pagination-utils";

/** CargoX Pagination 的展示模式。 */
export type CxPaginationVariant = "full" | "no-page-size" | "basic";

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
  /** 展示模式；未指定时沿用旧 showPageSize/showJumpTo/pageSizeLabel 属性。 */
  variant?: CxPaginationVariant;
  /** 是否展示页大小选择器。提供 fsense 页大小属性时也会自动展示。 */
  showPageSize?: boolean;
  /** 页大小选项，默认 [10, 20, 50]。 */
  pageSizeOptionList?: number[];
  /** 当前页大小。 */
  pageSize?: number;
  /** 页大小变化回调。 */
  onPageSizeChange?: (pageSize: number) => void;
  /** 是否展示跳页输入框。 */
  showJumpTo?: boolean;
  /** 跳页输入框前的文案。 */
  jumpToLabel?: string;
  /** 页大小按钮文案，例如 `20/Page`。 */
  pageSizeLabel?: string;
  /** 页面根节点的额外类名。 */
  className?: string;
}

/** CargoX 分页器，以 fsense 的页码、菜单和跳页行为为运行时基线。 */
export function Pagination({
  className,
  currentPageNumber,
  jumpToLabel = "Go to",
  onPageChange,
  onPageSizeChange,
  pageCount,
  pageSize,
  pageSizeLabel,
  pageSizeOptionList = [10, 20, 50],
  showJumpTo = false,
  showPageSize = false,
  totalLabel,
  variant,
}: CxPaginationProps) {
  const normalizedPageCount = Math.max(1, Math.floor(pageCount));
  const normalizedCurrentPage = Math.min(
    normalizedPageCount,
    Math.max(1, Math.floor(currentPageNumber)),
  );
  const [jumpPageValue, setJumpPageValue] = useState(String(normalizedCurrentPage));
  const [isPageSizeMenuOpen, setIsPageSizeMenuOpen] = useState(false);
  const pageSizeMenuRef = useRef<HTMLDivElement>(null);
  const pageTokenList = useMemo(
    () => buildPageTokenList(normalizedCurrentPage, normalizedPageCount),
    [normalizedCurrentPage, normalizedPageCount],
  );
  const canChoosePageSize = pageSizeOptionList.length > 0 && Boolean(onPageSizeChange);
  const shouldShowPageSize =
    variant === undefined
      ? showPageSize || Boolean(pageSizeLabel)
      : variant === "full";
  const shouldShowJumpTo =
    variant === undefined
      ? showJumpTo
      : variant === "full" || variant === "no-page-size";
  const currentPageSize = pageSize ?? Number.parseInt(pageSizeLabel ?? "", 10);

  useEffect(() => {
    setJumpPageValue(String(normalizedCurrentPage));
  }, [normalizedCurrentPage]);

  useEffect(() => {
    function dismissPageSizeMenu(event: MouseEvent): void {
      if (!pageSizeMenuRef.current?.contains(event.target as Node)) {
        setIsPageSizeMenuOpen(false);
      }
    }
    function dismissOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsPageSizeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", dismissPageSizeMenu);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("mousedown", dismissPageSizeMenu);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, []);

  function changePage(nextPageNumber: number): void {
    const normalizedNextPage = Math.min(
      normalizedPageCount,
      Math.max(1, Math.floor(nextPageNumber)),
    );
    if (normalizedNextPage !== normalizedCurrentPage) {
      onPageChange(normalizedNextPage);
    }
  }

  function submitJumpPage(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const requestedPageNumber = Number.parseInt(jumpPageValue, 10);
    if (requestedPageNumber >= 1 && requestedPageNumber <= normalizedPageCount) {
      changePage(requestedPageNumber);
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className={cx("cx-theme", "cx-pagination", className)}
    >
      <div className="cx-pagination__summary-group">
        {totalLabel ? <span className="cx-pagination__summary">{totalLabel}</span> : null}
        {shouldShowPageSize ? (
          <div className="cx-pagination__page-size" ref={pageSizeMenuRef}>
            <button
              aria-expanded={canChoosePageSize && isPageSizeMenuOpen}
              aria-haspopup="menu"
              aria-label="Page size"
              className="cx-pagination__page-size-button"
              disabled={!canChoosePageSize}
              onClick={() => setIsPageSizeMenuOpen((isOpen) => !isOpen)}
              type="button"
            >
              <span>{pageSizeLabel ?? `${pageSize ?? pageSizeOptionList[0] ?? ""}/Page`}</span>
              <img alt="" aria-hidden="true" src={paginationChevronDownIcon} />
            </button>
            {isPageSizeMenuOpen && canChoosePageSize ? (
              <div className="cx-pagination__page-size-menu" role="menu">
                {pageSizeOptionList.map((pageSizeOption) => (
                  <button
                    aria-current={pageSizeOption === currentPageSize ? "true" : undefined}
                    className="cx-pagination__page-size-option"
                    key={pageSizeOption}
                    onClick={() => {
                      onPageSizeChange?.(pageSizeOption);
                      setIsPageSizeMenuOpen(false);
                    }}
                    role="menuitem"
                    type="button"
                  >
                    {pageSizeOption}/Page
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="cx-pagination__pages">
        <button
          aria-label="Previous page"
          className="cx-pagination__nav-button"
          disabled={normalizedCurrentPage <= 1}
          onClick={() => changePage(normalizedCurrentPage - 1)}
          type="button"
        >
          <img alt="" aria-hidden="true" src={paginationChevronLeftIcon} />
        </button>
        <div className="cx-pagination__page-list">
          {pageTokenList.map((pageToken) =>
            typeof pageToken === "number" ? (
              <button
                aria-current={pageToken === normalizedCurrentPage ? "page" : undefined}
                aria-label={`第 ${pageToken} 页`}
                className={cx(
                  "cx-pagination__page-button",
                  pageToken === normalizedCurrentPage &&
                    "cx-pagination__page-button--current",
                )}
                key={pageToken}
                onClick={() => changePage(pageToken)}
                type="button"
              >
                {pageToken}
              </button>
            ) : (
              <span className="cx-pagination__ellipsis" key={pageToken}>...</span>
            ),
          )}
        </div>
        <button
          aria-label="Next page"
          className="cx-pagination__nav-button"
          disabled={normalizedCurrentPage >= normalizedPageCount}
          onClick={() => changePage(normalizedCurrentPage + 1)}
          type="button"
        >
          <img alt="" aria-hidden="true" src={paginationChevronRightIcon} />
        </button>
      </div>

      {shouldShowJumpTo ? (
        <form className="cx-pagination__jump" onSubmit={submitJumpPage}>
          <label htmlFor="cx-pagination-go-to-page">{jumpToLabel}</label>
          <input
            aria-label={jumpToLabel}
            className="cx-pagination__jump-input"
            id="cx-pagination-go-to-page"
            inputMode="numeric"
            onChange={(event) => setJumpPageValue(event.target.value)}
            value={jumpPageValue}
          />
        </form>
      ) : null}
    </nav>
  );
}
