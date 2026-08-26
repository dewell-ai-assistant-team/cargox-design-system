import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import type { IconButtonProps } from "../src/components/IconButton";
import type { SplitButtonTriggerProps } from "../src/components/SplitButton";

void ({ icon: null, "aria-label": "Open actions" } satisfies IconButtonProps);
void ({ icon: null, "aria-labelledby": "actions-label" } satisfies IconButtonProps);
// @ts-expect-error IconButton requires an accessible name.
void ({ icon: null } satisfies IconButtonProps);

void ({ "aria-label": "Open actions" } satisfies SplitButtonTriggerProps);
void ({ "aria-labelledby": "actions-label" } satisfies SplitButtonTriggerProps);
// @ts-expect-error SplitButtonTrigger requires an accessible name.
void ({} satisfies SplitButtonTriggerProps);

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const readSource = (path: string) =>
  readFile(resolve(packageDirectory, path), "utf8");

test("IconButton has two variants, native semantics, and an accessible-name type contract", async () => {
  const [source, exportsSource] = await Promise.all([
    readSource("src/components/IconButton.tsx"),
    readSource("src/components/index.ts"),
  ]);

  assert.match(source, /"brand-icon"\s*\|\s*"regular-icon"/);
  assert.match(source, /variant = "brand-icon"/);
  assert.match(source, /forwardRef<HTMLButtonElement/);
  assert.match(source, /type = "button"/);
  assert.match(source, /<button/);
  assert.match(source, /icon: ReactNode/);
  assert.match(source, /"aria-label": string; "aria-labelledby"\?: never/);
  assert.match(source, /"aria-label"\?: never; "aria-labelledby": string/);
  assert.match(source, /"children"/);
  assert.match(source, /aria-hidden="true"/);
  assert.match(exportsSource, /export \* from "\.\/IconButton"/);
});

