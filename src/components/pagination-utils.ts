/** 分页器中可渲染的页码或省略号。 */
export type CxPaginationPageToken = number | "ellipsis-start" | "ellipsis-end";

/** 按首尾页与当前页邻近范围生成页码单元。 */
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

  const visiblePageNumbers = new Set([
    1,
    2,
    3,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    normalizedPageCount - 2,
    normalizedPageCount - 1,
    normalizedPageCount,
  ]);
  const sortedPageNumbers = [...visiblePageNumbers]
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= normalizedPageCount)
    .sort((firstPageNumber, secondPageNumber) => firstPageNumber - secondPageNumber);
  const pageTokens: CxPaginationPageToken[] = [];

  for (let pageIndex = 0; pageIndex < sortedPageNumbers.length; pageIndex += 1) {
    const pageNumber = sortedPageNumbers[pageIndex];
    if (pageNumber === undefined) {
      continue;
    }
    const previousPageNumber = sortedPageNumbers[pageIndex - 1];
    if (previousPageNumber !== undefined) {
      const missingPageCount = pageNumber - previousPageNumber - 1;
      if (missingPageCount === 1) {
        pageTokens.push(previousPageNumber + 1);
      } else if (missingPageCount >= 2) {
        pageTokens.push(
          pageNumber < currentPage ? "ellipsis-start" : "ellipsis-end",
        );
      }
    }
    pageTokens.push(pageNumber);
  }

  return pageTokens;
}
