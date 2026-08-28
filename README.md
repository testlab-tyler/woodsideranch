# Woodside Ranch HOA

Website project for the Woodside Ranch Homeowners Association — a 257-property community on the southeast side of Bend, Oregon, bordering the Deschutes National Forest.

## Goal

Rebuild [woodsideranch.net](https://woodsideranch.net) as a site that residents can actually use and that non-technical board members can keep current without help.

Two constraints drive every decision here:

1. **Residents must be able to finish real tasks** — pay dues, submit a project for architectural review, find a governing document, see what's happening, reach a named person, and find evacuation information.
2. **The board must be able to maintain it.** Content updates are done by volunteer board members who are not technical. The editable surface is deliberately limited to three actions: post an announcement, add an event, upload a document.

## Contents

| File | What it is |
|---|---|
| `community-website-benchmark.md` | Benchmark report — 29 community association websites screened, 16 scored against a 7-part rubric, top five and bottom five profiled, plus the build brief. Markdown source. |
| `community-website-benchmark.html` | Same report, published as a standalone web page for sharing with the board. |

## Summary of findings

Twenty-nine HOA, POA and master-planned community sites were screened; sixteen were assessed page-by-page against a weighted rubric (task completion 25, document transparency 20, findability 15, accessibility 15, freshness 10, design credibility 8, technical health 7).

**Top five**

| # | Community | Score |
|---:|---|---:|
| 1 | Sunriver Owners Association (Sunriver, OR) | 94 |
| 2 | Caldera Springs Owners' Association (Sunriver, OR) | 92 |
| 3 | Kiawah Island Community Association (SC) | 87 |
| 4 | Palmetto Dunes POA (Hilton Head, SC) | 84 |
| 5 | The Ridge at Eagle Crest (Redmond, OR) | 82 |

Woodside Ranch's current site scores **50/100**.

**The eight habits that separate the best from the worst**

1. Navigation shaped like tasks, not like the org chart
2. The document library *is* the product — year-stamped, filterable, minutes current
3. Dated, visible proof of life on the homepage
4. Named humans with direct phone numbers
5. Money has a front door — and lives in a hosted portal, not on the site
6. Public by default, gated by exception
7. Emergency and safety information elevated, not filed
8. Boring, durable platforms beat clever ones

Full reasoning and evidence in the benchmark report.

## Planned stack

- **WordPress** — already in use, already ranks first for the community name, and the platform three of the top five leaders run on. The problem is structure, not software.
- **Hosted payment portal** (PayHOA / FRONTSTEPS / Stripe payment link) — linked out, so the site never handles card data.
- **Embedded form builder** (Cognito Forms or Jotform) for architectural review submissions.
- **Google Calendar embed** — the calendar the board already maintains.

## Accessibility floor

Set once in the theme, non-negotiable:

- 18px minimum body text
- Navigation always visible on desktop; no hamburger above 900px
- Menus open on click, never on hover
- Tap targets 44px minimum; every phone number a real `tel:` link
- 4.5:1 contrast minimum; no text over photographs
- No critical information PDF-only — meeting dates, board contacts and evacuation routes live on the page as text

## Open question

Online dues payment was scoped without a member login area. Showing an owner *their* balance requires knowing who they are, so this resolves one of two ways: hand payment entirely to a hosted portal with its own separate login (simplest), or add a light members area on the site. To be decided before build.

---

## The site

Static HTML in `site/`. No build step, no framework, no database.

| Page | Content |
|---|---|
| `index.html` | Hero, six tasks, dues (PayPal / Venmo / post), Caldera Ranch, fire, board |
| `association.html` | Board of directors, all six standing committees with members and emails, annual events |
| `documents.html` | CC&Rs for all six phases, annual meeting minutes 2013–2021, dues form |
| `fire-safety.html` | Current fire activity, alerts, home hardening assessments |
| `caldera-ranch.html` | The 716-unit development: status, timeline, city documents |

Supporting files: `assets/css/site.css` (the whole design system), `assets/js/site.js`
(~35 lines, mobile menu only), `assets/img/`, and `serve.mjs` for local preview.

### Run it

```
node serve.mjs
```

Then open http://localhost:8765

### Deploy

Cloudflare Pages or Netlify, **build command: none**, **output directory: `site`**.

### Content

Everything on the site is real content pulled from woodsideranch.net — the board
roster as of 31 May 2026, all six committees and their members, the $100 dues and
the PayPal/Venmo links, the Caldera Ranch timeline, and the fire resources.

Documents link to the PDFs already hosted on woodsideranch.net, so nothing had to
be migrated for the site to work. All 18 were checked and serve correctly. If the
old site is ever retired, copy `wp-content/uploads/` into `site/assets/docs/` and
update the hrefs.

### Design system

Built on "Seed" ([styles.refero.design](https://styles.refero.design/style/cd723d5a-e7ea-4e4c-a3bb-6cf56e05057a));
tokens documented in `design/SEED-SYSTEM.md` and implemented in `:root`.

Verified against the rendered CSS: no shadows, no gradients, no pure white outside
the print stylesheet, no heading above weight 500. Curves are 1000px on pills,
16px on cards, 32px on hero and panels.

The glass is Snow White at 0.74 alpha with a 20–30px blur. That reads **6.7:1
against Forest Depths even over pure black**, so hero legibility never depends on
the photograph behind it.

### Still to do

- Replace the stock hero photography with photographs of Woodside Ranch itself.
- Post minutes for 2020 and 2022–2026, plus board minutes and treasurer's reports.
  The documents page says plainly that they are missing rather than hiding the gap.
