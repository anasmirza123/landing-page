# Al-Noor Auto Workshop

A responsive, accessible local-business landing page for a **fictional** auto workshop. Built as a portfolio project with plain HTML5, CSS3 and about 70 lines of vanilla JavaScript. No framework, no build step.

> All business details (name, address, phone, email, reviews) are demo content. Replace them before using the site for a real business.

## Run it

Open `index.html` in a browser. To test like a real host, serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project structure

```
al-noor-auto-workshop/
├── index.html          Page markup, SEO tags, LocalBusiness (AutoRepair) JSON-LD
├── css/
│   └── style.css       Complete design system and all components
├── js/
│   └── script.js       WhatsApp links, mobile menu, active nav link, form validation
├── images/             SVG placeholders (hero, workshop, gallery-1..6)
└── README.md
```

## Sections

Header and navigation, Hero, Services, About, Why Choose Us, Gallery, Customer Reviews, Location, Contact form, floating WhatsApp button, Footer.

## What it demonstrates

- Semantic HTML5, one `h1`, logical `h2`/`h3` hierarchy, skip link, labelled form fields
- CSS custom properties (design tokens), Flexbox, Grid, `clamp()`, `aspect-ratio`, `:focus-visible`, `:has()` (as an enhancement only)
- Mobile-first responsive layout (checked from 320px to 1920px), no horizontal scroll
- Keyboard-friendly navigation, visible focus rings, reduced-motion support, print styles
- Basic and local SEO: title, description, canonical, Open Graph, Twitter tags, JSON-LD without invented ratings

## Replace before real use

| What | Where |
| --- | --- |
| WhatsApp number | `WHATSAPP_NUMBER` at the top of `js/script.js` (country code, digits only). The `wa.me` links in the HTML are the no-JavaScript fallback. |
| Address, phone, email, hours | Location section, footer and the JSON-LD block in `<head>` |
| Map | Change the `q=` value in the iframe `src`, or paste a Google Maps embed URL |
| Images | Replace `images/*.svg` with real photos (hero 1600x900, gallery 600x450), update the `src` paths, keep `width` and `height` |
| SEO URLs | Canonical, `og:url`, `og:image` and JSON-LD `url` currently use `example.com` |
| Reviews | Demo only. Use real, permissioned reviews |
| Contact form | Front-end validation only. Connect a backend or a form service to receive inquiries |

## Changing the colours

All colours, radii, shadows, spacing, motion and z-index values are tokens in the `:root` block at the top of `css/style.css`. The brand colours are:

```css
--color-primary: #12171d;  /* charcoal */
--color-accent:  #f5a623;  /* amber gold */
```

## CSS structure

`css/style.css` is organised in numbered sections:
Design tokens, Reset, Typography, Layout, Accessibility, Buttons, Header, Navigation, Hero, Services and cards, About, Why Choose Us, Gallery, Lightbox, Reviews, Location, Contact, Forms, Modals, Toasts, WhatsApp, Footer, Animations, Responsive, Reduced motion, Print.

The modal, lightbox, toast, carousel and loading styles are ready for future use. This page does not include their markup yet.

### State classes the stylesheet understands

| Class or attribute | Used for |
| --- | --- |
| `.site-nav.open` (or `.is-open`) | Open mobile menu |
| `.site-nav a.active` | Current section link (set by `script.js`) |
| `.site-header.is-scrolled` | Header after scrolling (also works without JS in modern browsers) |
| `[aria-invalid="true"]`, `.is-error`, `.has-error` | Invalid form field |
| `.is-success` | Valid field or success state |
| `.is-loading` | Busy button or form |
| `.modal-overlay.is-open` / `.is-closing` | Modal |
| `.lightbox.is-open` | Image lightbox |
| `.toast .toast-success / -error / -info / -warning` | Notifications |

## Responsive breakpoints

Layouts are mostly fluid. Structure changes at `30em`, `40em`, `48em`, `56em`, `64em`, `68em` (desktop navigation) and `100em` (large screens scale up slightly).

## Browser support

Current Chrome, Edge, Firefox and Safari, plus mobile browsers. Newer features (`:has()`, scroll-driven header shadow, `text-wrap: pretty`) are enhancements; the page works without them.
