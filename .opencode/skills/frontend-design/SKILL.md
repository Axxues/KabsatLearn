---
name: frontend-design
description: Use when building or reviewing any user interface — pages, components, forms, dashboards, or marketing sections — before committing to layout, colour, type, or spacing decisions.
---

# Frontend Design

## Overview

Good interface work is mostly four decisions made before the first CSS rule:
the layout, the type scale, the spacing scale, and the colour roles. Made up
front, everything after them is consistent without effort. Skipped, every
element reinvents its own value and the result reads as assembled rather than
designed.

This is a checklist for those decisions, not a style.

## Before writing CSS

**1. Scales.** Pick one spacing scale and use only its values:
`4, 8, 12, 16, 24, 32, 48, 64`. Every margin, padding, and gap comes from it.
Pick one type scale, five sizes at most — for example `12, 14, 16, 20, 28, 40`.

**2. Colour roles.** Define roles, not colours: `--bg`, `--surface`, `--text`,
`--muted`, `--border`, `--accent`, `--accent-strong`, `--on-accent`. Keep every
literal hex inside `:root`.

**3. Heading outline.** One `<h1>` per page, naming the page. Inside a card, the
component or plan name is the heading — `<h2>` or `<h3>` — and marketing copy is
a paragraph. The named thing is the heading, not the slogan above it.

**4. Layout.** Fluid width with a `max-width`. Content must not scroll
horizontally at 320px.

## Every component

- **All states.** Hover, `:focus-visible`, active, and disabled where relevant.
  Focus must be visible without hovering first.
- **Contrast.** Body text at least 4.5:1, large text at least 3:1, interactive
  affordances at least 3:1 against their background. Compute the ratio.
- **Motion.** Wrap transitions in `prefers-reduced-motion: reduce`.
- **Real content.** Actual copy, no lorem ipsum. A button says what it does.
- **Semantics.** `button` for actions, `a` for navigation, `ul` for lists,
  `aria-hidden="true"` on decorative marks.

## Verification

Run these four checks before calling the work done:

1. Scan the CSS for `px` values. If one component holds more than six distinct
   spacing values, it is ad-hoc — fold them into the scale.
2. Check the heading outline. Does the `<h1>` name the page, or is it a slogan?
3. Compute contrast on every text/background pair, including muted text at its
   smallest size.
4. Resize to 320px. No horizontal scroll, no clipped content.

## Common mistakes

| Mistake | Fix |
|---|---|
| Nine one-off spacing values in one card | Snap each to the scale |
| `h1` on a slogan, plan name as `<p>` | The named thing is the heading |
| Half-pixel type sizes (`14.5px`) | Round into the type scale |
| "Looks fine" contrast | Measure the ratio |
| Hover styles with no focus equivalent | Add `:focus-visible` |
