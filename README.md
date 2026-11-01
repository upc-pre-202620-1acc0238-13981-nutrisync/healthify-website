# Healthify Website

![Logo Healthify](assets/images/logo.webp)

Static landing page for Healthify, a clinical tool that connects nutritionists and their patients between visits.

## Pages

| File | Content |
| :--- | :--- |
| `index.html` | Home (Figma V10): hero, value, the visit step by step, between visits, for nutritionists, for patients, social proof, final CTA |
| `about-us.html` | About us (V1.1): hero, story, mission & vision, values, team, FAQ with filters |
| `contact.html` | Contact (V2.1): case selector (radios), form with validation and error summary, other contact details |
| `terms.html` | Terms and conditions (V1.1), sticky index on desktop and a `<details>` index on mobile (`#privacidad` is section 7) |

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

## Download link

All "Descargar" buttons point to the Firebase App Distribution link (`https://appdistribution.firebase.dev/i/1dec518f210ca662`).

## Testimonials

The two quotes on Home are a draft not yet confirmed by their authors. They live only in `js/i18n.js` (`quote_*` keys, ES and EN).

## Pending review

- **Contact form:** there is no backend. `initContactForm` in `js/main.js` only simulates the send (0.7 s) and shows the confirmation; the real request goes in the `submit` handler.
- **Testimonials:** the `quote_*` keys are a draft not yet approved by their authors.
- **Hero videos:** the hero is a 3-slide carousel (home, team video, product video). Paste each video link in the `data-video-url` attribute of `#hero-slide-2` and `#hero-slide-3` in `index.html` (YouTube or Vimeo). The carousel strings (`hero_video*`, `video_*` and `carousel_*` keys) have no source in Figma.
- **Spanish strings written without a source in Figma** (30): `meta_title_home`, `proof_title`, `brand_aria`, `menu_aria`, `steps_dots_aria`, `steps_dot1_aria`, `steps_dot2_aria`, `steps_dot3_aria`, `steps_dot4_aria`, `footer_nav_aria`, `alt_pt7`, `alt_pac2`, `alt_pt3m`, `alt_ev2`, `alt_ev3`, `alt_ev4`, `alt_ev5`, `alt_pr13`, `alt_pr14`, `alt_pr1`, `alt_pt3`, `meta_title_about`, `meta_title_terms`, `meta_title_contact`, `cases_legend`, `form_phone_hint`, `nav_open_menu`, `nav_close_menu`, `faq_status`, `summary_one`.
- **English translations to confirm** (55): `meta_title_home`, `hero_title`, `value_title`, `stat2_label`, `step3_desc`, `between_title`, `example_label`, `pros_title`, `f3_title`, `f8_title`, `patients_title`, `proof_title`, `criteria_title`, `cta_title`, `brand_aria`, `menu_aria`, `steps_dots_aria`, `steps_dot1_aria`, `steps_dot2_aria`, `steps_dot3_aria`, `steps_dot4_aria`, `footer_nav_aria`, `alt_pt7`, `alt_pac2`, `alt_pt3m`, `alt_ev2`, `alt_ev3`, `alt_ev4`, `alt_ev5`, `alt_pr13`, `alt_pr14`, `alt_pr1`, `alt_pt3`, `meta_title_about`, `about_lead`, `story_title`, `story_p1`, `purpose_title`, `mission_title`, `vision_title`, `value1_title`, `meta_title_terms`, `terms_meta`, `t4_text`, `t7_text`, `meta_title_contact`, `contact_title`, `cases_legend`, `form_hint`, `form_phone_hint`, `nav_open_menu`, `nav_close_menu`, `faq_status`, `summary_one`, `err_phone`.

## Internationalization

Every translatable element uses `data-i18n="key"` (text), `data-i18n-html` (text with markup),
`data-i18n-placeholder`, `data-i18n-aria` or `data-i18n-alt`. Strings live in `js/i18n.js`
under `translations.es` and `translations.en`. The language selector is the ES / EN switch in the header (and in the mobile menu); the
choice is saved in `localStorage` (`healthify_lang`).

App screenshots marked with `data-i18n-img` switch with the language: in English, `assets/images/app/ev-2.webp`
loads `assets/images/app/en/ev-2.webp`. If a translated file is missing, the Spanish one stays.

To add a language, add a new object to `translations`, a new button to each `.lang-switch` and, for the screenshots,
a folder `assets/images/app/<lang>/` with the same file names.

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
