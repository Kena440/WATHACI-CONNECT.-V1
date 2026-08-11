# WATHACI Connect — Phase 0 Audit, Architecture & Phase 1 Plan

Audit date: 2026-08-11. **Analysis only — no migrations, no production code changes.**

---

## 1. Existing architecture summary

### Stack
| Layer | Technology |
| --- | --- |
| Frontend | React 18.3 + TypeScript 5 + Vite 5 |
| Routing | react-router-dom 6 (single `AppRoutes` in `src/App.tsx`) |
| UI | Tailwind CSS 3 + shadcn/Radix, `next-themes`, lucide icons |
| Data layer | TanStack Query 5, `@supabase/supabase-js` 2.89 |
| Forms | react-hook-form + zod (`src/lib/validations/onboarding.ts`) |
| i18n | i18next / react-i18next |
| PWA | vite-plugin-pwa, FCM push (`usePushNotifications`) |
| Backend | Lovable Cloud (managed Postgres + Auth + Storage + Deno edge functions) |
| Hosting | Lovable publish; `vercel.json` present as an SPA-rewrite fallback |

### Frontend architecture
- Pages under `src/pages` (~30), admin pages under `src/pages/admin`.
- Feature component folders: `marketplace/`, `funding/`, `investor/`, `payments/`,
  `onboarding/`, `directory/`, `sme/`, `notifications/`, `profile-forms/`, `admin/`.
- Global providers in `App.tsx`: ErrorBoundary → Helmet → Theme → QueryClient → Tooltip →
  AppContext → Router → **AuthProvider** → **OnboardingGuard** → routes.
- Route protection: `ProtectedRoute` (auth), `AdminGuard` (role), `OnboardingGuard`
  (forces incomplete profiles into `/onboarding/profile`, bypassed with `?edit=1`),
  `AccessGate` / `FeatureGate` (entitlements).

### Backend architecture
21 Deno edge functions in `supabase/functions`. All set `verify_jwt = false` in
`supabase/config.toml` (except `process-email-queue`) and validate JWTs manually in code —
this is a deliberate, documented convention.

Grouped by domain:
- **Payments/billing**: `lenco-payments`, `lenco-subscriptions`, `lenco-webhook`,
  `payments-webhook`, `get-paddle-price`, `donation-payment`, `_shared/paddle.ts`,
  `_shared/subscription-activation.ts`.
- **Marketplace**: `marketplace-manager`, `negotiation-manager`.
- **Funding/AI**: `funding-opportunities`, `funding-matcher`, `live-funding-matcher`,
  `ai-funding-analyzer`, `ai-funding-search`, `sme-matching`, `ciso-assistant`,
  `linkedin-profile-import` (Lovable AI Gateway, `google/gemini-2.5-flash`).
- **Comms**: `send-notification`, `process-email-queue` (pgmq queues + cron dispatch,
  domain `notify.wathaciconnect.online`), `verify-phone`.
- **Partnerships**: `partnership-manager`.

### Authentication
- Managed auth; **single** client at `src/integrations/supabase/client.ts` (enforced convention).
- `src/contexts/AuthContext.tsx` owns the only `onAuthStateChange` listener; exposes
  `user, session, profile, loading, profileLoading, isAdmin, signUp, signIn, signOut,
  refreshProfile`.
- Email/password + Google OAuth. On signup, `handle_new_user` trigger creates the `profiles`
  row and grants the default `user` role; `handle_new_user_payment_account` creates a wallet.
- Profile hydration goes through `get_my_profile()` and `save_onboarding_progress()` RPCs
  rather than direct table reads.
- **No MFA** currently configured.

### Authorization
- Roles live in a dedicated `user_roles` table (never on `profiles`) — correct pattern.
- `app_role` enum: `admin | moderator | user`.
- Security-definer helpers: `has_role`, `is_admin`, `has_full_access`,
  `get_user_entitlements`, `admin_list_profiles`, `assign_admin_role`, `revoke_admin_role`.
