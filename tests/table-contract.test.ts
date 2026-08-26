import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  DATA_TABLE_CHECKBOX_COLUMN_WIDTH,
  DATA_TABLE_DEFAULT_COLUMN_WIDTH,
  DATA_TABLE_HEADER_HEIGHT,
  DATA_TABLE_MIN_COLUMN_WIDTH,
  DATA_TABLE_ROW_HEIGHT,
  resolveDataTableColumnWidth,
} from "../src/components/DataTable";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("DataTable exposes the Figma geometry contract", () => {
  assert.equal(DATA_TABLE_HEADER_HEIGHT, 44);
  assert.equal(DATA_TABLE_ROW_HEIGHT, 40);
  assert.equal(DATA_TABLE_CHECKBOX_COLUMN_WIDTH, 44);
  assert.equal(DATA_TABLE_MIN_COLUMN_WIDTH, 120);
  assert.equal(DATA_TABLE_DEFAULT_COLUMN_WIDTH, 200);
});

test("DataTable initial widths honor per-column minimum widths", () => {
  assert.equal(resolveDataTableColumnWidth(100, 180, 200), 180);
  assert.equal(resolveDataTableColumnWidth(undefined, 180, 100), 180);
  assert.equal(resolveDataTableColumnWidth(140, undefined, 100), 140);
  assert.equal(resolveDataTableColumnWidth(undefined, undefined, 100), 120);
});

test("DataTable source contains the generic interaction boundaries", async () => {
  const source = await readFile(
    resolve(packageDirectory, "src/components/DataTable.tsx"),
    "utf8",
  );
  for (const requiredSource of [
    "indeterminate",
    "nextSortState",
    "onPointerDown",
    "ArrowLeft",
    "resolveDataTableColumnWidth",
    "cx-data-table__sticky",
    "loading",
    "toolbar",
    "footer",
    "renderCell",
  ]) {
    assert.match(source, new RegExp(requiredSource));
  }
  assert.doesNotMatch(source, /import\s+.*DocRunRecordRow|localStorage/);
});
