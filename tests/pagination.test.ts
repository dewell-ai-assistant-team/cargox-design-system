import assert from "node:assert/strict";
import test from "node:test";

import { buildPageTokenList } from "../src/components/pagination-utils";

test("pagination keeps every page when the page count is at most seven", () => {
  for (let pageCount = 1; pageCount <= 7; pageCount += 1) {
    for (let currentPage = 1; currentPage <= pageCount; currentPage += 1) {
      assert.deepEqual(
        buildPageTokenList(currentPage, pageCount),
        Array.from({ length: pageCount }, (_, pageIndex) => pageIndex + 1),
      );
    }
  }
});

test("pagination matches the screenshot windows at the leading, middle, and trailing pages", () => {
  assert.deepEqual(
    buildPageTokenList(3, 73),
    [1, 2, 3, 4, "ellipsis-end", 72, 73],
  );
  assert.deepEqual(
    buildPageTokenList(4, 73),
    [1, 2, 3, 4, 5, "ellipsis-end", 73],
  );
  assert.deepEqual(
    buildPageTokenList(5, 73),
    [1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 73],
  );
  assert.deepEqual(
    buildPageTokenList(71, 73),
    [1, 2, "ellipsis-start", 70, 71, 72, 73],
  );
  assert.deepEqual(
    buildPageTokenList(72, 73),
    [1, 2, 3, "ellipsis-start", 71, 72, 73],
  );
  assert.deepEqual(
    buildPageTokenList(73, 73),
    [1, 2, 3, "ellipsis-start", 71, 72, 73],
  );
});

test("pagination keeps seven unique ordered tokens and mirrors both ends across every page", () => {
  for (let pageCount = 8; pageCount <= 73; pageCount += 1) {
    for (let currentPage = 1; currentPage <= pageCount; currentPage += 1) {
      const pageTokens = buildPageTokenList(currentPage, pageCount);
      const visiblePages = pageTokens.filter(
        (pageToken): pageToken is number => typeof pageToken === "number",
      );
      const mirroredPageTokens = [...pageTokens].reverse().map((pageToken) => {
        if (typeof pageToken === "number") {
          return pageCount + 1 - pageToken;
        }
        return pageToken === "ellipsis-start" ? "ellipsis-end" : "ellipsis-start";
      });

      assert.equal(pageTokens.length, 7);
      assert.equal(new Set(pageTokens).size, 7);
      assert.ok(visiblePages.includes(currentPage));
      assert.equal(visiblePages[0], 1);
      assert.equal(visiblePages[visiblePages.length - 1], pageCount);
      assert.deepEqual(visiblePages, [...visiblePages].sort((a, b) => a - b));
      assert.deepEqual(
        buildPageTokenList(pageCount + 1 - currentPage, pageCount),
        mirroredPageTokens,
      );
    }
  }
});

test("pagination normalizes invalid page inputs", () => {
  assert.deepEqual(buildPageTokenList(0, 0), [1]);
  assert.deepEqual(buildPageTokenList(0, 2), [1, 2]);
  assert.deepEqual(buildPageTokenList(99, 2), [1, 2]);
  assert.deepEqual(buildPageTokenList(0, 73), buildPageTokenList(1, 73));
  assert.deepEqual(buildPageTokenList(99, 73), buildPageTokenList(73, 73));
});