test("IconButton and Button icon CSS retain exact geometry and state colors", async () => {
  const css = await readSource("src/styles/components.css");

  assert.match(css, /\.cx-icon-button\s*\{[\s\S]*?height: 24px;[\s\S]*?padding: 4px;[\s\S]*?width: 24px;/);
  assert.match(css, /\.cx-icon-button__icon\s*\{[\s\S]*?height: 16px;[\s\S]*?width: 16px;/);
  assert.match(css, /\.cx-icon-button__icon > img,[\s\S]*?\.cx-icon-button__icon > svg\s*\{[\s\S]*?height: 100%;[\s\S]*?width: 100%;/);
  assert.match(css, /\.cx-icon-button--brand-icon:hover:not\(:disabled\)[\s\S]*?var\(--cx-brand-50\)/);
  assert.match(css, /\.cx-icon-button--brand-icon:active:not\(:disabled\)[\s\S]*?var\(--cx-background-surface-extension-blue\)/);
  assert.match(css, /\.cx-icon-button--regular-icon\s*\{[\s\S]*?var\(--cx-border-primary\)/);
  assert.match(css, /\.cx-icon-button--regular-icon:hover:not\(:disabled\)[\s\S]*?var\(--cx-background-surface-secondary\)/);
  assert.match(css, /\.cx-icon-button--regular-icon:active:not\(:disabled\)[\s\S]*?var\(--cx-background-surface-tertiary\)/);
  assert.match(css, /\.cx-icon-button:disabled[\s\S]*?var\(--cx-background-inputs-disable\)[\s\S]*?var\(--cx-border-tertiary\)[\s\S]*?var\(--cx-content-body-tips\)/);
  assert.match(css, /\.cx-button--outline:hover:not\(:disabled\)[\s\S]*?var\(--cx-background-surface-secondary\)/);
  assert.match(css, /\.cx-button--brand-outline:hover:not\(:disabled\)[\s\S]*?var\(--cx-color-style-hover-state-buttons-brand-outline\)/);

  for (const [selector, size] of [
    ["xs", 16],
    ["sm", 16],
    ["base", 20],
    ["medium-large", 20],
    ["large", 24],
  ] as const) {
    assert.match(css, new RegExp(`\\.cx-button--${selector} \\.cx-button__icon[\\s\\S]*?(?:height|width): ${size}px;`));
  }
  assert.match(css, /\.cx-button__icon > img,[\s\S]*?\.cx-button__icon > svg/);
});

test("Button ml alias maps to medium-large without changing the default", async () => {
  const source = await readSource("src/components/Button.tsx");

  assert.match(source, /CxButtonSize[\s\S]*"ml"/);
  assert.match(source, /ml:\s*"medium-large"/);
  assert.match(source, /size = "base"/);
  assert.match(source, /"text"/);
});

test("SplitButton exports a native compound API and leaves menu ownership to the host", async () => {
  const [source, iconButtonSource, exportsSource] = await Promise.all([
    readSource("src/components/SplitButton.tsx"),
    readSource("src/components/IconButton.tsx"),
    readSource("src/components/index.ts"),
  ]);

  assert.match(exportsSource, /export \* from "\.\/SplitButton"/);
  for (const component of ["SplitButton", "SplitButtonAction", "SplitButtonTrigger"]) {
    assert.match(source, new RegExp(`export const ${component}`));
  }
  assert.equal(source.match(/<button/g)?.length, 2);
  assert.match(source, /role="group"/);
  assert.match(source, /forwardRef<\s*HTMLButtonElement,/);
  assert.match(source, /type = "button"/g);
  assert.match(source, /groupDisabled \|\| childDisabled/g);
  assert.match(source, /CxAccessibleButtonName/);
  assert.match(iconButtonSource, /"aria-label": string; "aria-labelledby"\?: never/);
  assert.match(iconButtonSource, /"aria-label"\?: never; "aria-labelledby": string/);
  assert.doesNotMatch(source, /role="menu"|createPortal|options\s*[=:]|setOpen|useState/);
  assert.match(source, /aria-haspopup|ButtonHTMLAttributes<HTMLButtonElement>/);
  assert.match(source, /aria-expanded|ButtonHTMLAttributes<HTMLButtonElement>/);
});

test("SplitButton CSS covers independent sizes, focus, variants, and disabled states", async () => {
  const css = await readSource("src/styles/components.css");

  assert.match(css, /\.cx-split-button--lg \.cx-split-button__action,[\s\S]*?height: 32px;/);
  assert.match(css, /\.cx-split-button--sm \.cx-split-button__action,[\s\S]*?height: 24px;/);
  assert.match(css, /\.cx-split-button--lg \.cx-split-button__action-icon[\s\S]*?height: 20px;/);
  assert.match(css, /\.cx-split-button--sm \.cx-split-button__action-icon[\s\S]*?height: 16px;/);
  assert.match(css, /\.cx-split-button__trigger-icon[\s\S]*?height: 12px;[\s\S]*?width: 12px;/);
  assert.match(css, /\.cx-split-button__action:focus-visible,[\s\S]*?0 0 0 2px var\(--cx-background-surface-primary\),[\s\S]*?0 0 0 4px var\(--cx-border-extensions-info\)/);
  assert.match(css, /\.cx-split-button\s*\{[\s\S]*?overflow: visible;/);
  assert.match(css, /\.cx-split-button--fill \.cx-split-button__action\s*\{[\s\S]*?border-right-color: var\(--cx-brand-400\);/);
  assert.match(css, /\.cx-split-button--fill \.cx-split-button__trigger\s*\{[\s\S]*?border-left: 0;/);
  assert.match(css, /\.cx-split-button--fill \.cx-split-button__trigger:hover:not\(:disabled\)[\s\S]*?var\(--cx-brand-400\)/);
  assert.match(css, /\.cx-split-button--fill \.cx-split-button__trigger:active:not\(:disabled\)[\s\S]*?var\(--cx-brand-700\)/);
  assert.match(css, /\.cx-split-button--outline \.cx-split-button__trigger:hover:not\(:disabled\)[\s\S]*?var\(--cx-brand-50\)/);
  assert.match(css, /\.cx-split-button--outline \.cx-split-button__trigger:active:not\(:disabled\)[\s\S]*?var\(--cx-background-surface-extension-blue\)/);
  assert.match(css, /\.cx-split-button--fill[\s\S]*?:disabled[\s\S]*?var\(--cx-background-surface-tertiary\)/);
  assert.match(css, /\.cx-split-button--outline[\s\S]*?:disabled[\s\S]*?var\(--cx-background-surface-secondary\)[\s\S]*?var\(--cx-border-secondary\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.cx-icon-button,[\s\S]*?\.cx-split-button__trigger/);
});

test("button-family selectors and assets stay package-scoped", async () => {
  const [css, splitSource] = await Promise.all([
    readSource("src/styles/components.css"),
    readSource("src/components/SplitButton.tsx"),
  ]);

  assert.doesNotMatch(css, /!important/);
  assert.doesNotMatch(css, /(^|\n)\s*button(?:\s|,|\{|:)/);
  assert.doesNotMatch(css, /(^|\n)\s*:root(?:\s|,|\{)/);
  assert.match(splitSource, /cargox-split-chevron-fill\.svg/);
  assert.match(splitSource, /cargox-split-chevron-outline\.svg/);
  assert.match(splitSource, /cargox-split-chevron-disabled\.svg/);
  assert.doesNotMatch(splitSource, /pagination-chevron/);
});
