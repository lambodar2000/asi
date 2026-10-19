# Autism Society of India — website redesign

An accessible, interactive redesign of [autismsocietyofindia.org](https://autismsocietyofindia.org/). Plain static HTML, CSS and JavaScript, with no framework. Every page works without JavaScript; scripts only add enhancements.

## Structure

```
src/
  layout.html        shared header, accessibility panel, nav and footer
  pages/*.html       page content (front-matter comment sets title, description, nav section)
  assets/css/site.css
  assets/js/site.js
build.py             wraps each page in the layout and writes docs/
docs/                built site (GitHub Pages ready)
```

## Build and preview

```bash
python3 build.py
python3 -m http.server 8765 --directory docs
```

Then open http://localhost:8765.

## Accessibility features

- **Accessibility panel** (top bar): text size, Auto/Light/Dark/High-contrast colours, **Calm mode** (muted colours, no animation — sensory-friendly), readable font (Lexend), extra spacing, highlighted links. Saved per device, applied before first paint.
- **Read aloud**: reads the page in Indian English using the browser's speech engine and highlights each paragraph.
- Atkinson Hyperlegible body font, WCAG AA colour contrast, 44px minimum touch targets, visible focus rings.
- Skip link, landmarks, breadcrumbs, one `h1` per page, `aria-current` navigation.
- Keyboard-operable menus (Escape closes), WAI-ARIA tabs (arrow keys), lightbox dialog (arrow keys, focus returns).
- Respects `prefers-reduced-motion` and `prefers-color-scheme`.
- Contact form with an error summary, inline errors linked by `aria-describedby`, and live-region announcements.

## Interactive features

- Count-up statistics, reveal-on-scroll (disabled under reduced motion / Calm mode)
- "Areas of autism" and "Take action" tabs
- Early-signs checklist (nothing is stored or sent)
- Sticky table of contents with scroll-spy on About autism
- Filterable activity timeline, searchable resource directory, filterable gallery with lightbox
- One-tap copy for bank account and IFSC
- Reading-progress bar on blog posts

Images and PDFs are linked from the live WordPress site's `wp-content/uploads`.
