# Redesign decision

Chosen on 2026-11-24 from `design/previews/index.html`.

| Area | Pick | Notes |
| --- | --- | --- |
| Landing | **B · Receipt** | Left-aligned poster headline, tilted torn receipt with per-person shares as evidence, the single lime "Paid" stamp, "how it works" as a WhatsApp thread, one closing CTA. |
| Session detail | **B · Queue and receipt** | Outstanding amount + one-segment-per-person bar, then "Check these proofs" and "Still owes" with inline actions; paid people collapse to one row; bill as a torn receipt in a second column on desktop, after the queue on mobile. |
| Logo | **B · Torn ticket** | Not named explicitly by the user; taken from the recommendation. Easy to swap. |

## Fixes carried over from the preview review

- Landing B: hero tracking relaxed to about -0.055em (the -0.07em preview crushed "paid."), satay moved clear of the receipt total.
- Session B mobile: headers must not wrap their action buttons into two lines; the bottom tab bar must not cover list content (pad the page by the bar height plus safe area); the "message not delivered" warning icon sits inline with its text.
- The mobile tab bar's raised "New" button overlapped content in the preview; in the app it sits inside the bar.

## Rules that follow from the pick

- The perforated receipt edge is the product's one decorative signature. It appears on bill breakdowns (session detail, payment page, new-session running total), the logo and OG images. Nowhere else.
- Lime appears once per screen at most: the Paid stamp (landing hero, payment page when paid, session detail when fully settled).
- Coral is for the primary action and money still owed. Ink fills are for secondary-strong actions (Approve, Send again).
