# BallersPlay — Landing Page PRD

## Original Problem Statement
Build a highly performant, modern single-page landing page for "BallersPlay", a business that connects sports lovers by organizing, hosting, and showcasing local sports events. Premium dark mode, energetic accent, athletic typography. Pure vanilla HTML/CSS/JS, single index.html, lag-free fixed video background, smooth scrolling.

## Tech / Architecture
- Single static file: `/app/website/index.html` (vanilla HTML + embedded CSS + vanilla JS).
- Fonts: Anton (display) + Montserrat (body) via Google Fonts. Icons via Font Awesome CDN.
- Lag-free parallax: `<video>` inside fixed `div.video-bg` at `z-index:-1`; solid content scrolls over it. `will-change: transform`, no `background-attachment: fixed`.
- `scroll-behavior: smooth` for anchor links.
- Served for preview on port 3000 via `python3 -m http.server` (supervised frontend stopped).

## Design System
- Background pure black (#000), white text, accent electric lime (#c6ff00) + neon green (#00e676).
- Sticky navbar transparent → solid black on scroll. Mobile burger menu.
- Scroll-reveal animations (IntersectionObserver), hover micro-interactions.

## Implemented (2026-06-23)
- Navbar (transparent→solid), logo `<img src="LogoEnhanced2.png">` with text fallback.
- Hero 100vh with cinematic video background + dark overlay, "Connect. Play. Dominate." + CTA.
- What We Do (3-column grid), Coming Soon 1v1 Tournament (gradient hype + VS watermark + waitlist).
- Events: 3 upcoming cards (image/title/date/location + Register Now), 6-image masonry gallery (Past) with hover zoom.
- About "Born on the Pitch." with stats + media. Footer with logo, Instagram/TikTok, email, copyright.
- All CTA buttons use `href="#"` placeholders, clearly HTML-commented for easy swap.

## Notes for User
- Upload `LogoEnhanced2.png` to the same folder as index.html (root) — text logo shows until then.
- Replace `href="#"` placeholders (commented) with real registration/waitlist links.
- Stock images are placeholders; swap with real event photos.

## Backlog (P1/P2)
- Newsletter / waitlist form integration (currently placeholder link).
- Event registration backend or external form (Typeform/Google Form).
- Lightbox for past-events gallery.
- SEO/OG meta + favicon.
