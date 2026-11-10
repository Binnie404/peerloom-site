# peerloom.tech

The download page for [Peerloom](https://github.com/Binnie404/peerloom), served by GitHub Pages at
https://peerloom.tech.

- `source/Main.dc.html` is the page as designed, a design-canvas component.
- `index.html` is the built page. Rebuild it after changing the source:
  `node tools/build.mjs source/Main.dc.html index.html`
- `assets/` holds the logo, the launch skit video and its poster frame, and the link-preview image (`og.jpg`).
- `CNAME` tells GitHub Pages to serve the site at peerloom.tech.
