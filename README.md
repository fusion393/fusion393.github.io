# Fusion — App Portfolio

> A platform to showcase apps developed by **Md. Shamim Al Razi**  
> Live at: [https://fusion393.github.io](https://fusion393.github.io)

---

## Overview

**Fusion** is a fully static, single-page portfolio site hosted on GitHub Pages. It showcases all apps built by Md. Shamim Al Razi — featuring a dark glassmorphism UI, smooth animations, and a dynamic app showcase powered by a simple JavaScript data array.

No frameworks. No build tools. Just HTML, CSS, and JavaScript.

---

## Features

- **Dark Glassmorphism UI** — frosted glass cards with gradient backgrounds and a noise texture overlay
- **Custom Animated Cursor** — subtle ring-and-dot cursor with hover expansion
- **Responsive & Mobile-First** — hamburger drawer nav, fluid grid, accessible on all screen sizes
- **Dynamic App Cards** — rendered from a single `APPS` array in `script.js`; add an app in seconds
- **Filter Bar** — filter the app grid by category, updated in real-time
- **Intersection Observer Animations** — elements fade-up as they scroll into view
- **Animated Hero** — staggered title entrance with animated stat counters
- **Parallax Background Orbs** — subtle floating gradient orbs for depth
- **Card 3D Tilt** — mouse-tracked perspective tilt on app cards (desktop only)
- **Roadmap Timeline** — vertical timeline showing shipped, in-progress, and planned milestones
- **Contact Form** — front-end validation with simulated send (ready for Formspree / EmailJS)
- **Back to Top** — smooth scroll button that appears after scrolling

---

## Project Structure

```
fusion-github-pages/
├── index.html   — All page markup and sections
├── style.css    — Complete styles (variables, layout, components, responsive)
├── script.js    — App data + all interactive logic
└── README.md    — This file
```

---

## Adding / Editing Apps

Open `script.js` and find the `APPS` array at the top. Each app object looks like this:

```js
{
  id: 10,
  name: "YourApp",
  description: "A short description of what your app does.",
  category: "Productivity",       // Productivity | Design Tools | Finance | Utilities | Education
  status: "live",                 // live | beta | wip | planned
  tech: ["React", "Firebase"],    // Tech stack chips
  icon: "🚀",                     // Emoji icon
  iconBg: "linear-gradient(135deg, #6c63ff, #00d4ff)",  // Card icon background
  featured: false,                // Set true for the Featured section spotlight
  demo: "https://...",            // Leave "" if not deployed yet
  github: "https://github.com/fusion393/yourapp",
}
```

Save the file, push to GitHub, and your new app card appears automatically.

---

## Deployment (GitHub Pages)

1. Fork or clone this repository
2. Push to a branch named `main` (or `gh-pages`)
3. Go to **Settings → Pages** in your GitHub repo
4. Set **Source** to `Deploy from a branch` → `main` → `/ (root)`
5. GitHub Pages will publish your site at `https://<username>.github.io`

---

## Contact Form Integration

The form currently simulates a send. To make it functional, integrate one of:

- **[Formspree](https://formspree.io/)** — replace the `setTimeout` in `initContactForm()` with a `fetch` POST to your Formspree endpoint
- **[EmailJS](https://www.emailjs.com/)** — add the EmailJS SDK and call `emailjs.send()`
- **Netlify Forms** — if redeployed on Netlify, add `netlify` attribute to the `<form>` tag

---

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Markup     | HTML5 (semantic)               |
| Styling    | CSS3 (variables, grid, flex)   |
| Logic      | Vanilla JavaScript (ES6+)      |
| Fonts      | Google Fonts (Syne + DM Sans)  |
| Icons      | Font Awesome 6                 |
| Hosting    | GitHub Pages                   |

---

## License

MIT — free to use, modify, and distribute with attribution.

---

*Built with ♥ by Md. Shamim Al Razi — Fusion, 2025*
