# Portfolio Website Implementation Plan

## Goal Description
Implement a complex, multi-layered glitch effect for the Hero Title and Section Headings, replacing the previous simple glitch animations. This includes adding specific CSS keyframes for clip-path animations and restructuring the HTML.

## User Review Required
> [!NOTE]
> This effect is significantly more complex and resource-intensive than the previous CSS animations. It uses `clip-path` and multiple pseudo-elements.

## Proposed Changes
### Project Structure
#### [MODIFY] [style.css](file:///d:/Antigravity/CyberpunkPortfolio/style.css)
- Add `@keyframes paths`, `movement`, `opacity`, `font`.
- Add/Update classes `.layers`, `.layers::before`, `.layers::after`.
- Update `.glitch` and `.glitch-hero` to incorporate these new animations or replace them.
- Ensure colors match the Cyberpunk theme (mapped to variables where appropriate).

#### [MODIFY] [index.html](file:///d:/Antigravity/CyberpunkPortfolio/index.html)
- Update `<h1 class="glitch-hero ...">` to `<h1 class="glitch-hero layers" ...><span>...</span></h1>`.
- Update `<h2 class="section-title glitch ...">` fields to include `layers` class and inner `<span>`.

## Verification Plan
### Manual Verification
- Visual check of the Hero Title.
- Visual check of Section Titles.
- Verify animations loop correctly and text is readable.
