# Product

## Register

product

## Users

Frontend engineers and product teams integrating CargoX controls into DWMS applications, especially fsense Document Station. They need reusable controls that preserve the host application's business logic and page layout while providing consistent CargoX visual and interaction contracts.

## Product Purpose

Provide an isolated, versioned React design-system package for CargoX tokens and reusable controls. Success means consumers can adopt components incrementally without global resets, page-level rewrites, or regressions in existing fsense behavior.

## Brand Personality

Reliable, restrained, and precise. The library should feel familiar in dense operational tools and should disappear into the user's workflow rather than adding decorative novelty.

## Anti-references

- Global CSS resets or unscoped theme variables that alter unrelated host UI.
- High-specificity component rules that prevent approved host layout utilities from composing with the library.
- Reimplemented business behavior inside generic design-system components.
- Decorative or unfamiliar control behavior that diverges from validated fsense patterns.

## Design Principles

- Preserve host business contracts and page structure during incremental adoption.
- Scope tokens and component styles behind `cx-` classes and theme boundaries.
- Keep component DOM and public APIs stable unless a compatibility fix requires an additive change.
- Define visual geometry explicitly where host CSS could otherwise distort it.
- Prefer semantic, accessible native elements and predictable interaction states.

## Accessibility & Inclusion

Preserve native control semantics, keyboard behavior, visible focus treatment, disabled states, and accessible labels. Avoid claiming a formal WCAG conformance level until the consuming surfaces have been audited end to end.
