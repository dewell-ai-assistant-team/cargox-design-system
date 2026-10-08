import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

import type { CxPaginationProps, CxPaginationVariant } from "../src";

type PaginationComponent = typeof import("../src/components/Pagination").Pagination;

const paginationVariantList: CxPaginationVariant[] = [
  "full",
  "no-page-size",
  "basic",
];

function renderPagination(
  paginationComponent: PaginationComponent,
  props: Partial<CxPaginationProps> = {},
): string {
  return renderToStaticMarkup(
    createElement(paginationComponent, {
      currentPageNumber: 4,
      onPageChange: () => undefined,
      pageCount: 15,
      ...props,
    }),
  );
}

test("Pagination SSR honors variants and keeps legacy visibility behavior", async () => {
  const viteServer = await createServer({
    appType: "custom",
    server: { middlewareMode: true },
  });

  try {
    const paginationModule = (await viteServer.ssrLoadModule(
      "/src/components/Pagination.tsx",
    )) as { Pagination: PaginationComponent };

    for (const variant of paginationVariantList) {
      const legacyVisibilityProps =
        variant === "full"
          ? { showJumpTo: false, showPageSize: false }
          : {
              pageSizeLabel: "20/Page",
              showJumpTo: true,
              showPageSize: true,
            };
      const markup = renderPagination(paginationModule.Pagination, {
        ...legacyVisibilityProps,
        pageSize: 20,
        totalLabel: "1-20 of 285",
        variant,
      });
      assert.match(markup, /1-20 of 285/);

      if (variant === "full") {
        assert.match(markup, /class="cx-pagination__page-size"/);
        assert.match(markup, /class="cx-pagination__jump"/);
        assert.match(markup, /20\/Page/);
      } else if (variant === "no-page-size") {
        assert.doesNotMatch(markup, /class="cx-pagination__page-size"/);
        assert.match(markup, /class="cx-pagination__jump"/);
      } else {
        assert.doesNotMatch(markup, /class="cx-pagination__page-size"/);
        assert.doesNotMatch(markup, /class="cx-pagination__jump"/);
      }
    }

    const bothControlsMarkup = renderPagination(paginationModule.Pagination, {
      showJumpTo: true,
      showPageSize: true,
    });
    assert.match(bothControlsMarkup, /class="cx-pagination__page-size"/);
    assert.match(bothControlsMarkup, /class="cx-pagination__jump"/);

    const pageSizeLabelMarkup = renderPagination(paginationModule.Pagination, {
      pageSizeLabel: "20/Page",
    });
    assert.match(pageSizeLabelMarkup, /class="cx-pagination__page-size"/);
    assert.doesNotMatch(pageSizeLabelMarkup, /class="cx-pagination__jump"/);
  } finally {
    await viteServer.close();
  }
});
