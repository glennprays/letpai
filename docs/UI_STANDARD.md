# Letpai UI Standards

Design reference for all pages (login, register, dashboard, etc.) to stay consistent with the landing page.

---

## Font

**Plus Jakarta Sans** — import once in your root layout or global CSS.

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

| Role | Weight | Size guidance |
|---|---|---|
| Page / section heading | 800 | `clamp(26px, 3vw, 38px)` |
| Card title | 800 | `17–20px` |
| Body text | 400 | `14–17px`, line-height `1.65` |
| Label / eyebrow | 700 | `11–12px`, `letter-spacing: 0.1em`, uppercase |
| Nav / button | 600–700 | `14–15px` |

---

## Colors

```
--coral:        #FF6B6B   (primary action, hover: #ff5252)
--teal:         #14B8A6   (secondary accent)
--ink:          #111827   (headings, dark backgrounds)
--body:         #6B7280   (body text)
--muted:        #9CA3AF   (labels, placeholders)
--border:       #F0F0F0   (card borders)
--border-hover: #F3F4F6   (nav border)
--surface:      #FAFAFA   (section backgrounds)
--white:        #FFFFFF
--footer-bg:    #0F172A
--footer-mid:   #1E293B
--footer-text:  #64748B
```

Coral shadow (use on coral buttons): `box-shadow: 0 4px 14px rgba(255,107,107,0.35)`

---

## Spacing

| Token | Value | Use |
|---|---|---|
| `--page-max` | `1200px` | `max-width` on all page containers |
| `--page-px` | `24px` | Horizontal padding on all sections |
| `--section-py` | `72–80px` | Vertical padding per section |
| `--card-p` | `28px` | Card internal padding |
| `--card-radius` | `20px` | Card border-radius |
| `--gap-cards` | `16px` | Gap between cards in a grid |

---

## Components

### Nav / Header
- Sticky, `height: 64px`
- `background: rgba(255,255,255,0.9)`, `backdrop-filter: blur(12px)`
- `border-bottom: 1px solid #F3F4F6`
- Logo: `22px / 800 / #111827 / letter-spacing: -0.02em`
- Links: `14px / 500 / #4B5563`, hover `#111827`

### Buttons

**Primary (coral pill)**
```css
background: #FF6B6B;
color: #fff;
font-weight: 700;
font-size: 15px;
padding: 13px 28px;
border-radius: 100px;
border: none;
box-shadow: 0 4px 14px rgba(255,107,107,0.35);
transition: background 0.15s, transform 0.12s, box-shadow 0.15s;

/* hover */
background: #ff5252;
transform: translateY(-1px);
box-shadow: 0 6px 20px rgba(255,107,107,0.4);
```

**Secondary / ghost**
- `background: transparent`, `border: 1.5px solid #F0F0F0`
- Same border-radius, same font, color `#6B7280`, hover border `#FF6B6B`

**Destructive** — same shape, `background: #EF4444`, hover `#DC2626`

### Input / Form Fields
```css
border: 1.5px solid #F0F0F0;
border-radius: 12px;
padding: 12px 16px;
font-size: 15px;
font-family: inherit;
color: #111827;
background: #fff;
transition: border-color 0.15s, box-shadow 0.15s;

/* focus */
border-color: #FF6B6B;
box-shadow: 0 0 0 3px rgba(255,107,107,0.12);
outline: none;
```

Label: `13px / 600 / #374151`, `margin-bottom: 6px`  
Helper / error: `12px / #9CA3AF` or `#EF4444`

### Cards
```css
background: #fff;
border: 1.5px solid #F0F0F0;
border-radius: 20px;
padding: 28px;
transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;

/* hover */
border-color: #FF6B6B;          /* or #14B8A6 for teal variant */
box-shadow: 0 8px 32px rgba(255,107,107,0.1);
transform: translateY(-2px);
```

### Icon Bubble
```css
width: 48px; height: 48px;
border-radius: 14px;
display: flex; align-items: center; justify-content: center;
/* background: --coral or --teal */
```

### Badge / Status pill (inline)
```css
display: inline-flex; align-items: center; gap: 8px;
padding: 6px 14px;
border-radius: 100px;
font-size: 12px; font-weight: 600;

/* Coral tint (default) */
background: #FFF5F5; border: 1px solid #FFD5D5; color: #FF6B6B;

/* Green (success / paid) */
background: #DCFCE7; color: #16A34A;

/* Red (pending / error) */
background: #FEF2F2; color: #EF4444;
```

### Eyebrow label (section overline)
```css
font-size: 12px;
font-weight: 700;
letter-spacing: 0.1em;
text-transform: uppercase;
color: #9CA3AF;
margin-bottom: 12px;
```

---

## Page layout patterns

### Auth pages (login / register)
Center a single card on a `#FAFAFA` background:
```
full-height flex column
  ├── Nav (same sticky header, simpler — logo only or logo + one link)
  └── main: flex-1, flex, align+justify center
        └── card: max-width 420px, padding 40px, border-radius 24px,
                  border 1.5px solid #F0F0F0, box-shadow 0 20px 60px rgba(0,0,0,0.06)
```

### Dashboard / app pages
```
full-height flex row
  ├── Sidebar: width 240px, background #0F172A, padding 24px
  └── main content: flex-1, padding 32px, background #FAFAFA
        └── max-width 1200px sections
```

### Section container (reuse across all pages)
```html
<section style="padding: 72px 24px;">
  <div style="max-width: 1200px; margin: 0 auto;">
    ...
  </div>
</section>
```

---

## Motion

| Pattern | Value |
|---|---|
| Standard transition | `0.15–0.2s ease` |
| Button lift | `transform: translateY(-1px)` on hover |
| Card lift | `transform: translateY(-2px)` on hover |
| Page entrance | `opacity 0 → 1` + `translateY(24px → 0)`, easing `cubic-bezier(0.22,1,0.36,1)`, duration `0.55s` |
| Stagger delay step | `0.08s` per element |

---

## Footer

Always use the shared footer: dark `#0F172A` background, `3px` coral-to-teal gradient top line, 4-column grid (brand + 3 nav groups), bottom bar with copyright + "Made in Singapore".

```
footer
  ├── accent line: height 3px, background linear-gradient(90deg, #FF6B6B, #14B8A6)
  └── container: max-width 1200px, padding 56px 24px 0
        ├── grid: 2fr 1fr 1fr 1fr, gap 48px
        │     ├── Brand col: logo (22px/800/white), tagline, status pill
        │     ├── Product links
        │     ├── Company links
        │     └── Legal links
        └── bottom bar: border-top 1px solid #1E293B, copyright left, country right
```

Footer link style: `14px / #9CA3AF`, hover `#F9FAFB`  
Footer heading style: `11px / 700 / uppercase / #4B5563 / letter-spacing 0.1em`
