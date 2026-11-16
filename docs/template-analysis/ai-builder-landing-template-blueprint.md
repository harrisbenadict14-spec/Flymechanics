# Template analysis and blueprint: "product landing page" reference

Status: analysis only. Nothing here is built, and no project content has been added.
Source: one public product landing page of a website-builder company (the "reference site"), inspected on desktop (1440 px wide) and on a phone (375 px wide), plus its global header, mega-menu and footer.

**Rules followed in this document**
- The reference site's wording, logo, imagery, product names and brand identity are not reproduced. Every piece of content is a neutral placeholder in `[Square Brackets]`.
- Layout, spacing, colour values, type sizes and timings are measured facts about the page and are kept, because a template needs them. The reference's licensed typeface is not named; use a substitute (see 3.2).
- Anything marked **REPLACE** is a field that will later take your project's data, branding, text, images or functionality.

**Scope**
The link is a single page of a very large site. This document covers that page in full. The site's other pages are known only from the navigation they hang off (section 1.2); they were not opened, so they are listed as destinations, not analysed. Any of them can be analysed on request.

---

## 1. Website structure

### 1.1 Purpose of the analysed page
A single-product marketing landing page. Its job is to explain one capability, answer objections, and send every visitor to one action: start a free trial. It is a "one page, one conversion" template, longer than a home page, made of stacked full-width bands.

### 1.2 Pages reachable from the global chrome (destinations only, not analysed)
| Group | What it contains (generic) | Where it appears |
|---|---|---|
| Products mega-menu | ~25 product/feature pages in 5 groups (build, sell, market, domains/email, "all features") plus 3 promo tiles | Header |
| Solutions mega-menu | 9 industry hubs, each with 5-6 sub-pages (drill-down on phone) | Header |
| Resources mega-menu | Help, forum, learning, expert hiring, developer docs, status | Header and footer |
| Pricing | One page | Header |
| Log in / account | Dashboard, domains, log out (dropdown) | Header |
| Start page | The single conversion destination | Every CTA |
| Company | About, careers, brand, accessibility, newsroom, press, contact | Footer |
| Legal | Terms, privacy, data privacy, regional legal, security, sitemap | Footer bottom |
| Social | 5 networks | Footer |
| Locale sites | 8 language versions of the same page | Footer |

### 1.3 Navigation map
- **Primary (global header, 80 px):** logo left; three menu triggers (`[Menu A]`, `[Menu B]`, `[Menu C]`) opening full-width mega-menus; a pricing link; Log in; an account dropdown (when signed in); one primary button `[Primary CTA]` at the far right. Transparent over the hero, solid when scrolled.
- **Secondary (sticky in-page sub-navigation):** a centred pill of 4-5 anchor links (`[Section 1]` ... `[FAQ]`). It sits below the hero, then sticks to the top of the screen. When stuck, a "mini header" appears around it: product label on the left, `[Primary CTA]` on the right. The active anchor is highlighted as the page scrolls.
- **Footer navigation:** 5 columns of links under small headings, a "follow" group, locale switcher, legal row.
- **Fixed offer bar:** a floating dark pill at the bottom of the screen: `[Offer Chip]` + `[Offer Text]` + `[Offer End Date]` with an info icon.
- **Mobile-only:** a fixed full-width `[Primary CTA]` bar pinned 16 px from the bottom.

### 1.4 Calls to action and conversion path
- One destination for every button. CTA labels repeat 7 times down the page (hero, sub-nav mini header, intro, technology, how-to, conversion band, mobile bar), so a CTA is always within one scroll.
- Path: `Landing > [Primary CTA] > Start page > (account creation, outside this page)`.
- Secondary paths: support cards (`[Help Link]`, `[Learning Link]`), footer, pricing.

