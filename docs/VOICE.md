# Letpai voice

Letpai talks like the friend who booked the table and is now, politely,
collecting. Short, warm, specific about money. English everywhere.

## Rules

1. **Say the amount.** "Rp 68.145 still to pay", not "You have an outstanding balance".
   Use `formatIDR` so amounts always read `Rp 1.176.915`.
2. **Name the person.** "Reminder sent to Citra", not "Reminder sent successfully".
3. **Lead with the action or the result.** Buttons are verbs: *Approve*, *Send back*,
   *Remind*, *Send again*, *Copy*. Never *Submit*, *OK* or *Click here*.
4. **One idea per sentence, no exclamation marks** except in a celebration
   ("All settled.").
5. **Errors say what happened and what to do next.** "That number isn't on
   WhatsApp. Check it and send again." Never just "Error" or a code.
6. **No blame, no nagging.** Participants are guests. "Needs a new proof", not
   "Rejected". Hosts "send back" a proof; they don't "reject" a friend.
7. **No filler words.** Cut *simply*, *just*, *easily*, *seamlessly*, *effortlessly*.
8. **No emoji in the UI.** Icons are Lucide.

## Status words

| State (API) | Host sees | Participant sees |
| --- | --- | --- |
| `pending` | Not paid | Not paid yet |
| `submitted` | Check proof | Proof sent |
| `paid` | Paid | Paid |
| `rejected` | Sent back | Needs a new proof |
| session `draft` | Draft | — |
| session `active` (legacy `pending`, `in_progress`) | Collecting | — |
| session `completed` | Settled | — |
| session `cancelled` | Cancelled | — |

The mapping lives in `src/lib/utils/status.ts`; use it instead of writing labels inline.

## Examples

| Instead of | Write |
| --- | --- |
| Split bills effortlessly with friends | You paid. They pay you back. |
| Session created successfully! | Session created. Add the people next. |
| Payment approved | Bima's payment is approved. |
| Reject payment | Send back |
| Rejection reason | What should they fix? |
| Notifications sent: 12/12 | Sent to all 12 people on WhatsApp. |
| Rate limit exceeded | You can remind Kirana again in 6 hours. |
| Failed to load | We couldn't load your sessions. Try again. |
| No data found | No sessions yet. Start one after your next dinner. |
| Upload proof of payment | Upload your transfer screenshot |
| Your payment has been rejected | Raka needs a new screenshot: "The amount is cut off." |
| Delete contact? This action cannot be undone. | Delete Alya from contacts? Sessions she's in stay as they are. |
