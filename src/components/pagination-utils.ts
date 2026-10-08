/** 分页器中可渲染的页码或省略号。 */
export type CxPaginationPageToken = number | "ellipsis-start" | "ellipsis-end";

/** 按当前页位置生成最多七个页码单元。 */
export function buildPageTokenList(
  currentPageNumber: number,
  pageCount: number,
): CxPaginationPageToken[] {
  const normalizedPageCount = Math.max(1, Math.floor(pageCount));
  const currentPage = Math.min(
    normalizedPageCount,
    Math.max(1, Math.floor(currentPageNumber)),
  );
  if (normalizedPageCount <= 7) {
    return Array.from({ length: normalizedPageCount }, (_, pageIndex) => pageIndex + 1);
  }

  if (currentPage <= 4) {
    const leadingCount = Math.max(3, currentPage + 1);
    const trailingCount = 6 - leadingCount;
    const pageTokens: CxPaginationPageToken[] = Array.from(
      { length: leadingCount },
      (_, pageIndex) => pageIndex + 1,
    );
    pageTokens.push("ellipsis-end");
    for (
      let pageNumber = normalizedPageCount - trailingCount + 1;
      pageNumber <= normalizedPageCount;
      pageNumber += 1
    ) {
      pageTokens.push(pageNumber);
    }
    return pageTokens;
  }

  if (currentPage >= normalizedPageCount - 3) {
    const trailingCount = Math.max(3, normalizedPageCount - currentPage + 2);
    const leadingCount = 6 - trailingCount;
    const pageTokens: CxPaginationPageToken[] = Array.from(
      { length: leadingCount },
      (_, pageIndex) => pageIndex + 1,
    );
    pageTokens.push("ellipsis-start");
    for (
      let pageNumber = normalizedPageCount - trailingCount + 1;
      pageNumber <= normalizedPageCount;
      pageNumber += 1
    ) {
      pageTokens.push(pageNumber);
    }
    return pageTokens;
  }

  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    normalizedPageCount,
  ];
}