### 1.5 Forms and interactive components on the page
- No real form. The page contains **demo UI inside cards** (a search field with suggestion list, a prompt box with option chips, a typing animation, a fake editor), all decorative. Keep them as "product preview" components, not forms.
- Real interactive controls: FAQ accordion (10 items), sub-nav anchors, mega-menus, language switcher, offer bar.

### 1.6 Section order (top to bottom, desktop height about 8,600 px)
| # | Section | Approx. height |
|---|---|---|
| 0 | Fixed offer bar (overlay) | n/a |
| 1 | Global header | 80 |
| 2 | Hero (full viewport) | 900 |
| 3 | Sticky sub-navigation | 70 |
| 4 | Intro band: statement + CTA + badge + 4-card grid | ~1,420 |
| 5 | Capability band: statement + CTA + 4-card grid | ~1,370 |
| 6 | How-it-works band: statement + CTA + 4 numbered step cards | ~1,670 |
| 7 | FAQ | ~1,120 |
| 8 | Support band: heading + 2 link cards | ~540 |
| 9 | Conversion band: giant headline + note + CTA + framed device asset | ~460 |
| 10 | Footer | ~730 |

Bands 4-6 share one continuous dark background (`#1A1A1A`); the hero has a full-bleed image behind it; 7-10 sit on pure black.

---

## 2. Layout and component system

### 2.1 Page wireframe (desktop, 12-column feel)

```
[ Header 80px: logo | menu A  menu B  menu C | pricing  login | [Primary CTA] ]
+--------------------------------------------------------------------------+
| HERO 100vh, full-bleed [Image/Video] + dark gradient                     |
|  floating [Image A]   floating [Swatch card]        floating [Image B]   |
|                  [Eyebrow]                                               |
|            [Hero Heading, 2 lines, centred]                              |
|                  [Primary CTA]                                           |
|  floating [Image C]                       floating [UI card: options]    |
|                  (sub-nav pill appears here, sticks on scroll)           |
+--------------------------------------------------------------------------+
| BAND 1 (dark)                                                            |
|  [Heading, left 40%]            [Supporting Text, right]  [Primary CTA]  |
|  [Badge/Award row]                                                       |
|  +--------------------------+  +-----------------------------+           |
|  | CARD 1 tall (593px)      |  | CARD 2 (395px)              |           |
|  +--------------------------+  +-----------------------------+           |
|  | CARD 3 (395px)           |  | CARD 4 tall (593px)         |           |
|  +--------------------------+  +-----------------------------+           |
+--------------------------------------------------------------------------+
| BAND 2 (same pattern, new content)                                       |
| BAND 3: heading + CTA, then 2x2 numbered step cards                      |
+--------------------------------------------------------------------------+
| FAQ: [Heading] (left 1/3)      | accordion rows (right 2/3, 660px)       |
+--------------------------------------------------------------------------+
| SUPPORT: [Heading]   [Outlined card 1]   [Outlined card 2]               |
+--------------------------------------------------------------------------+
| CONVERSION: [Giant Heading, centred] [Note] [Primary CTA]                |
|             [Device frame with [Image/Video], warm glow behind, fade-out]|
+--------------------------------------------------------------------------+
| FOOTER: logo + [Tagline] | 5 link columns | locale | legal               |
+--------------------------------------------------------------------------+
```

### 2.2 Component catalogue

**A. Fixed offer bar (announcement)**
- Layout: pill, centred near the bottom, about 740 px wide, 56 px tall, dark translucent (`~#1A1A1A` at 90%), 28 px radius. Left: blue chip (`#0072F0`, white text). Middle: text. Right: muted date.
- Desktop: floating over content, above the mobile bar. Mobile: full width minus 16 px margin, chip shortened to `[Chip]`.
- Fields: `[Offer Chip]`, `[Offer Text]`, `[Offer Date]`, dismiss/info behaviour. **REPLACE or REMOVE.**

