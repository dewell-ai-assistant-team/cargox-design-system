import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("Select and SelectTrigger preserve the host-controlled native contract", async () => {
  const source = await readFile(
    resolve(packageDirectory, "src/components/Select.tsx"),
    "utf8",
  );
  const publicExports = await readFile(
    resolve(packageDirectory, "src/components/index.ts"),
    "utf8",
  );

  assert.match(source, /forwardRef<HTMLDivElement, CxSelectProps>/);
  assert.match(source, /<div[\s\S]*className={cx\("cx-theme", "cx-select", className\)}/);
  assert.match(source, /forwardRef<[\s\S]*HTMLButtonElement,\s*CxSelectTriggerProps\s*>/);
  assert.match(source, /<button[\s\S]*className={cx\([\s\S]*"cx-select-trigger"/);
  assert.match(source, /type = "button"/);
  assert.match(source, /disabled = false/);
  assert.match(source, /`cx-select-trigger--\$\{size\}`/);
  assert.match(source, /`cx-select-trigger--\$\{stateClassName\}`/);
  assert.match(source, /disabled={disabled}/);
  assert.match(source, /\{children\}/);
  assert.match(source, /aria-expanded|aria-haspopup/);
  assert.doesNotMatch(source, /document-station-input|cx-input/);
  assert.match(publicExports, /export \* from "\.\/Select";/);
});

test("SelectTrigger CSS keeps independent dimensions and interaction states", async () => {
  const css = await readFile(
    resolve(packageDirectory, "src/styles/components.css"),
    "utf8",
  );

  assert.match(css, /\.cx-select\s*\{[\s\S]*?box-sizing: border-box;[\s\S]*?min-width: 0;/);
  assert.match(
    css,
    /\.cx-select-trigger\s*\{[\s\S]*?align-items: center;[\s\S]*?display: inline-flex;[\s\S]*?gap: var\(--cx-space-size-4\);/,
  );
  assert.match(css, /\.cx-select-trigger\s*\{[\s\S]*?border: 1px solid var\(--cx-border-tertiary\);/);
  assert.match(css, /\.cx-select-trigger\s*\{[\s\S]*?background: var\(--cx-background-inputs-default\);[\s\S]*?color: var\(--cx-content-body-primary\);/);

  for (const [size, height, padding, fontSize, lineHeight] of [
    ["small", "28px", "6px var(--cx-space-size-8)", "200", "200"],
    ["medium", "32px", "6px var(--cx-space-size-10)", "300", "300"],
    ["large", "36px", "var(--cx-space-size-8) var(--cx-space-size-12)", "300", "300"],
  ] as const) {
    assert.match(
      css,
      new RegExp(
        `\\.cx-select-trigger--${size}\\s*\\{[\\s\\S]*?height: ${height};[\\s\\S]*?padding: ${padding.replace(/[()]/g, "\\$&")};[\\s\\S]*?font-size: var\\(--cx-typography-font-size-${fontSize}\\);[\\s\\S]*?line-height: var\\(--cx-typography-line-space-${lineHeight}\\);`,
      ),
    );
  }

  assert.match(css, /\.cx-select-trigger--default:hover:not\(:disabled\)[\s\S]*?border-color: var\(--cx-border-secondary\);/);
  assert.match(css, /\.cx-select-trigger--default:focus,[\s\S]*?\.cx-select-trigger--default:focus-visible[\s\S]*?border-color: var\(--cx-border-extensions-info\);/);
  assert.match(css, /\.cx-select-trigger--error,[\s\S]*?border-color: var\(--cx-content-extensions-red\);/);
  assert.match(css, /\.cx-select-trigger--unavailable,[\s\S]*?background: var\(--cx-background-inputs-disable\);[\s\S]*?color: var\(--cx-content-body-tips\);[\s\S]*?cursor: not-allowed;/);
  assert.doesNotMatch(css, /!important/);
  assert.doesNotMatch(css, /document-station-input/);
  assert.doesNotMatch(css, /\.cx-select-trigger[^\{]*\.cx-input/);
});
