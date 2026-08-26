import assert from "node:assert/strict";
import test from "node:test";

import { buildPageTokenList } from "../src/components/pagination-utils";

test("pagination keeps every page when the page count is short", () => {
  assert.deepEqual(buildPageTokenList(2, 5), [1, 2, 3, 4, 5]);
});

test("pagination uses semantic ellipsis tokens for long ranges", () => {
  assert.deepEqual(buildPageTokenList(5, 12), [1, "ellipsis-start", 5, "ellipsis-end", 12]);
  assert.deepEqual(buildPageTokenList(2, 12), [1, 2, 3, "ellipsis-end", 12]);
  assert.deepEqual(buildPageTokenList(11, 12), [1, "ellipsis-start", 10, 11, 12]);
});

test("pagination normalizes invalid page inputs", () => {
  assert.deepEqual(buildPageTokenList(0, 0), [1]);
  assert.deepEqual(buildPageTokenList(0, 2), [1, 2]);
  assert.deepEqual(buildPageTokenList(99, 2), [1, 2]);
});