**B. Global header**
- 80 px tall, logo left (about 28 px mark), triggers right of centre, CTA at far right. Transparent over the hero with white text; turns solid black after scrolling past the hero.
- Mega-menu: full-width panel under the header, 3-4 columns of links with small headings plus a promo tile column; opens on hover/click, closes on outside click or Esc.
- Mobile: hamburger at right; full-screen menu with accordion groups; solutions drill down to a second level with a "Back" row.
- Fields: `[Logo]`, `[Menu A/B/C labels + links]`, `[Primary CTA]`, `[Login Link]`. **REPLACE.**

**C. Hero (full-bleed, layered)**
- 100vh. Background: one large `[Image/Video]` with a soft vertical gradient to dark at the bottom (so the first band joins seamlessly).
- Centre stack, vertically centred (~25% from top): eyebrow (serif, 20 px) > H1 (72 px, light) > CTA (white, 60 px tall).
- Four to five **floating cards** around the edges, partly cropped by the viewport: three photo cards and two UI cards (a colour-swatch strip; a small "options" panel). They are decorative and sit in the corners, 8 px radius, translucent grey fill with blur.
- Desktop: cards keep to the corners and overlap the headline area only at the edges. Mobile: cards shrink and cluster top-left and bottom; headline drops to 46 px and wraps to 4 lines.
- Fields: `[Eyebrow]`, `[Hero Heading]`, `[Primary CTA]`, `[Hero Background Image/Video]`, `[Floating Image A/B/C]`, `[UI Card Content]`. **REPLACE.**

**D. Sticky sub-navigation pill**
- Sits at the bottom of the hero, about 560 px wide, 47 px item height, 100 px radius, fill `rgba(26,26,26,0.7)` with background blur. Items 16 px, 12/16 px padding; hover/active = lighter fill; 0.15 s colour transition.
- Behaviour: becomes `position: sticky; top: 0` after the hero. A thin mock header (product label left, CTA right) fades in around it, so the visitor keeps a CTA while reading.
- Mobile: collapses into a single dropdown button showing the current section name with a chevron; tapping opens a list of anchors.
- Fields: `[Anchor 1..5 labels]`, `[Product Label]`, `[Primary CTA]`. **REPLACE.**

**E. Section header (statement + CTA)**
- Two columns: heading (40 px) in the left ~40%; supporting paragraph (15-18 px) and CTA in the right column, top-aligned with the heading's first line. Optional badge row beneath the heading (small award mark + one line of text).
- Spacing: about 120 px above, 64-80 px below before the card grid.
- Mobile: one column in this order: heading (26 px) > paragraph > CTA (full width, 60 px) > badge.
- Fields: `[Section Heading]`, `[Supporting Text]`, `[Primary CTA]`, `[Badge Image]`, `[Badge Text]`. **REPLACE.**

**F. Feature card grid ("bento")**
- Two columns, 40 px outer padding, **16 px gap**, 8 px radius, `overflow: hidden`. Cards alternate tall (593 px) and short (395 px) so the two columns interlock like a staggered mosaic. Text is overlaid at the top-left, 32 px padding, max 430 px wide; the asset (photo or UI mock) fills the whole card and bleeds to the edges.
- Card anatomy: title (20 px, 500) > body (15 px, 500, 21 px line height) > asset. Some cards hold live-looking UI (search box with suggestion list, prompt box with chips, progress "typing" pill, mini editor).
- Desktop: 2 columns. Mobile: 1 column, 343 px wide, cards 500 px tall, 16 px gap, 16 px side padding.
- Hover: very subtle; the cards are not links. Text is always visible.
- Fields per card: `[Card Title]`, `[Card Description]`, `[Card Image/Video/UI Demo]`. Four cards per band. **REPLACE.**

**G. Numbered step cards**
- Same card chrome as F, in a 2x2 grid, each with `[Step N: Step Title]`, `[Step Description]` and an asset below (photo, form mock, page mock).
- Mobile: stacked, one per row.
- Fields: `[Step Title]`, `[Step Description]`, `[Step Asset]`. **REPLACE.**

