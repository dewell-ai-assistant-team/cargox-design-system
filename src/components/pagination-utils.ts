/** 分页器中可渲染的页码或省略号。 */
export type CxPaginationPageToken = number | "ellipsis-start" | "ellipsis-end";

/** 按 fsense 已验证规则生成最多五个页码单元。 */
export function buildPageTokenList(
  currentPageNumber: number,
  pageCount: number,
): CxPaginationPageToken[] {
  const normalizedPageCount = Math.max(1, Math.floor(pageCount));
  const currentPage = Math.min(
    normalizedPageCount,
    Math.max(1, Math.floor(currentPageNumber)),
  );
  if (normalizedPageCount <= 5) {
    return Array.from({ length: normalizedPageCount }, (_, pageIndex) => pageIndex + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis-end", normalizedPageCount];
  }
  if (currentPage >= normalizedPageCount - 2) {
    return [
      1,
      "ellipsis-start",
      normalizedPageCount - 2,
      normalizedPageCount - 1,
      normalizedPageCount,
    ];
  }
  return [1, "ellipsis-start", currentPage, "ellipsis-end", normalizedPageCount];
}
