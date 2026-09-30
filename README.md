# Jinesh Dutt Joshi: Portfolio

A static site (plain HTML, CSS and JavaScript). There is no build step and no framework, so it loads fast and deploys anywhere.

## Project structure

```
index.html                  Page content, SEO metadata, JSON-LD
css/styles.css              Design tokens, layout, components, dark mode, print
js/main.js                  Theme toggle, mobile nav, scroll-spy, reveals, hero flow
js/skills-tree.js           Interactive skills tree (data block at the top)
assets/favicon.svg          Favicon
assets/og-image.png         1200x630 social share image
assets/Jinesh-Dutt-Joshi-Resume.pdf   Downloaded by the "Download resume" buttons
robots.txt, sitemap.xml     Search engine files
CNAME                       Custom domain for GitHub Pages
.nojekyll                   Tells GitHub Pages to serve files as-is
```

## Run locally

```bash
cd portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

(Or `npx serve .`, or the VS Code "Live Server" extension.)

## Updating content

- **Skills tree:** edit the `GROUPS`, `ROOTS` and `PROJECTS` blocks at the top of `js/skills-tree.js`. Each skill is `['Name', ['project ids that used it']]`. To add a new branch, add a group object with a unique `angle`. Keep the simple-view list in `index.html` in sync.

- **Resume file:** replace `assets/Jinesh-Dutt-Joshi-Resume.pdf` and keep the same filename.
- **Projects:** each project is an `<article class="project">` in `index.html`. To add links, put this inside the article, above the chips:
  `<p class="project-links"><a href="https://github.com/you/repo">Source</a> <a href="https://demo.example">Live demo</a></p>`
- **Colors and fonts:** edit the variables at the top of `css/styles.css`.

---

## Deployment: GitHub Pages + custom .in domain

GitHub Pages is a good fit: the site is fully static, hosting is free, HTTPS is automatic, and every push to `main` redeploys.

### 1. Push the repository

```bash
git add .
git commit -m "Redesign portfolio"
git push origin main
```

### 2. Turn on GitHub Pages

Repository **Settings > Pages > Build and deployment**: Source = **Deploy from a branch**, Branch = **main**, Folder = **/ (root)**. Save.
Your site is live within a minute at `https://<username>.github.io/<repo>/` (or `https://<username>.github.io/` if the repo is named `<username>.github.io`).

### 3. Register the domain

Buy `jineshduttjoshi.in` from any registrar (for example GoDaddy, Namecheap, Cloudflare Registrar, Hostinger, BigRock). `.in` domains are managed by NIXI/IN Registry and usually cost roughly INR 500 to 1,000 per year (check current prices). You will need to complete registrant KYC/email verification. Turn on registrar lock and WHOIS privacy where offered. Check availability first: the exact name may already be taken.

### 4. DNS records

In your registrar's (or Cloudflare's) DNS panel, add:

| Type  | Host / Name | Value                     |
|-------|-------------|---------------------------|
| A     | `@`         | `185.199.108.153`         |
| A     | `@`         | `185.199.109.153`         |
| A     | `@`         | `185.199.110.153`         |
| A     | `@`         | `185.199.111.153`         |
| CNAME | `www`       | `<your-github-username>.github.io` |

Optionally add the matching AAAA records (`2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`). Delete any old A/AAAA/CNAME records for `@` and `www` that point elsewhere. Confirm these IPs on GitHub's current docs ("Managing a custom domain for your GitHub Pages site") before you save, since they can change.

### 5. Connect the domain in GitHub

**Settings > Pages > Custom domain**: enter `jineshduttjoshi.in` and Save. The `CNAME` file in this repo already contains that name (if you keep the domain in the UI and the file, they must match). GitHub will check DNS, which can take from a few minutes up to 24 to 48 hours.

### 6. HTTPS

Once DNS verifies, GitHub provisions a free Let's Encrypt certificate automatically. Then tick **Enforce HTTPS** in Settings > Pages. Do this only after the check passes.

### 7. Root and www

With the records above, `jineshduttjoshi.in` (apex) is the primary site, and `www.jineshduttjoshi.in` automatically redirects to it. Nothing else to configure.

### 8. Automatic deploys

Pages redeploys on every push to `main`. Workflow: edit, `git commit`, `git push`, and the new version is live in about a minute. Watch progress under the repo's **Actions** tab.

### 9. After the domain is live

- Confirm `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image` and JSON-LD `url` in `index.html` use the real domain (they currently assume `https://jineshduttjoshi.in/`). Change all of them if you pick a different domain.
- Update `robots.txt` and `sitemap.xml` the same way.
- Add the site in [Google Search Console](https://search.google.com/search-console) and submit `sitemap.xml`.
- Test the share preview with LinkedIn's Post Inspector.

### Security and configuration notes

- Enable 2FA on GitHub and on the registrar account. A hijacked registrar account means a hijacked domain.
- Enable registrar auto-renew so the domain doesn't lapse.
- Don't commit secrets. This site has none, and it has no backend or forms (contact is via `mailto:`).
- Your phone number and email are public on the page, as on your resume. Remove the phone line in the Contact section if you'd rather not publish it.
- Never point DNS at a GitHub Pages site you haven't verified, and delete unused Pages sites and DNS records, to avoid subdomain takeover.
- Google Fonts are loaded from Google's CDN. To go fully self-hosted, download the three families and add `@font-face` rules.

### Alternatives

Cloudflare Pages, Netlify or Vercel also work (connect the Git repo, no build command, output directory `/`) and add preview deploys for branches. GitHub Pages is enough for this site.

---

## Final checklist

- [ ] `python3 -m http.server` and open the site: no console errors
- [ ] All nav links scroll to the right section; active link highlights while scrolling
- [ ] "Download resume" (hero and contact) downloads the PDF
- [ ] Email, phone and LinkedIn links work
- [ ] Theme toggle works and is remembered after reload
- [ ] Mobile menu opens and closes (including Escape key)
- [ ] Check widths: 360px, 768px, 1024px and 1440px
- [ ] Keyboard only: Tab through the page, focus is always visible, skip link works
- [ ] OS "reduce motion" on: hero flow appears fully, no reveal animations
- [ ] Lighthouse: Performance, Accessibility, SEO, Best Practices all 90+
- [ ] Domain: `https://jineshduttjoshi.in` loads with a padlock; `www` redirects to it
- [ ] Canonical, OG and sitemap URLs use the final domain
- [ ] Paste the URL into LinkedIn or WhatsApp and check the preview image and title