**H. FAQ accordion**
- Two columns: heading (40 px, left) and the list (right, 660 px wide). Each row 88 px tall closed: question 16 px, plus/minus icon at the right, 32 px vertical padding, a thin divider line between rows. One open at a time is not enforced.
- Open: answer slides down (about 0.3-0.5 s, expo-out), plus rotates to minus.
- Mobile: heading above, list full width.
- Fields: `[FAQ Heading]`, `[Question n]`, `[Answer n]` (10 pairs). **REPLACE.**

**I. Support cards**
- Heading `[Support Heading]` then two outlined cards side by side (653 px each, 299 px tall, 1 px border `#5A5A5A`, 8 px radius, 30 px padding): title, one line, arrow icon pinned bottom-right. Hover: border/arrow brighten.
- Mobile: stacked.
- Fields: `[Card Title]`, `[Card Text]`, `[Link]`. **REPLACE.**

**J. Conversion band**
- Centred giant headline (72 px, light), a one-line note (small, muted), CTA button, then a large device-framed `[Image/Video]` rising from the bottom edge. A warm radial glow sits behind it and a gradient fades the device into the footer.
- Mobile: headline 46 px, device scaled to full width.
- Fields: `[Closing Heading]`, `[Reassurance Note]`, `[Primary CTA]`, `[Device Screenshot/Video]`. **REPLACE.**

**K. Footer**
- Pure black, 40 px side padding. Left: logo and `[Tagline]` (large). Right: five columns of links (group headings small and muted, links 16 px white), then a "follow" list. Bottom row: locale switcher, small legal links, copyright, accreditation badge on the left.
- Mobile: columns stack; each group becomes a collapsible or a simple list.
- Fields: `[Logo]`, `[Tagline]`, `[Link Group n]`, `[Social Links]`, `[Legal Links]`, `[Locale Options]`, `[Badge]`, `[Copyright]`. **REPLACE.**

**Not present on this page (available as optional modules):** logo strip, testimonials, pricing blocks, modal pop-ups. The offer bar is the only pop-up-like element. If your project needs them, they would be added as new components in the same card style.

---

## 3. Visual design system

### 3.1 Mood
Premium, quiet, editorial. Dark canvas, generous negative space, photography and UI mock-ups as the colour, a single white call to action as the only strong object. Nothing decorative beyond images.

### 3.2 Typography
| Role | Size / weight / tracking / line height | Notes |
|---|---|---|
| Hero H1, closing H | 72 px / 300 / -5% (about -3.6 px) / 1.04 | Light weight, tight tracking, centred. 46 px on phone. |
| Section heading (H2) | 40 px / 400 / -4% (-1.6 px) / 1.08 | 26 px on phone. |
| Card title (H3) | 20 px / 500 / -1% (-0.2 px) / 1.2 | |
| Eyebrow | 20 px / 400 / -1% / 1.2 | Set in a serif; the only serif use. |
| Body | 15 px / 500 / about 0 / 1.4 | Medium weight for legibility on dark. |
| Body large (intro paragraph) | 16-18 px / 400 / 1.5 | |
| Button / nav label | 14 px / 500 / uppercase / 14 px line | |
| Footer link | 16 px / 400 | |

Font choice: a refined geometric/grotesque sans with a true light (300) weight, plus one serif for eyebrows. **REPLACE** with your brand fonts; open substitutes with similar feel: a geometric sans with weights 300-500 and an editorial serif at 400.

