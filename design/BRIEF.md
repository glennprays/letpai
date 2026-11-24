# Letpai redesign brief

## Who and when

**Host** (18–30, Jakarta/Bandung/Surabaya). Paid for the group on a card or
QRIS, now wants the money back without nagging friends in the group chat.
Opens Letpai on a phone, usually at night after the event or the next morning.

**Participant.** Gets a WhatsApp message with a link. Has never heard of
Letpai, will not install anything, and wants to know three things: how much,
to which account, and how to prove it.

## Primary scenario

> Friday, 9pm. Raka paid Rp 1.176.915 for dinner with 12 people. He opens the
> session. Without scrolling past unrelated content he can see that
> Rp 726.465 is still out, that two people sent proofs (approve both), that
> one proof was rejected, and that Indra's WhatsApp message never arrived
> (retry). He reminds Citra, who has not paid and is outside the cooldown.

Observable outcome: approve 2 proofs, retry 1 notification and send 1
reminder from the top of the session screen, on a 375px phone, in under a
minute.

## Content priorities

| Screen | Must see first | Supports the decision | On demand |
| --- | --- | --- | --- |
| Landing | What it does in one line, and that friends need no app | A real-looking session with statuses; how the WhatsApp message looks | Details, legal |
| Dashboard | Total still owed to me, across how many people | Sessions that need action (proofs waiting, unpaid) | Completed and cancelled sessions |
| Session detail | Collected vs total; proofs waiting for review | Who still owes and whether their message arrived | Bill breakdown, bank accounts, receipt photos, edit |
| Payment page | My amount and where to transfer (copyable) | What the amount is made of | Receipt photos, host's note |
| New session | Name, then people, then items | Running total per person | Fees, bank accounts |

## Sample dataset (from `tests/fixtures/data.ts`)

Session "Friday dinner at Sate Khas Senayan with the design team and their
plus-ones", 12 participants, 5% service, 10% tax, two transfer accounts
(BCA, GoPay).

| Person | Status | Share | WhatsApp |
| --- | --- | --- | --- |
| Alya Kusuma | paid | Rp 177.870 | delivered |
| Bima Santoso | proof submitted | Rp 177.870 | delivered |
| Citra Wulandari Ningsih Kartika | pending | Rp 177.870 | delivered |
| Dimas Arya | rejected | Rp 98.145 | delivered |
| Eka Putra | paid (marked by host) | Rp 68.145 | delivered |
| Fajar Nugroho | pending | Rp 68.145 | retrying |
| Gita Ramadhani | proof submitted | Rp 68.145 | delivered |
| Hana Lestari | paid | Rp 68.145 | delivered |
| Indra Wijaya | pending | Rp 68.145 | not delivered |
| Joko Susilo | paid | Rp 68.145 | delivered |
| Kirana Dewi | pending | Rp 68.145 | delivered |
| Lukas Hartono | paid | Rp 68.145 | delivered |

Collected Rp 450.450 of Rp 1.176.915 (5 of 12 paid). Outstanding Rp 726.465.

## Constraints

- Palette: navy ink on a cool fog canvas, white cards, navy-tinted shadows,
  flat colour only. Coral is the single accent (primary action, money still
  owed). Lime appears at most once per screen, as the "Paid" stamp.
- Type: Bricolage Grotesque (display, amounts, tabular figures) and Plus
  Jakarta Sans (UI). Both self-hosted; CSP is `font-src 'self'`.
- No backend changes. Every element above maps to an existing field.
- Lucide icons in UI, flat custom SVG for illustration only, no emoji.
