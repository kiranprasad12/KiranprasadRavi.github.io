# My personal website

A static site (HTML, CSS and a little JavaScript). No build step, no frameworks.

- `public/index.html` is the page and all the text
- `public/style.css` is the styling and the three themes (blueprint, paper, hi-vis)
- `public/script.js` is the interactions (scroll drawing, filters, quick jump, GitHub repo list)
- `public/fonts/` holds the self-hosted Barlow fonts (OFL license included)
- `public/photo.jpg` is the portrait shown in the hero

## Publish

GitHub Pages: the workflow in `.github/workflows/` publishes the `public` folder (Settings, Pages, Source: GitHub Actions).
GitLab Pages: `.gitlab-ci.yml` does the same.

## Preview locally

Run `python -m http.server 8000` inside `public` and open http://localhost:8000
