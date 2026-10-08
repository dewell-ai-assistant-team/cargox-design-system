import assert from "node:assert/strict";
import test from "node:test";

import { buildPageTokenList } from "../src/components/pagination-utils";

test("pagination keeps every page when the page count is at most six", () => {
  for (let pageCount = 1; pageCount <= 6; pageCount += 1) {
    for (let currentPage = 1; currentPage <= pageCount; currentPage += 1) {
      assert.deepEqual(
        buildPageTokenList(currentPage, pageCount),
        Array.from({ length: pageCount }, (_, pageIndex) => pageIndex + 1),
      );
    }
  }
});

test("pagination rolls a three-page window and keeps the final three pages", () => {
  assert.deepEqual(buildPageTokenList(1, 15), [1, 2, 3, "ellipsis-end", 13, 14, 15]);
  assert.deepEqual(buildPageTokenList(4, 15), [3, 4, 5, "ellipsis-end", 13, 14, 15]);
  assert.deepEqual(buildPageTokenList(7, 15), [6, 7, 8, "ellipsis-end", 13, 14, 15]);
  assert.deepEqual(buildPageTokenList(13, 15), [12, 13, 14, 15]);
  assert.deepEqual(buildPageTokenList(14, 15), [13, 14, 15]);
  assert.deepEqual(buildPageTokenList(15, 15), [13, 14, 15]);
});

test("pagination marks any gap before the final block, including a single omitted page", () => {
  assert.deepEqual(buildPageTokenList(5, 10), [4, 5, 6, "ellipsis-end", 8, 9, 10]);
  assert.deepEqual(buildPageTokenList(3, 7), [2, 3, 4, 5, 6, 7]);
  assert.deepEqual(buildPageTokenList(1, 7), [1, 2, 3, "ellipsis-end", 5, 6, 7]);
});

test("pagination sweep keeps the rolling window, current page, and final three within six numbers", () => {
  for (let currentPage = 1; currentPage <= 15; currentPage += 1) {
    const pageTokens = buildPageTokenList(currentPage, 15);
    const visiblePages = pageTokens.filter(
      (pageToken): pageToken is number => typeof pageToken === "number",
    );
    const rollingPageStart = Math.max(1, Math.min(currentPage - 1, 13));
    const rollingPageEnd = rollingPageStart + 2;

    assert.ok(visiblePages.length <= 6);
    assert.ok(visiblePages.includes(currentPage));
    assert.ok(visiblePages.includes(rollingPageStart));
    assert.ok(visiblePages.includes(rollingPageStart + 1));
    assert.ok(visiblePages.includes(rollingPageEnd));
    assert.deepEqual(visiblePages.slice(-3), [13, 14, 15]);
    assert.equal(pageTokens.includes("ellipsis-start"), false);
    assert.equal(pageTokens.includes("ellipsis-end"), rollingPageEnd < 12);
  }
});

test("pagination normalizes invalid page inputs", () => {
  assert.deepEqual(buildPageTokenList(0, 0), [1]);
  assert.deepEqual(buildPageTokenList(0, 2), [1, 2]);
  assert.deepEqual(buildPageTokenList(99, 2), [1, 2]);
});
