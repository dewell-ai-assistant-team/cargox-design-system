import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import type { TooltipContent as ContentType, Tooltip as TooltipType } from "../src/components/Tooltip";

test("Tooltip renders both themes and every CSS arrow variant without image assets", async () => {
  const server = await createServer({ appType: "custom", server: { middlewareMode: true } });
  try {
    const { TooltipContent, Tooltip } = await server.ssrLoadModule("/src/components/Tooltip.tsx") as {
      TooltipContent: typeof ContentType;
      Tooltip: typeof TooltipType;
    };
    const positions = [
      "above-start", "above-center", "above-end", "below-start", "below-center", "below-end",
      "before-top", "before-center", "before-bottom", "after-top", "after-center", "after-bottom", "none",
    ] as const;
    for (const theme of ["light", "dark"] as const) {
      for (const arrowPosition of positions) {
        const html = renderToStaticMarkup(createElement(TooltipContent, { theme, arrowPosition }, "Hint"));
        assert.match(html, /role="tooltip"/);
        assert.ok(html.includes('data-arrow-position="' + arrowPosition + '"'));
        assert.ok(html.includes("cx-tooltip--" + theme));
        assert.doesNotMatch(html, /https:\/\/www.figma.com/);
        assert.doesNotMatch(html, /<img|<svg/);
        if (arrowPosition === "none") {
          assert.doesNotMatch(html, /cx-tooltip__arrow/);
        } else {
          assert.match(html, /aria-hidden="true"/);
          assert.match(html, /class="cx-tooltip__arrow"/);
        }
      }
    }
    const disabled = renderToStaticMarkup(createElement(Tooltip, {
      content: "Never visible", disabled: true, open: true,
      children: createElement("button", { "aria-describedby": "existing" }, "Trigger"),
    }));
    assert.doesNotMatch(disabled, /role="tooltip"/);
    assert.match(disabled, /aria-describedby="existing"/);
  } finally {
    await server.close();
  }
});
