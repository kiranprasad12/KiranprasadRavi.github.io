# My personal website

A static site (HTML, CSS and a little JavaScript). No build step, no frameworks.

- `public/index.html` is the page and all the text
- `public/style.css` is the styling and the three themes (blueprint, paper, hi-vis)
- `public/script.js` is the interactions (scroll drawing, filters, quick jump, GitHub repo list)
- `public/i18n.js` holds the German text for the English/German switch
- `public/background.js` draws the animated background (dots, lines and dials)
- `public/effects.js` has the small desktop effects (card tilt, cursor ring, menu underline) and the keyword band speed
- `public/details.js` has the detail layer: the intro on the first visit, the truck on the progress line,
  dimension lines, drawing zones, the footer clock and the wireframe view (quick jump, Ctrl K)
- `public/fixture.js` plays the fixture design demo (research assistant job at FBK): CAD part, mesh, the agent
  placing locators, a clamp and a point contact, the FEM check and the reward. The bending comes from a small beam
  model solved in the browser and is exaggerated; it is an illustration, not a result of the real project
- `public/fonts/` holds the self-hosted Barlow fonts (OFL license included)
- `public/og-image.jpg` is the picture shown when the link is shared (LinkedIn, WhatsApp, Slack)
- `public/photo.jpg` is the portrait shown in the hero. `photo.avif` and `photo.webp` are smaller copies that
  most browsers load instead; if you change the photo, make new copies too

## Publish

GitHub Pages: the workflow in `.github/workflows/` publishes the `public` folder (Settings, Pages, Source: GitHub Actions).
GitLab Pages: `.gitlab-ci.yml` does the same.

## Preview locally

Run `python -m http.server 8000` inside `public` and open http://localhost:8000
