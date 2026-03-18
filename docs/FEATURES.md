# Letpai - Feature Specifications

## MVP Features (v1.0)

### 1. Authentication System

**Login:**
- WhatsApp number + password authentication
- Session-based login (JWT/cookie)
- Remember me option (7/30 days)

**Registration:**
- WhatsApp number + password
- OTP verification (via WhatsApp gateway SDK)
- Phone number validation
- Password strength requirements

---

### 2. Session Management

**Session Entity:**
- `session_id` - Unique identifier
- `host_id` - Reference to user (host)
- `session_name` - Flexible name/title (e.g., "Makan Siang", "Liburan Bali")
- `session_description` - Optional description
- `created_at` - Timestamp
- `status` - `active` | `completed` | `cancelled`

**Requirements:**
- Every bill split must be attached to one session
- Host can create multiple sessions
- Each session is independent

---

### 3. Person/Contact Management

**Person Entity:**
- `person_id` - Unique identifier
- `user_id` - Owner (who saved this contact)
- `name` - Person's name
- `whatsapp_number` - WhatsApp number (unique per user)
- `created_at` - Timestamp
- `updated_at` - Last modified

**Contact Import Flow:**
1. User clicks "Add from contacts"
2. System shows user's saved contact list (NOT all contacts)
3. User selects specific contacts to add
4. Selected contacts are added to session
5. **NOT** dumping all contacts (privacy & UX)

**Manual Input:**
- Input name + WhatsApp number manually
- Validation: Phone number format, required fields
- Optional: Save to saved contacts list

**Saved Contact List:**
- View all saved contacts
- Add new contact
- Edit existing contact (name, phone)
- Delete contact
- Select multiple contacts to add to session

**Terminology:**
- Use "Contact" or "Person" (NOT "buddy", "friend", etc.)
- "Contacts" is clear and familiar (WhatsApp uses "Contacts")

---

### 4. Bill Splitting System

**Bill Types:**

**A. Equal Split (Divide Equally)**
- Single amount divided by all participants in session
- Example: Total 500,000, 4 people = 125,000 per person
- System auto-calculates share amount

**B. Specific Bill (Individual Charges)**
- Bill assigned to specific person(s)
- Example: "Rian beli bensin: 50,000" → only Rian pays 50,000
- Can be assigned to multiple people (split among specific subset)

**Bill Item Entity:**
- `bill_item_id` - Unique identifier
- `session_id` - Reference to session
- `name` - Bill item name (e.g., "Makan siang", "Bensin")
- `description` - Optional details
- `amount` - Amount (e.g., 500,000)
- `currency` - Currency code (default: IDR/IDR)
- `type` - `equal_split` | `specific_person`
- `assigned_to` - Array of person_ids (for specific bills)
- `created_at` - Timestamp

---

### 5. Multi-Currency Support

**Currencies:**
- Default: IDR (Indonesian Rupiah)
- Supported currencies: IDR, USD, EUR, SGD, MYR, THB, etc.
- Currency selector in bill creation

**Requirements:**
- Amount input with currency
- Display formatted (e.g., "Rp 500.000" or "US$50")
- Store as integer (cents) for precision
- Conversion not required in MVP (display only)

---

### 6. Notification System (WhatsApp)

**Notification Trigger:**
- "Send Notifications" button after all bills added
- System sends WhatsApp message to each participant

**Message Content:**
- Overview of total bill per person
- Unique link to payment page
- Example: "Halo! Total tagihanmu: Rp 125.000 untuk 'Makan Siang'. Lihat detail & upload bukti bayar: letpai.app/xyz"

**Payment Page Link:**
- Unique URL per participant
- Shows:
  - Session name
  - Bill details
  - Total amount due
  - Upload proof of payment (photo)
  - Status (pending/paid/rejected)

---

### 7. Payment Verification

**Participant Actions:**
- View bill details
- Upload photo proof of payment
- Submit payment

**Host Actions:**
- View uploaded proof (photo)
- Approve payment → Status: `paid`
- Reject payment → Status: `rejected`
- Rejection requires: Add rejection reason (optional but recommended)

