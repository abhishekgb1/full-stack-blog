# Fieldnotes

Fieldnotes is a small, welcoming space to read sample essays and keep a notebook of your own. It runs as a static website with no account, build step, or third-party JavaScript dependency.

## What visitors can do

- Read the included sample stories.
- Write, edit, search, sort, filter, and delete their own stories.
- Export a JSON backup and import it later on the same or another device.
- Use the site on mobile, with keyboard navigation and assistive technology.

## Where stories are stored

Sample stories are included in the public site. Stories a visitor writes are saved in that visitor’s browser storage on that device. They are not uploaded, shared with other visitors, or protected by an account. Clearing browser data can remove them, so use **Export backup** to keep a copy. Avoid saving sensitive information in a browser notebook.

This project is intentionally local-first. It does not claim to provide server-side storage, shared publishing, or user authentication.

## Run locally

Open `index.html` in a browser, or serve this folder with any static web server. No packages or build tools are required.

## Publish with GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the site after changes reach `main`. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source. GitHub will then publish the site at:

`https://abhishekgb1.github.io/full-stack-blog/`

## Project files

- `index.html` — page structure and accessible dialogs
- `style.css` — responsive visual design
- `script.js` — local story editing, search, backup, and rendering