### 3.3 Colour
| Token | Value | Use |
|---|---|---|
| `--surface-1` | `#1A1A1A` | Main band background (bands 4-6) |
| `--surface-0` | `#000000` | FAQ, support, conversion, footer |
| `--text` | `#FFFFFF` | All text on dark |
| `--text-muted` | `#898989` | Dates, small labels, footer group headings |
| `--line` | `#5A5A5A` | 1 px borders on outlined cards |
| `--gray-200` | `#DDDDDD` | Light UI parts inside mock-ups |
| `--shade-white-50 / 100` | `rgba(255,255,255,0.08 / 0.12)` | Hover fills, card tint |
| `--accent` | `#0072F0` | Offer chip only |
| `--focus` | `#087BB5` | Focus ring |
| Button fill | `#FFFFFF` on text `#000000` | Primary CTA |
**REPLACE** all with your palette; keep the roles (two surface blacks, one muted grey, one hairline, one accent used sparingly).

### 3.4 Spacing, grid and shape
- Outer gutter: 40 px desktop, 16 px phone. Gap between cards: 16 px. Column grid: 12 columns, 40 px gutter (derived: (viewport - 520) / 12 per column).
- Vertical rhythm between bands: about 120-160 px desktop, 80 px phone. Hero is exactly 100vh.
- Radius: cards 8 px, buttons 4 px, pills 100 px, floating cards 8 px. Shadows: essentially none (flat, separation by value and border).
- Imagery: full-bleed inside cards, no borders, soft natural light, muted earthy palette; dark gradient overlays only where text sits over a photo.

### 3.5 Buttons
- **Primary:** 60 px tall, padding 23/28 px, white fill, black uppercase 14 px/500, 4 px radius, hover swaps to inverse (dark fill, white text) over 0.2 s.
- **Pill / nav item:** 47 px, 100 px radius, transparent, white text, hover fill lightens over 0.15 s.
- **Outlined card:** acts as a button; border brightens on hover.
- Focus: visible ring in `--focus`.

---

## 4. Animation and interaction guide

The page uses **CSS transitions and scroll-linked effects only**. No page-transition system and no keyframe animations were found. Recommended timings, taken from what was measured:

| Interaction | Duration | Easing | Notes |
|---|---|---|---|
| Button / link colour change | 0.15-0.2 s | `cubic-bezier(0.645, 0.045, 0.355, 1)` | ease-in-out cubic |
| Fades and background blur changes | 0.3 s | `cubic-bezier(0.455, 0.03, 0.515, 0.955)` | ease-in-out sine |
| Menu panels, accordion, card content entering | 0.5-0.7 s | `cubic-bezier(0.165, 0.84, 0.44, 1)` | expo-out: fast start, long settle |
| Staggered children | 0.25 s steps | same expo-out | one element at a time |

- **Sticky sub-nav:** position sticky; mock header fades in around it once it sticks.
- **Hero:** background image is static; floating cards are static in the snapshot but are layered for a gentle depth feel (parallax movement of 10-30 px on scroll is consistent with the layout; keep optional).
- **Scroll reveals:** card assets and demo UI states start when the card enters the viewport (typing animation, progress pill, option chips cycling). Treat these as "play once when visible".
- **Loading:** no skeleton or spinner pattern; images use an instant dark placeholder and fade in over about 0.3 s.
- **Hover on cards:** none required; images are not links.
- **FAQ:** height animates open; icon cross-fades plus to minus (0.2-0.3 s).
- **Reduced motion:** disable parallax and demo animations; keep fades.

---

## 5. Content model (all neutral)