**Payment Status:**
- `pending` - Not yet paid
- `submitted` - Proof uploaded, waiting approval
- `paid` - Approved by host
- `rejected` - Rejected by host

**Rejection Notification:**
- System sends WhatsApp notification to participant
- Message: "Maaf, bukti pembayaran ditolak. [Reason]. Silakan upload ulang."

---

### 8. Host Dashboard

**Session Progress:**
- List all sessions with status indicators
- Show payment progress per session (e.g., "2/4 paid")
- Quick status badges (active/completed)

**Session Detail View:**
- Session name & description
- List of all participants
- Payment status per participant (pending/submitted/paid/rejected)
- Total collected amount
- Remaining amount to collect

**Actions:**
- View submitted proofs
- Approve/reject payments
- Resend reminder (with time restriction)
- View session history

---

### 9. Reminder System

**Resend Reminder:**
- Button to trigger reminder to unpaid participants
- **Time Restriction:** Minimum 24 hours since last notification
- Example: "Can't send reminder. Last notification sent 2 hours ago. Please wait 22 hours."

**Anti-Spam Protection:**
- Rate limiting per participant (e.g., max 1 notification per 24 hours)
- Rate limiting per session (e.g., max 10 notifications per day)
- Global rate limiting (e.g., max 100 notifications per user per day)
- Queue system to prevent spam bursts
- Cooldown period between notifications

---

### 10. Security Considerations

**WhatsApp Spam Prevention:**
- Unique payment links prevent unauthorized access
- Rate limiting on notification sending
- Session expiration (e.g., 30 days)
- Notification queue with backoff strategy
- User-level notification quota

**Payment Link Security:**
- Payment links should be:
  - One-time use per participant
  - Expire after X days (e.g., 7 days)
  - Require authentication or unique token

