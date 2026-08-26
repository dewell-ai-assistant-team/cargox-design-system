import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("component stylesheet avoids global selectors and reset rules", async () => {
  const css = await readFile(resolve(packageDirectory, "src/styles/components.css"), "utf8");
  assert.doesNotMatch(css, /(^|\n)\s*:root\s*[,\{]/);
  assert.doesNotMatch(css, /(^|\n)\s*(?:html|body|\*)\s*[,\{]/);
  assert.doesNotMatch(css, /\b(?:margin|padding|box-sizing)\s*:\s*0\s*;\s*\/\* reset/i);
  assert.match(css, /\.cx-button/);
  assert.match(css, /\.cx-data-table/);
});

test("component dimensions match the Figma size contracts", async () => {
  const css = await readFile(resolve(packageDirectory, "src/styles/components.css"), "utf8");
  for (const [selector, height] of [
    ["cx-button--xs", "24px"],
    ["cx-button--sm", "28px"],
    ["cx-button--base", "32px"],
    ["cx-button--medium-large", "36px"],
    ["cx-button--large", "40px"],
    ["cx-input--small", "28px"],
    ["cx-input--medium", "32px"],
    ["cx-input--large", "36px"],
    ["cx-select-trigger--small", "28px"],
    ["cx-select-trigger--medium", "32px"],
    ["cx-select-trigger--large", "36px"],
  ] as const) {
    assert.match(css, new RegExp(`\\.${selector}[^\\{]*\\{[\\s\\S]*?height: ${height};`));
  }
  assert.match(css, /\.cx-pagination[^\{]*\{[\s\S]*?height: var\(--cx-component-pagination-height\);/);
  assert.match(css, /\.cx-pagination__page-button[^\{]*,[\s\S]*?height: 22px;/);
});

test("Switch icon dimensions stay pixel-based at both sizes", async () => {
  const css = await readFile(resolve(packageDirectory, "src/styles/components.css"), "utf8");

  assert.match(
    css,
    /\.cx-switch__icon\s*\{\s*display: block;\s*height: 20px;\s*width: 40px;\s*\}/,
  );
  assert.match(
    css,
    /\.cx-switch--compact \.cx-switch__icon\s*\{\s*height: 16px;\s*width: 32px;\s*\}/,
  );
  assert.doesNotMatch(css, /\.cx-switch__icon[^}]*\b(?:height|width):\s*100%;/);
});

test("styles.css declares the Tailwind v4 and CargoX layer contract", async () => {
  const css = await readFile(resolve(packageDirectory, "src/styles/styles.css"), "utf8");

  assert.match(
    css,
    /@layer\s+theme,\s*base,\s*components,\s*cargox-tokens,\s*cargox-components,\s*utilities\s*;/,
  );
  assert.match(css, /@import "\.\/tokens\.css" layer\(cargox-tokens\);/);
  assert.match(css, /@import "\.\/components\.css" layer\(cargox-components\);/);
  assert.match(css, /@import "\.\/fsense-compat\.css" layer\(cargox-tokens\);/);
});
