import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const distributionSource = await readFile(
  new URL("../dist/index.js", import.meta.url),
  "utf8",
);

assert.doesNotMatch(distributionSource, /Calling `require` for/);
assert.doesNotMatch(distributionSource, /node_modules\/react\/cjs/);
assert.match(distributionSource, /from "react\/jsx-runtime"/);
