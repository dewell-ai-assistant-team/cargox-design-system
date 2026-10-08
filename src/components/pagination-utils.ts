/** 分页器中可渲染的页码或省略号。 */
export type CxPaginationPageToken = number | "ellipsis-start" | "ellipsis-end";

/** 按当前滚动页码与末尾三页生成页码单元。 */
export function buildPageTokenList(
  currentPageNumber: number,
  pageCount: number,
): CxPaginationPageToken[] {
  const normalizedPageCount = Math.max(1, Math.floor(pageCount));
  const currentPage = Math.min(
    normalizedPageCount,
    Math.max(1, Math.floor(currentPageNumber)),
  );
  if (normalizedPageCount <= 6) {
    return Array.from({ length: normalizedPageCount }, (_, pageIndex) => pageIndex + 1);
  }

  const rollingPageStart = Math.max(
    1,
    Math.min(currentPage - 1, normalizedPageCount - 2),
  );
  const rollingPageEnd = rollingPageStart + 2;
  const lastPageStart = normalizedPageCount - 2;
  const pageTokens: CxPaginationPageToken[] = [];

  for (let pageNumber = rollingPageStart; pageNumber <= rollingPageEnd; pageNumber += 1) {
    pageTokens.push(pageNumber);
  }

  if (rollingPageEnd < lastPageStart - 1) {
    pageTokens.push("ellipsis-end");
  }

  for (
    let pageNumber = Math.max(lastPageStart, rollingPageEnd + 1);
    pageNumber <= normalizedPageCount;
    pageNumber += 1
  ) {
    pageTokens.push(pageNumber);
  }

  return pageTokens;
}