- Client-side `isAdmin` in AuthContext is presentation-only; enforcement is in RLS + RPCs.
- Entitlements/monetisation: `has_full_access` short-circuits for admins, the grace period
  (to 2026-01-20) and the `is_promo_free_period()` August 2026 promo, otherwise requires an
  active/trialing subscription.

### Profiles
- `profiles` — a very wide flat table (~70 columns) shared by all account types, plus four
  typed child tables keyed on `profile_id`: `sme_profiles`, `freelancer_profiles`,
  `investor_profiles`, `government_profiles`.
- `account_type` / `role_type` kept in sync by `save_onboarding_progress`; views COALESCE both.
- Phase-1 taxonomy work already landed: `business_categories`, `sme_needs`,
  `freelancer_services`.

### Search / discovery
- Directory views `v_directory_profiles`, `v_public_profiles`, `v_public_profiles_safe`
  (name computed as `TRIM(first_name||' '||last_name)` → `full_name` → `display_name`).
- Pages: `/professionals`, `/smes`, `/investors`, `/government`, plus Marketplace and
  Freelancer Hub directories. Hook: `useDirectoryProfiles`.
- LIKE input escaped via `escapeLikePattern` in `src/lib/utils/search.ts`.

### Messaging & notifications
- Negotiation-centric messaging: `negotiations` + `negotiation_messages`, driven by
  `negotiation-manager`; surfaced in `/messages` (incl. the "Offers to Help" tab),
  `PriceNegotiation`, `OfferHelpDialog`, `NeedOffers`.
- Notifications: `notifications`, `notification_logs`, `notification_preferences`,
  `push_subscriptions` (FCM) + `NotificationCenter`. Email via pgmq queues.

### Admin
`/admin` (dashboard with real MoM trends), `/admin/users`, `/admin/roles`,
`/admin/audit-logs`, `/admin/settings`, `/admin/payments` (reconciliation).
Immutable-ish `audit_logs` (permissive INSERT, admin-only SELECT, no UPDATE/DELETE policy).

### Storage
One bucket: **`profile-images`, private**. Due-diligence documents are recorded in
`due_diligence_documents` (`file_path`, `verification_status`, `expiry_date`) and accessed via
signed URLs. **There is no dedicated confidential/financial-document bucket yet.**

### Deployment
Lovable publish → `wathaci.lovable.app` + custom domains `wathaciconnect.online` /
`www.wathaciconnect.online`. Preview on Lovable. `vercel.json` retained for SPA rewrites and
asset caching. CI: `.github/workflows/ci.yml`; tests via jest/vitest.

---

## 2. Existing database summary

~40 public tables. RLS is enabled broadly; most tables have policies and explicit grants.

### Identity & profiles
| Table | Purpose | Key fields | Relationships | Sensitivity |
| --- | --- | --- | --- | --- |
| `profiles` | Master profile, all account types | `account_type`, `role_type`, `is_profile_complete`, `onboarding_step`, contact + business fields, `role_metadata` | PK → `auth.users.id`; parent of all role tables | **High** — PII, phone, address, revenue |
| `sme_profiles` | SME detail | `business_name`, `industry`, `business_stage`, `top_needs`, `funding_needed`, `funding_range`, `documents_urls` | `profile_id` → `profiles` | Medium-high |
| `freelancer_profiles` | Professional detail | `professional_title`, `primary_skills`, `rate_range` | `profile_id` → `profiles` | Medium |
| `investor_profiles` | Investor detail | `investor_type`, `ticket_size_range`, `investment_stage_focus`, `thesis` | `profile_id` → `profiles` | Medium-high |
| `government_profiles` | Institution detail | `institution_name`, `mandate_areas` | `profile_id` → `profiles` | Low |
| `user_roles` | Role assignment | `user_id`, `role` (`app_role`), `created_by` | → `auth.users` | **High** (privilege) |

### Taxonomy & matching
`business_categories` (canonical list, public read), `sme_needs`, `freelancer_services`,
`sme_professional_matches`, `funding_matches`, `needs_assessments`.

### Funding
`funding_opportunities` (public read, admin-managed), `funding_applications`.

### Marketplace & commerce
`services`, `service_reviews`, `negotiations`, `negotiation_messages`, `orders`.

