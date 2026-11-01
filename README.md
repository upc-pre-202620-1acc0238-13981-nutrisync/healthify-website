# Healthify Website

![Logo Healthify](assets/images/logo.webp)

Static landing page for Healthify, a clinical tool that connects nutritionists and their patients between visits.

## Pages

| File | Content |
| :--- | :--- |
| `index.html` | Home: hero, value, the visit step by step, between visits, for nutritionists, for patients, social proof, final CTA |
| `about-us.html` | About us: hero, story, mission & vision, values, team, FAQ with filters |
| `contact.html` | Contact: case selector (radios), form with validation and error summary, other contact details |
| `terms.html` | Terms and conditions, sticky index on desktop and a `<details>` index on mobile (`#privacidad` is section 7) |

## Structure

```
├── index.html / about-us.html / contact.html / terms.html
├── css/styles.css        # Design tokens (app colors, Figma type scale, radii) + all styles. Mobile first; layouts at 1024 px, header at 1200 px
├── js/i18n.js            # Translations (es-419 default, en-US) and i18n engine
├── js/main.js            # Language switch, mobile menu (focus trap, Esc), steps carousel, FAQ accordion + filters, terms index, contact form
└── assets/
    ├── images/           # Logo (color and white), og-image, favicon
    │   └── app/          # Real app screens exported from Figma ("Mockup" page) as WebP, 720 × 1600
    │       └── en/       # The same screens in English, same file names
    └── icons/            # SVG icons
```

## Layout

- On desktop (≥ 1024 px) every Home and About section is at least one screen tall (`--screen: max(100svh, 900px)`), so each one fits in 900 px at 1440 × 900. Nothing uses a fixed height that could cut text.
- "The visit, step by step" is a 4-column grid on desktop and a scroll-snap carousel on mobile with a 1–4 step indicator.
- Focus ring: 2 px with 2 px offset, `#3B6E23` on light backgrounds and `#B8E07A` on dark ones (`.on-dark`). `prefers-reduced-motion` is respected.
- 
## Testimonials

The two quotes on Home are a draft not yet confirmed by their authors. They live only in `js/i18n.js` (`quote_*` keys, ES and EN).

## Internationalization

Every translatable element uses `data-i18n="key"` (text), `data-i18n-html` (text with markup),
`data-i18n-placeholder`, `data-i18n-aria` or `data-i18n-alt`. Strings live in `js/i18n.js`
under `translations.es` and `translations.en`. The language selector is the ES / EN switch in the header (and in the mobile menu); the choice is saved in `localStorage` (`healthify_lang`).

## Run locally

```bash
npx serve -l 4173 .
```

## Team

| Name |
| :---: |
| Olenka Del Aguila |
| Angela Espinoza |
| Joel Mora |
| Rose Vergaray |
| Angel Villarreal |
