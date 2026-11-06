# CompassAI company site

Landing page for **CourseCadence**, a product of CompassAI. Built from page 1 of the
`CompassAI_concept_update_11_04_2026.pdf` concept.

Plain HTML/CSS/JS with no build step. Open `index.html` in a browser, or serve the folder:

```sh
python -m http.server 8000   # then visit http://localhost:8000
```

## Structure

```
index.html            home page (hero, features, steps, sign-up)
about.html            mission, values, student quotes, team
getting-started.html  detailed setup steps + FAQ
download.html         platform cards + system requirements
css/styles.css        all styles; brand colors are CSS variables at the top
js/main.js            mobile nav toggle + sign-up form validation
assets/img/           logo (header + footer variants) and hero photo
```

## Still to do

- Sign-up form validates in the browser only. Wire it to a real endpoint in `js/main.js`.
- Hero play button is a placeholder. Swap the image for a `<video>` when the product video is ready.
- About, Getting Started and Download hold **filler copy** (marked with `FILLER` comments).
  Team names and photos, app store links, pricing, calendar integrations and system
  requirements are placeholders. Confirm them before launch.
- The header and footer are copied into every page. If you change one, change all four.
- Footer legal links and Student Community still point to `#`.
- Logo and hero image are rasters taken from the PDF. Replace them with the original SVG logo
  and a high-res photo when available.
