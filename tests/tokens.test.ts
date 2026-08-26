import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("Figma token manifest preserves the audited source vocabulary", async () => {
  const manifestText = await readFile(
    resolve(packageDirectory, "figma-token-manifest.json"),
    "utf8",
  );
  const tokensCss = await readFile(
    resolve(packageDirectory, "src/styles/tokens.css"),
    "utf8",
  );
  const manifest = JSON.parse(manifestText) as {
    source: { fileKey: string; componentGalleryNode: string };
    variables: Array<{
      name: string;
      cssVariable: string;
      value: string;
    }>;
  };

  assert.equal(manifest.source.fileKey, "keekWo6ygLKQQw1eNrQYP5");
  assert.equal(manifest.source.componentGalleryNode, "5:778");
  assert.ok(manifest.variables.length >= 130);
  assert.ok(manifest.variables.some((token) => token.name === "Content/Boby/Primary"));
  assert.ok(
    manifest.variables.some(
      (token) =>
        token.name === "Background/Table/Headercell-Primary" &&
        token.value === "#f7f7f7",
    ),
  );
  assert.ok(
    manifest.variables.some(
      (token) => token.name === "Component/Table/Header Height" && token.value === "44px",
    ),
  );
  assert.ok(
    manifest.variables.every((token) => token.cssVariable.startsWith("--cx-")),
  );
  const declaredCssVariableSet = new Set(
    Array.from(tokensCss.matchAll(/^\s*(--cx-[\w-]+)\s*:/gm), (match) => match[1]),
  );
  for (const token of manifest.variables) {
    assert.ok(
      declaredCssVariableSet.has(token.cssVariable),
      `${token.cssVariable} is missing from src/styles/tokens.css`,
    );
  }
});

test("tokens are scoped and do not reset host application styles", async () => {
  const tokensCss = await readFile(
    resolve(packageDirectory, "src/styles/tokens.css"),
    "utf8",
  );
  assert.match(tokensCss, /\.cx-theme/);
  assert.match(tokensCss, /\[data-cx-theme\]/);
  assert.doesNotMatch(tokensCss, /(^|\n)\s*:root\s*[,\{]/);
  assert.doesNotMatch(tokensCss, /(^|\n)\s*(?:html|body|\*)\s*[,\{]/);
});
