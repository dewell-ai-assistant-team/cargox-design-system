import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iconDirectory = resolve(packageDirectory, "src/assets/icons");

const originalIconViewBox = new Map([
  ["checkbox-checkmark.svg", "0 0 8.50002 7.00002"],
  ["switch-toggle-active.svg", "0 0 40 20"],
  ["switch-toggle-disabled.svg", "0 0 40 20"],
  ["switch-toggle-rest.svg", "0 0 40 20"],
  ["pagination-chevron-down.svg", "0 0 8 4.5"],
  ["pagination-chevron-left.svg", "0 0 4.5 8"],
  ["pagination-chevron-right.svg", "0 0 4.5 8"],
  ["sort-rest.svg", "0 0 10.7 9.2"],
  ["sort-up.svg", "0 0 5.45 9.2"],
  ["columns-more-vertical.svg", "0 0 2.5 10.5"],
  ["columns-action-freeze.svg", "0 0 12 12"],
]);

test("fsense baseline SVG assets are copied without approximations", async () => {
  for (const [fileName, viewBox] of originalIconViewBox) {
    const svg = await readFile(resolve(iconDirectory, fileName), "utf8");
    assert.match(svg, new RegExp(`viewBox="${viewBox}"`));
    assert.match(svg, /^<svg\s/);
  }
});

test("controls render the original SVG resources", async () => {
  const checkboxSource = await readFile(
    resolve(packageDirectory, "src/components/Checkbox.tsx"),
    "utf8",
  );
  const switchSource = await readFile(
    resolve(packageDirectory, "src/components/Switch.tsx"),
    "utf8",
  );
  const paginationSource = await readFile(
    resolve(packageDirectory, "src/components/Pagination.tsx"),
    "utf8",
  );
  assert.match(checkboxSource, /checkbox-checkmark\.svg/);
  assert.match(checkboxSource, /<img/);
  assert.match(switchSource, /switch-toggle-(active|disabled|rest)\.svg/);
  assert.match(switchSource, /<img/);
  assert.match(paginationSource, /pagination-chevron-(down|left|right)\.svg/);
  assert.match(paginationSource, /<img/);
  assert.doesNotMatch(checkboxSource, />✓</);
  assert.doesNotMatch(switchSource, /cx-switch__track|cx-switch__thumb/);
});
