import assert from "node:assert/strict";
import test from "node:test";

import { buildPageTokenList } from "../src/components/pagination-utils";

test("pagination keeps every page when the page count is at most seven", () => {
  for (let pageCount = 1; pageCount <= 7; pageCount += 1) {
    assert.deepEqual(
      buildPageTokenList(Math.ceil(pageCount / 2), pageCount),
      Array.from({ length: pageCount }, (_, pageIndex) => pageIndex + 1),
    );
  }
});

test("pagination preserves three pages at both ends and follows the current page", () => {
  assert.deepEqual(buildPageTokenList(1, 15), [1, 2, 3, "ellipsis-end", 13, 14, 15]);
  assert.deepEqual(buildPageTokenList(3, 15), [1, 2, 3, 4, "ellipsis-end", 13, 14, 15]);
  assert.deepEqual(
    buildPageTokenList(7, 15),
    [1, 2, 3, "ellipsis-start", 6, 7, 8, "ellipsis-end", 13, 14, 15],
  );
  assert.deepEqual(
    buildPageTokenList(13, 15),
    [1, 2, 3, "ellipsis-start", 12, 13, 14, 15],
  );
  assert.deepEqual(
    buildPageTokenList(15, 15),
    [1, 2, 3, "ellipsis-start", 13, 14, 15],
  );
});

test("pagination fills a gap when only one page would be omitted", () => {
  assert.deepEqual(buildPageTokenList(5, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test("pagination keeps the current page and marks every larger gap across a page sweep", () => {
  for (let currentPage = 1; currentPage <= 15; currentPage += 1) {
    const pageTokens = buildPageTokenList(currentPage, 15);
    const visiblePages = pageTokens.filter(
      (pageToken): pageToken is number => typeof pageToken === "number",
    );
    assert.ok(visiblePages.includes(currentPage));
    assert.deepEqual(visiblePages.slice(0, 3), [1, 2, 3]);
    assert.deepEqual(visiblePages.slice(-3), [13, 14, 15]);

    for (let pageIndex = 1; pageIndex < visiblePages.length; pageIndex += 1) {
      const previousPage = visiblePages[pageIndex - 1];
      const nextPage = visiblePages[pageIndex];
      if (previousPage === undefined || nextPage === undefined) {
        continue;
      }
      const gapTokens = pageTokens.slice(
        pageTokens.indexOf(previousPage) + 1,
        pageTokens.indexOf(nextPage),
      );
      const missingPageCount = nextPage - previousPage - 1;

      if (missingPageCount === 0) {
        assert.deepEqual(gapTokens, []);
      } else if (missingPageCount === 1) {
        assert.deepEqual(gapTokens, [previousPage + 1]);
      } else {
        assert.deepEqual(
          gapTokens,
          [nextPage < currentPage ? "ellipsis-start" : "ellipsis-end"],
        );
      }
    }
  }
});

test("pagination normalizes invalid page inputs", () => {
  assert.deepEqual(buildPageTokenList(0, 0), [1]);
  assert.deepEqual(buildPageTokenList(0, 2), [1, 2]);
  assert.deepEqual(buildPageTokenList(99, 2), [1, 2]);
});
