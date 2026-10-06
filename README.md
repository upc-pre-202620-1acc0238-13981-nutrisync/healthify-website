# Healthify Website

![Logo Healthify](assets/images/logo.webp)

Static landing page for Healthify, a clinical tool that connects nutritionists and their patients between visits.

## Pages

| File | Content |
| :--- | :--- |
| `index.html` | Home: hero, problem, patient features, nutritionist features, how it works, FAQ |
| `about-us.html` | About us: story, mission & vision, values, team, FAQ |
| `contact.html` | Contact: contact details and form |
| `terms.html` | Terms and conditions (includes the privacy section `#privacidad`) |

## Structure

```
├── index.html / about-us.html / contact.html / terms.html
├── css/styles.css        # Design tokens (Figma) + all styles, responsive at 1100 / 900 / 768 px
├── js/i18n.js            # Translations (es-419 default, en-US) and i18n engine
├── js/main.js            # Mobile menu, FAQ accordion + filters, showcases (patient / nutritionist), contact form, terms index
└── assets/
    ├── images/           # Logo, app screens, illustrations, og-image, favicon
    └── icons/            # SVG icons exported from Figma
```

## Scroll behaviour

- Pages with `body.snap-page` scroll section by section on desktop (≥ 1101 px wide and ≥ 640 px tall): each wheel /
  trackpad gesture or ↓ / ↑ / PageDown / PageUp / Space moves to the next or previous section (`initPageScroll()` in
  `js/main.js`). Every `.snap-section` fills the screen. Remove the class to turn it off.
- The patient and nutritionist sections (`[data-showcase]`) pin their content while the list advances with the scroll
  on desktop; on tablet / mobile they become an accordion (see `initShowcases()` in `js/main.js`).
- `terms.html` shows one clause per screen with a fixed index on desktop, and a regular list on mobile.

## Hero carousel (index.html)

Four slides: nutritionists, patients, product video and team video. Arrows, dots, swipe, ← / → and a
7-second autoplay (paused on hover over the content, with keyboard focus, off screen, or with reduced motion;
it stops once a video plays). To publish a video, put its YouTube ID in `data-youtube-id` on the matching
`.hero__video` element; the player only loads when the user presses play.

## Internationalization

Every translatable element uses `data-i18n="key"` (text), `data-i18n-html` (text with markup),
`data-i18n-placeholder`, `data-i18n-aria` or `data-i18n-alt`. Strings live in `js/i18n.js`
under `translations.es` and `translations.en`. The language selector is the ES / EN switch in the navbar (plus the one in the footer) and the
choice is saved in `localStorage` (`healthify_lang`).

To add a language, add a new object to `translations` and a new `<option>` to the `.lang-select`
selectors.

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