**Data Privacy:**
- Contact list is private per user
- Participants can only see their own bills (not others')
- Host can approve/reject, but not modify payment amounts

---

## UX Flow Optimization

### Core User Flow (Happy Path)

**1. Registration & Login**
```
User → Input WA + password
↓
System → Send OTP via WhatsApp
↓
User → Enter OTP
↓
System → Verify & create account
↓
User → Logged in → Dashboard
```

---

**2. Create Session & Split Bill**

```
User (Host) → Dashboard → "New Session"
↓
Input → Session name + description
↓
Click → "Add Participants"
↓
System → Show saved contacts list
↓
User → Select 3 contacts
↓
Or → Add manually (name + WA number)
↓
System → Add to session
↓
User → "Add Bill"
↓
Input → Bill name + amount + type
↓
Select → "Equal split" OR "Specific person"
↓
If specific → Select person(s)
↓
Repeat → Add multiple bills
↓
User → "Review & Send"
↓
System → Calculate totals per person
↓
User → "Send Notifications"
↓
System → Send WA to each participant
↓
Success → "Notifications sent! 3/3"
```

---

**3. Participant Payment Flow**

```
Participant → Receive WA message with link
↓
Click → Payment link
↓
System → Show bill details (session, items, total)
↓
Participant → Upload photo proof
↓
Click → "Submit Payment"
↓
System → Status: submitted
↓
System → Notify host
↓
Host → Review proof
↓
Host → Approve → Status: paid
↓
OR
Host → Reject → Add reason
↓
System → Notify participant (rejected)
↓
Participant → Upload new proof
```

---

**4. Reminder Flow**

```
Host → Dashboard → Session detail
↓
View unpaid participants (e.g., 1/4 not paid)
↓
Click → "Send Reminder" (for specific person or all unpaid)
↓
System → Check time restriction (>=24h since last notif)
↓
If OK → Send WA reminder
↓
If NOT OK → Show: "Wait 22h before next reminder"
```

---

## Feature Analysis

### ✅ STRENGTHS

1. **Flexible Session Concept**
   - Multiple sessions allow organizing different events
   - Sessions can be ongoing or one-time
   - Host can manage multiple events simultaneously

2. **Contact Management**
   - Reuse contacts across sessions
   - Import from saved list (not dump all)
   - Manual input available for new contacts
   - Maintain/Edit/Delete capabilities

3. **Dual Split Types**
   - Equal split: Simple, common use case
   - Specific person: Flexible for uneven splits

4. **Payment Verification**
   - Host control over approval
   - Rejection with reason
   - Feedback loop (participant → host → participant)

5. **Anti-Spam Protection**
   - Time restrictions prevent harassment
   - Rate limiting at multiple levels (participant/session/user)
   - Prevents WhatsApp spam

6. **WhatsApp Integration**
   - Uses existing SDK
   - Gateway is external (simplifies backend)
   - Users familiar with WhatsApp

7. **Multi-Currency**
   - Global ready (future expansion)
   - Default IDR (Indonesia market)

---

### ⚠️ WEAKNESSES & IMPROVEMENTS

#### 1. **Session Overhead**
**Issue:** Creating session for every split bill is extra step
**Fix:**
- Allow "quick split" (auto-create session with default name)
- "Quick split" = session + bill creation in one flow
- Example: "Split Rp 500.000 with 3 people" → Auto session named "Split - [date]"

---

#### 2. **Payment Link Expiry**
**Issue:** Links might expire before participant pays
**Fix:**
- Configurable expiry (default 7 days, extendable)
- Auto-extend if participant clicks link before expiry
- Email option for non-WA users

---

#### 3. **Rejection Loop**
**Issue:** Multiple rejection/approval cycles possible
**Fix:**
- Limit rejection attempts (e.g., max 3 rejections per bill)
- After max rejections: Manual intervention or "mark as paid anyway"
- Provide clear guidelines for acceptable proofs

---

#### 4. **Contact Organization**
**Issue:** Flat contact list (no grouping/tagging)
**Fix (V2):**
- Add contact groups (family, friends, work)
- Search/filter contacts
- Frequently used contacts (quick access)

---

#### 5. **WhatsApp-Only Approach**
**Issue:** Non-WA users can't participate
**Fix (V2):**
- Email notifications as fallback
- SMS option (expensive but available)
- Universal link (works in any device)

---

#### 6. **Currency Conversion**
**Issue:** Multi-currency but no conversion
**Fix (V2):**
- Real-time currency converter
- Auto-convert to participant's preferred currency
- Example: Host in IDR, participant pays in USD

---

#### 7. **Session Progress Clarity**
**Issue:** Dashboard might be cluttered with multiple sessions
**Fix:**
- Session search/filter (by date, status, name)
- Archive completed sessions
- "Active sessions" tab vs "Completed" tab

---

#### 8. **Notification Timing**
**Issue:** Manual sending only (no scheduled reminders)
**Fix (V2):**
- Scheduled reminders (e.g., 3 days, 7 days before due date)
- Auto-reminder for participants who haven't paid
- Configurable reminder schedule

---

#### 9. **Bulk Operations**
**Issue:** Approve payments one-by-one
**Fix:**
- Bulk approve (select multiple → approve all)
- Bulk reject
- Bulk resend reminders

---

#### 10. **Mobile Experience**
**Issue:** Photo upload on mobile might be tricky
**Fix:**
- Camera capture directly from mobile
- Preview before upload
- Compress images (reduce file size)

---

## UX Improvements

### 1. **Onboarding Flow**
- After registration: Show "How to use Letpai" tutorial
- Sample session creation (guided tour)
- "Try demo session" (test without real money)

---

### 2. **Session Creation UX**
- **Default:** Show "Quick Split" button (one-step)
- **Advanced:** "Custom Session" (full session + bill creation)
- Pre-fill suggestions: "Makan Siang", "Liburan", "Belanja Bareng"

---

### 3. **Participant Adding UX**
- **Quick Add:** Type name → search saved contacts → add
- **Bulk Select:** "Select All" in contacts list
- **Drag & Drop:** Drag contacts to session (future V2)

---

### 4. **Bill Item UX**
- **Templates:** Common bills (makan, transport, akomodasi)
- **Recurring:** "Add same bill next time" (V2)
- **History:** Show previous bills for suggestions

---

### 5. **Dashboard UX**
- **Quick Actions:** "New Session", "Send Reminders"
- **Summary Cards:** "Active Sessions", "Total Collected", "Pending"
- **Recent Activity:** "Rian just paid Rp 125.000"

---

### 6. **Payment Page UX**
- **Progress Indicator:** Step 1 of 3 (view → upload → confirm)
- **File Validation:** Show file size/type before upload
- **Preview:** Show uploaded photo before submit
- **Status Badges:** Pending (yellow), Submitted (blue), Paid (green), Rejected (red)

---

### 7. **Reminder UX**
- **Smart Suggestion:** "2 participants haven't paid. Send reminder?"
- **Auto-Calculate:** Show time until next reminder allowed
- **Bulk Reminder:** "Remind all unpaid" button

---

## Technical Optimization

### 1. **API Design**

**RESTful Endpoints:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/otp
POST /api/auth/verify-otp

POST /api/sessions
GET  /api/sessions
GET  /api/sessions/:id
PUT  /api/sessions/:id
DELETE /api/sessions/:id

GET  /api/contacts
POST /api/contacts
PUT  /api/contacts/:id
DELETE /api/contacts/:id

POST /api/bills
POST /api/bills/:id/items
GET  /api/bills/:id
PUT  /api/bills/:id
DELETE /api/bills/:id

POST /api/payments/:id/submit
POST /api/payments/:id/approve
POST /api/payments/:id/reject

POST /api/notifications/send
POST /api/notifications/resend
```

---

### 2. **Database Schema**

**Optimization:**
- Index on `user_id`, `session_id`, `person_id`
- Foreign keys for data integrity
- Soft delete (deleted_at) for audit trail
- Pagination support (limit/offset)

---

### 3. **Rate Limiting**

**Implementation:**
- Redis for rate limiting (fast access)
- Configurable limits per endpoint
- Sliding window algorithm (fair rate limiting)
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

### 4. **Caching**
- Cache session details (5-minute TTL)
- Cache contact list (user-specific, 10-minute TTL)
- Cache payment status (real-time, 1-minute TTL)
- Invalidate cache on update

---

### 5. **Image Upload**
- S3/Cloudinary for storage
- Image compression (WebP format)
- Max file size: 5MB
- Supported formats: JPG, PNG, HEIC

---

## V2 Features (Future)

1. **Contact Groups** (family, friends, work)
2. **Recurring Bills** (weekly/monthly)
3. **Currency Conversion** (real-time rates)
4. **Scheduled Reminders** (auto-send)
5. **Email Notifications** (non-WA fallback)
6. **Analytics Dashboard** (spending trends)
7. **Export to Excel/PDF**
8. **Multi-host Sessions** (multiple admins)
9. **Payment Integration** (direct bank/e-wallet)
10. **Social Features** (friends list, public sessions)

---

## Success Metrics

### MVP Success Criteria:
- 100+ registered users (first month)
- 50+ sessions created
- 80% payment completion rate
- < 5% rejection rate
- < 24h average payment time

### UX Metrics:
- < 3 steps to create session
- < 5 minutes from start to send notifications
- < 30 seconds to upload payment proof
- < 10 seconds to approve payment

---

## Implementation Priority

### Phase 1 (Core - Week 1-2)
1. Authentication (login/register/OTP)
2. Session management
3. Contact management
4. Basic bill splitting (equal split only)

### Phase 2 (Notifications - Week 3)
5. WhatsApp integration (SDK)
6. Notification sending
7. Payment link generation

### Phase 3 (Payment Flow - Week 4)
8. Payment page (public link)
9. Proof upload
10. Host approval/rejection
11. Dashboard with session progress

### Phase 4 (Polish - Week 5-6)
12. Reminder system (time restrictions)
13. Multi-currency
14. Rate limiting (anti-spam)
15. UX improvements (bulk ops, search, filter)

---

## Next Steps

1. Review and approve this feature specification
2. Prioritize Phase 1 implementation
3. Set up database schema
4. Implement core authentication
5. Test core flows (register → login → create session)