### Money
`payment_accounts` (wallet balances), `payment_details` (**PII/financial — isolated by
design**), `transactions` (idempotency key, Lenco refs), `subscriptions`,
`subscription_plans`, `platform_fee_tiers`, `donations`, `webhook_events`.

### Compliance & ops
`due_diligence_documents`, `audit_logs`, `email_send_log`, `email_send_state`,
`email_unsubscribe_tokens`, `suppressed_emails`, `pwa_analytics`, `partners`,
`partnership_applications`, `referrals`.

### Investment-adjacent (dormant, RED-adjacent)
`co_investments`, `co_investment_participants` — currently `Anyone can view open
co-investments`. **Recommend disabling/de-scoping until legal review.**

### Observations
- Policy roles are mostly `{public}` rather than `{authenticated}`; combined with grants this
  is currently safe but should be tightened to `TO authenticated` as a hygiene pass.
- `profiles` is over-wide; new capital data should go in **new narrow tables**, not more columns.
- Indexing was not exhaustively reviewed; matching queries will need explicit indexes
  (see Phase 1).

### Reusable for the Capital Readiness ecosystem
| Reuse | For |
| --- | --- |
| `profiles` + `sme_profiles` | SME Capital Profile base |
| `investor_profiles` | Seed for the Capital Provider Directory (institutional entries need a new table) |
| `business_categories` | Shared taxonomy, extend with capital-instrument taxonomy |
| `sme_needs` | Capital need capture |
| `due_diligence_documents` + private storage | Secure Data Room foundation |
| `negotiations` / `negotiation_messages` | Introduction-request threads (rename semantics, don't fork) |
| `notifications` / email queue | Introduction + readiness notifications |
| `audit_logs` | Data-room access audit trail |
| `funding_opportunities` | GREEN informational programme listings (not deal listings) |
| `has_role` / `has_full_access` | Permission + entitlement gates |

---

## 3. Existing roles and permissions

Current: `admin`, `moderator`, `user` (`app_role` enum, `user_roles` table). Effective
persona is derived separately from `profiles.account_type`
(`sme | freelancer | investor | government`) — i.e. **two parallel notions of "role"**.

Recommendation for the three future roles — extend the existing model, do not replace it:

| Future role | Recommended mapping |
| --- | --- |
| **SME** | Keep as `account_type = 'sme'`. No new `app_role`. RLS keyed on ownership (`auth.uid()`), plus a `public.is_sme(uid)` security-definer helper. |
| **Capital Provider** | Add `app_role` value `capital_provider` **and** a `capital_provider_profiles` table. Two-step: role grant is admin-issued after verification, so directory listing ≠ data access. Access to any SME data is per-grant, never role-wide. |
| **WATHACI Administrator** | Reuse `admin`; add `capital_admin` as a narrower `app_role` for readiness/provider verification duties so full `admin` isn't over-issued. |

Principles: roles stay in `user_roles`; every check goes through security-definer helpers;
never trust `account_type` alone for anything sensitive; verification state (`verified_at`,
`verified_by`) is separate from role grant.

---

## 4. Proposed future architecture (design only)

```text
                          ┌──────────────────────────┐
                          │  Identity & Roles        │
                          │  profiles / user_roles   │
                          └───────┬──────────┬───────┘
                                  │          │
              ┌───────────────────┘          └──────────────────┐
              ▼                                                 ▼
   ┌────────────────────────┐                      ┌────────────────────────────┐
   │ 1. SME Capital Profile │                      │ 5. Capital Provider        │
   │ structured capital data│                      │    Directory (verified)    │
   └───────┬────────────────┘                      └──────────────┬─────────────┘
           │ feeds                                                │ criteria
           ▼                                                      │
   ┌────────────────────────┐                                     │
   │ 2. Readiness Assessment│                                     │
   │    questionnaire       │                                     │
   └───────┬────────────────┘                                     │
           ▼                                                      │
   ┌────────────────────────┐        ┌────────────────────────────┴───────┐
   │ 3. Readiness Score     │───────▶│ 6. Capital Matching (non-binding,  │
   │    + gap breakdown     │        │    rules-based, informational)     │
   └───────┬────────────────┘        └──────────────┬─────────────────────┘
           ▼                                        ▼
   ┌────────────────────────┐        ┌────────────────────────────────────┐
   │ 4. Readiness Report    │        │ 7. Introduction Requests           │
   │    (PDF/shareable)     │◀───────│    SME-initiated, opt-in           │
   └────────────────────────┘        └──────────────┬─────────────────────┘
                                                    │ unlocks scoped access
                                                    ▼
   ┌────────────────────────┐        ┌────────────────────────────────────┐
   │ 8. Secure Data Room    │◀──────▶│ 9. Capital Journey CRM             │
   │ private docs + grants  │ status │ stages, tasks, timeline            │
   └───────┬────────────────┘        └──────────────┬─────────────────────┘
           │ access events                          │ events
           ▼                                        ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │ 10. Analytics (SME-own progress; aggregate/anonymised for admin)   │
   └───────────────────────────────┬────────────────────────────────────┘
                                   ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │ 11. Administration — provider verification, taxonomy, moderation,  │
   │      audit-log review, access revocation                           │
   └────────────────────────────────────────────────────────────────────┘
```

Module notes (all GREEN unless flagged):
1. **SME Capital Profile** — structured, versioned capital-relevant business data. Source of
   truth for 2, 3, 6.
2. **Readiness Assessment** — versioned questionnaire; answers stored immutably per attempt.
3. **Readiness Score** — deterministic, transparent, category-weighted; **not** a credit score
   and never surfaced to providers without SME release.
4. **Readiness Report** — SME-owned artefact; sharing is explicit and revocable.
5. **Capital Provider Directory** — verified institutional entries with published criteria only.
6. **Capital Matching** — rules-based fit on published criteria. Informational only.
   Instrument-specific *recommendations* are **AMBER**.
7. **Introduction Requests** — SME-initiated only; reuses the negotiation thread model.
   Provider-initiated interest is **AMBER**.
8. **Secure Data Room** — private bucket, per-document grants, expiry, revocation, watermarking,
   full access audit.
9. **Capital Journey CRM** — SME-side pipeline tracking. No terms, no commitments (**AMBER** if
   it captures amounts/terms).
10. **Analytics** — SME sees own; admin sees aggregate. Never cross-tenant raw financials.
11. **Administration** — verification, taxonomy, revocation, audit review.

---

## 5. Regulatory boundary map

See **`CAPITAL_PLATFORM_REGULATORY_BOUNDARIES.md`** (created this phase). Summary:
GREEN = education, profiling, readiness, directory, non-binding matching, SME-initiated
introductions, document organisation. AMBER = opportunity listings, terms, recommendations,
debt matching, crowdfunding, investor EOIs, success fees. RED = holding funds, escrow,
securities transactions/issuance, exchange, broker-dealer, fund management, regulated advice.
Zambian requirements are **not** guessed; SEC Zambia, Bank of Zambia, PACRA, ZRA and the data
protection authority are flagged as *potentially* relevant pending counsel.

---

## 6. Security assessment

### Data classes and required handling
| Class | Examples | Requirement |
| --- | --- | --- |
| Financial information | statements, revenue, projections, bank data | Private-by-default; owner-only RLS; per-grant sharing; audit every read |
| Ownership information | shareholders, beneficial owners, cap structure | Same as above + admin access requires justification logged |
| Tax documents | ZRA returns, TPIN, clearance | Private bucket, signed URLs (short TTL), never public |
| Financial statements | audited/management accounts | Private bucket, per-grant, watermark on share |
| Confidential business docs | contracts, IP, strategy | Private bucket, per-grant, expiry |
| Provider/investor info | contacts, criteria, activity | Least privilege; public directory fields separated from private fields |

### Current gaps
1. Only one storage bucket (`profile-images`); **no dedicated confidential-documents bucket**.
2. No per-document sharing/grant model or expiry/revocation mechanism.
3. No document-access audit events (`audit_logs` exists but isn't wired to file reads).
4. **No MFA** for admins or capital providers.
5. Many policies target `{public}` rather than `TO authenticated`.
6. Dormant `co_investments` tables are world-readable.
7. Some legacy sensitive fields still sit on the wide `profiles` table.

### Recommendations
- **RLS**: owner-scoped by `auth.uid()`; provider access only via an explicit
  `data_room_grants` row that is active and unexpired; all checks via security-definer helpers.
- **Private storage**: new `capital-documents` bucket, private, path-namespaced by owner id;
  server-issued signed URLs with ≤5-minute TTL; no public URLs anywhere.
- **Role-based access**: `capital_provider` and `capital_admin` roles in `user_roles`; role
  grants access to *workflow*, never automatically to *data*.
- **Audit logs**: append-only records for document view/download, grant create/revoke, score
  recompute, provider verification, admin data access.
- **Signed URLs**: minted only by an edge function that re-verifies the grant at request time.
- **Access revocation**: single action revokes all grants for a provider; already-issued signed
  URLs expire within minutes by design.
- **Least privilege**: narrow grants per table, no blanket `anon` on anything capital-related,
  service-role only inside edge functions.
- **MFA**: require for `admin`/`capital_admin`, and for `capital_provider` before any data-room
  access is granted.
- **Retention**: define per-class retention/deletion tied to the existing account-deletion flow.

---

## 7. Phase 1 implementation plan — SME Capital Profile

Scope: structured capital-readiness data capture for SMEs. **GREEN only.** No matching,
no provider access, no documents sharing, no payments.

### 7.1 Database changes (to be written in Phase 1, not now)
- `sme_capital_profiles` — one row per SME (`sme_profile_id` FK → `sme_profiles.profile_id`):
  legal structure, PACRA registration status, year established, employees band, revenue band
  (last 12m), profitability status, existing debt (bool), capital sought band, intended use of
  funds, preferred instrument (grant/debt/equity/blended — descriptive only), timeline band,
  record-keeping maturity, banked status, tax-compliance status (self-declared),
  `completeness_pct`, `created_at`, `updated_at`.
- `sme_capital_profile_history` — append-only snapshots for auditability.
- Extend `business_categories` pattern with a `capital_instrument_types` reference table.
- Indexes: `sme_capital_profiles(sme_profile_id)` unique; btree on `capital_sought_band`,
  `revenue_band`, `sector` for future matching.
- Grants + RLS in the same migration: `GRANT SELECT, INSERT, UPDATE ON ... TO authenticated`,
  `GRANT ALL ... TO service_role`, **no `anon` grant**; enable RLS; owner-only policies via
  `auth.uid() = sme_profile_id`; admin read via `has_role(auth.uid(),'admin')`.
- `updated_at` trigger reusing `public.update_updated_at_column()`.

### 7.2 Components
- `src/components/capital/CapitalProfileForm.tsx` — sectioned form (react-hook-form + zod).
- `src/components/capital/CapitalProfileSection.tsx` — reuse `FormSection` conventions.
- `src/components/capital/CompletenessMeter.tsx` — progress + missing-items list.
- `src/components/capital/CapitalProfileSummary.tsx` — read-only view for the SME.
- `src/data/capitalOptions.ts` — bands and instrument labels (mirrors reference tables).
- `src/lib/validations/capital.ts` — zod schemas.
- `src/hooks/useCapitalProfile.ts` — TanStack Query read/mutate with optimistic update.

### 7.3 Pages
- `/capital/profile` — SME-only, `ProtectedRoute` + account-type check; edit + autosave draft
  (reuse the debounced localStorage pattern from `OnboardingProfile.tsx`).
- Entry points: SME dashboard card and a section on the SME's own profile page.
- No public route. Nothing appears on public directories in Phase 1.

### 7.4 User flows
1. SME signs in → sees "Capital readiness profile — X% complete" prompt.
2. Opens `/capital/profile`, completes sections, autosave persists drafts.
3. On save, completeness recomputes and is shown with concrete next steps.
4. SME can review a read-only summary. **No sharing in Phase 1.**

### 7.5 Permissions
- Read/write: the owning SME only.
- Read: `admin` (logged).
- Capital providers: **no access** in Phase 1.
- Anonymous: none.

### 7.6 Validation
- Zod-enforced enums for every band; no free-text financial figures beyond bounded numerics.
- Server-side re-validation in RLS/check constraints; do not trust client enums.
- Self-declared compliance fields explicitly labelled "self-declared, unverified".

### 7.7 Testing
- Unit: zod schemas, completeness calculation.
- Integration: RPC/table CRUD as owner, as another SME (must fail), as admin.
- Browser (Playwright, preview): SME completes profile → refresh → data persists →
  second SME cannot read it → non-SME account cannot reach `/capital/profile`.
- Regression: onboarding wizard, directories, existing marketplace/negotiation flows untouched.

### 7.8 Security
- No new bucket in Phase 1 (no document upload yet).
- No `anon` grants. Owner-scoped RLS with security-definer helper.
- Admin reads write an `audit_logs` entry.
- Data included in the existing account-deletion process.

### 7.9 Regulatory considerations
- Phase 1 is entirely GREEN: self-declared business profiling.
- UI must state: informational only, not investment advice, not shared with any third party,
  and not an application for funding.
- No scoring surfaced to third parties, no provider visibility, no instrument recommendation.

---

## 8. Risks

| # | Risk | Impact | Mitigation |
| --- | --- | --- | --- |
| 1 | Scope creep from GREEN into AMBER (a "profile" quietly becomes a "deal listing") | Regulatory exposure | Hard gate: boundaries doc + reviewer checklist on every capital PR |
| 2 | Dormant `co_investments` tables are publicly readable and investment-shaped | Regulatory + data exposure | De-scope/disable before Phase 1 ships |
| 3 | Readiness score misread as a credit/investment rating | Legal + reputational | Explicit disclaimers; transparent, non-predictive methodology |
| 4 | Confidential financials leaking via a future provider role | Severe | Grant-based access only; no role-wide reads; short-TTL signed URLs; audit |
| 5 | `profiles` table already over-wide and mixed-sensitivity | Maintainability + exposure | New narrow tables; do not add capital columns to `profiles` |
| 6 | No MFA on admin accounts | Account takeover → mass data access | Enable MFA for admin/capital roles before data-room work |
| 7 | Policies scoped to `{public}` rather than `{authenticated}` | Latent misconfiguration | Hygiene pass with grants review |
| 8 | Two parallel role notions (`app_role` vs `account_type`) | Authorization confusion | Single security-definer helper set; never authorize on `account_type` |
| 9 | Payment rails adjacent to capital features | Being seen to handle investor funds | Keep rails strictly on subscriptions/marketplace/donations; documented |
| 10 | Legal review latency blocks roadmap | Delivery | Sequence GREEN work first; start counsel engagement now |

---

## 9. Questions requiring clarification

1. Is WATHACI Corporate Services currently licensed or registered with any financial regulator
   in Zambia, and has counsel been engaged on this ecosystem yet?
2. Will capital providers be **institutions only** (DFIs, funds, banks, grant programmes) or
   also individual/angel investors? This materially changes the regulatory posture.
3. Does WATHACI intend to charge any fee tied to a capital outcome (success fee), or only
   subscription/service fees? A success fee is a significant AMBER trigger.
4. Should the existing `investor_profiles` population be migrated into the new Capital Provider
   Directory, or is the directory curated/admin-seeded from public information only?
5. Should introductions be double opt-in (SME requests, provider accepts before any data flows),
   or SME-release-only?
6. Should the readiness score ever be visible to providers, and if so only with per-request SME
   consent?
7. What is the intended handling of the dormant `co_investments` tables — delete, archive, or
   retain disabled?
8. Are cross-border providers in scope (non-Zambian capital), which brings data-transfer
   considerations?
9. Should Phase 1 introduce MFA for admins immediately, or is that a later hardening phase?
10. Any existing document-retention or confidentiality commitments already made to SMEs that
    the data room must honour?

---

**Phase 0 complete. No migrations created, no production code modified. Awaiting direction
before Phase 1.**
