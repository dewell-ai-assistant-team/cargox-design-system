import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("fsense compatibility aliases stay scoped and reference CargoX tokens", async () => {
  const compatibilityCss = await readFile(
    resolve(packageDirectory, "src/styles/fsense-compat.css"),
    "utf8",
  );
  const aliasDeclarationList = Array.from(
    compatibilityCss.matchAll(/^\s*(--[\w-]+)\s*:\s*var\((--cx-[\w-]+)\);/gm),
  );

  assert.ok(aliasDeclarationList.length >= 51);
  assert.match(compatibilityCss, /\.cx-theme/);
  assert.match(compatibilityCss, /\[data-cx-theme\]/);
  assert.doesNotMatch(compatibilityCss, /(^|\n)\s*:root\s*[,\{]/);
  assert.match(
    compatibilityCss,
    /--background-canvas-brand:\s*var\(--cx-background-canvas-brand\)/,
  );
  assert.match(
    compatibilityCss,
    /--space-12:\s*var\(--cx-space-size-12\)/,
  );
  assert.match(
    compatibilityCss,
    /--radius-sm:\s*var\(--cx-radius-rounded-sm\)/,
  );
});