| Section | Content type | Placeholder |
|---|---|---|
| Offer bar | chip, short text, date | `[Offer Chip]` `[Offer Text]` `[Offer Date]` |
| Header | logo, link labels, CTA | `[Logo]` `[Menu Item 1..n]` `[Primary CTA]` `[Login Link]` |
| Hero | eyebrow, H1, CTA, background media, 3 floating images, 2 UI cards | `[Eyebrow]` `[Hero Heading]` `[Primary CTA]` `[Hero Image/Video]` `[Floating Image A-C]` `[UI Card 1-2]` |
| Sub-nav | 4-5 anchor labels, product label | `[Anchor 1..5]` `[Product Label]` |
| Band 1 header | H2, paragraph, CTA, badge | `[Section Heading]` `[Supporting Text]` `[Primary CTA]` `[Badge Image]` `[Badge Text]` |
| Band 1 cards x4 | title, description, media or UI demo | `[Card Title]` `[Card Description]` `[Card Image/Video]` |
| Band 2 header + cards x4 | same | same |
| Band 3 header + steps x4 | H2, CTA, step title, step description, media | `[Step Title]` `[Step Description]` `[Step Image]` |
| FAQ | heading, 10 Q&A pairs | `[FAQ Heading]` `[Question]` `[Answer]` |
| Support | heading, 2 cards | `[Support Heading]` `[Card Title]` `[Card Text]` `[Link]` |
| Conversion | headline, note, CTA, device media | `[Closing Heading]` `[Note]` `[Primary CTA]` `[Device Image/Video]` |
| Footer | logo, tagline, 5 link groups, social, locales, legal, copyright, badge | `[Logo]` `[Tagline]` `[Link Group 1-5]` `[Social]` `[Locales]` `[Legal]` `[Copyright]` |

---

## 6. Implementation-ready blueprint

### 6.1 Page outline (reusable template)
1. `OfferBar` (optional, fixed bottom)
2. `Header` + `MegaMenu` (+ `MobileMenu`)
3. `HeroLayered` (full-bleed media, centred stack, floating cards)
4. `SubNav` (sticky pill, anchors, mini header)
5. `Band` x3: `SectionHeader` + `CardGrid` (bento) or `StepGrid`
6. `Faq`
7. `SupportCards`
8. `ConversionBand` (giant heading, CTA, framed media)
9. `Footer`
10. `MobileCtaBar` (fixed bottom, mobile only)

### 6.2 Component library (suggested props)
- `Button({ label, href, variant: 'primary' | 'pill' | 'outline' })`
- `Pill({ items, activeId })`
- `Card({ title, body, media, size: 'tall' | 'short', overlay })`
- `CardGrid({ cards[], columns: 2 })` (staggered heights)
- `SectionHeader({ heading, text, cta, badge })`
- `Accordion({ items: { q, a }[] })`
- `Footer({ groups[], social[], legal[], locales[] })`
- `MegaMenu({ groups[], promos[] })`

### 6.3 Style guide (tokens to define first)
Colours (3.3), type scale (3.2), spacing (outer 40/16, gap 16, band rhythm 120/80), radii (4/8/100), easings (4), breakpoints (single break at about 820 px: grid to one column, H1 72 to 46, H2 40 to 26, header to hamburger, sub-nav to dropdown, fixed CTA bar on).

### 6.4 Mobile adaptation notes
- Header becomes hamburger; menus open full screen with accordion groups and a Back row for second levels.
- Hero: H1 46 px (4 lines), CTA stays 166 px wide, floating cards shrink and sit at the edges.
- Sub-nav pill becomes a dropdown.
- Bands: header stacks (heading, paragraph, CTA full width, badge). Cards one column at 500 px tall, 16 px gutters.
- FAQ: heading above list. Support cards stack.
- Conversion band: headline 46 px; device scales to full width.
- Fixed `[Primary CTA]` bar appears 16 px above the bottom; the offer bar moves above it.

### 6.5 Fields to replace later (checklist)
| Group | Fields | Replace with |
|---|---|---|
| Brand | logo, tagline, fonts, colours, accent | Your identity |
| Navigation | menu labels and links, login, CTA label and target | Your pages |
| Copy | every heading, paragraph, card text, FAQ pair, support text, note | Your text |
| Media | hero media, floating images, card media, step media, device media, badge | Your images/video |
| Functionality | CTA destination, offer bar, locale switcher, any demo UI inside cards | Your flows (form, booking, etc.) |
| Legal / footer | link groups, legal links, copyright, badges | Your details |

---

## 7. Next step
This is the end of the analysis stage. I am waiting for your project details: brand content, text, images, and what you want built. I have not started adapting or building anything.
