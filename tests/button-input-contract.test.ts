import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("Button exposes fsense values and normalizes legacy aliases", async () => {
  const source = await readFile(
    resolve(packageDirectory, "src/components/Button.tsx"),
    "utf8",
  );
  const css = await readFile(
    resolve(packageDirectory, "src/styles/components.css"),
    "utf8",
  );

  assert.match(source, /"medium-large"[\s\S]*"large"/);
  assert.match(source, /mediumLarge:\s*"medium-large"/);
  assert.match(source, /lg:\s*"large"/);
  assert.match(source, /danger:\s*"danger-fill"/);
  assert.match(source, /brandOutline:\s*"brand-outline"/);
  assert.match(source, /end:\s*"start"/);
  assert.match(source, /`cx-button--\$\{normalizedSize\}`/);
  assert.match(source, /`cx-button--\$\{normalizedVariant\}`/);
  assert.match(source, /`cx-button--align-\$\{normalizedAlign\}`/);

  for (const legacyClass of [
    "mediumLarge",
    "lg",
    "danger",
    "brandOutline",
    "align-end",
  ]) {
    assert.doesNotMatch(css, new RegExp(`\\.cx-button--${legacyClass}(?:[.:,{]|$)`));
  }
});

test("Input keeps native DOM and normalizes the table-cell appearance", async () => {
  const source = await readFile(
    resolve(packageDirectory, "src/components/Input.tsx"),
    "utf8",
  );
  const css = await readFile(
    resolve(packageDirectory, "src/styles/components.css"),
    "utf8",
  );

  assert.match(source, /CxInputCanonicalAppearance\s*=\s*"default"\s*\|\s*"table-cell"/);
  assert.match(source, /tableCell:\s*"table-cell"/);
  assert.match(source, /return \(\s*<input/);
  assert.match(source, /`cx-input--\$\{stateClassName\}`/);
  assert.match(source, /`cx-input--appearance-\$\{inputAppearanceClass\[appearance\]\}`/);
  assert.doesNotMatch(source, /cx-input-shell|leadingIcon|trailingIcon/);
  assert.match(css, /\.cx-input--appearance-table-cell\s*\{/);
  assert.doesNotMatch(css, /\.cx-input-shell/);
});

test("Button and Input CSS retain fsense baseline spacing and state values", async () => {
  const css = await readFile(
    resolve(packageDirectory, "src/styles/components.css"),
    "utf8",
  );

  assert.match(css, /\.cx-button\s*\{[\s\S]*?gap: var\(--cx-space-size-4\);/);
  assert.match(css, /\.cx-button--sm\s*\{[\s\S]*?font-size: var\(--cx-typography-font-size-200\);/);
  assert.match(css, /\.cx-button--sm\s*\{[\s\S]*?line-height: var\(--cx-typography-line-space-200\);/);
  assert.match(css, /\.cx-input\s*\{[\s\S]*?min-width: 1px;/);
  assert.match(css, /\.cx-input--small\s*\{[\s\S]*?padding: 6px var\(--cx-space-size-8\);/);
  assert.match(css, /\.cx-input--medium\s*\{[\s\S]*?padding: 6px var\(--cx-space-size-10\);/);
  assert.match(css, /\.cx-input--large\s*\{[\s\S]*?padding: var\(--cx-space-size-8\) var\(--cx-space-size-12\);/);
  assert.match(css, /\.cx-input--large\s*\{[\s\S]*?font-size: var\(--cx-typography-font-size-300\);/);
  assert.match(css, /\.cx-input--large\s*\{[\s\S]*?line-height: var\(--cx-typography-line-space-300\);/);
  assert.match(css, /\.cx-input--unavailable\s*\{/);
  assert.match(css, /\.cx-input--read-only\s*\{/);
  assert.match(css, /\.cx-input\.cx-input--error/);
});
