# WATHACI Connect — Capital Platform Regulatory Boundaries

Operated by WATHACI Corporate Services, Lusaka, Zambia. Contact: support@wathaci.com

Status: **Phase 0 planning document. Nothing in AMBER or RED is implemented or approved for implementation.**

This document is an internal engineering guardrail. It is **not legal advice** and does not
state what Zambian law requires. Every AMBER and RED item must be reviewed by qualified
Zambian legal counsel, and where relevant confirmed with the applicable authority, before any
build work begins.

---

## How to use this document

1. Before building any capital/investment-related feature, locate it below.
2. GREEN → may be built under normal engineering process.
3. AMBER → **blocked** until written legal sign-off is recorded in this file's changelog.
4. RED → **blocked** until an appropriate licensed/regulated structure exists. Engineering must
   refuse the ticket and escalate.
5. If a feature is not listed, treat it as AMBER until classified.

---

## GREEN — initial low-risk functionality

Informational, organisational and educational features. The platform is a directory,
readiness and workflow tool. It does not intermediate capital.

- SME education and learning content on capital readiness.
- Capital-readiness self-assessment (questionnaire based).
- Readiness scoring and readiness reports generated from SME-supplied inputs.
- Business profiling (SME capital profile: sector, stage, team, traction, revenue bands).
- Capital-provider **directory** of publicly known institutions, listing factual and publicly
  available attributes (name, type, sectors, stage focus, ticket ranges, published criteria,
  public contact/application URL).
- Non-binding matching / "you may be a fit" suggestions, clearly framed as informational,
  ranked on published criteria only.
- Introduction requests: SME-initiated, opt-in, and only shares data the SME explicitly releases.
- Document organisation for the SME's own use (private data room, SME-controlled sharing).
- Analytics on the SME's own readiness progress.
- Administration, moderation, verification of directory entries.

Required framing for all GREEN features (must appear in UI copy):
- WATHACI does not provide investment advice.
- WATHACI does not arrange, underwrite or broker any transaction.
- No listing is an offer, solicitation or recommendation.
- Any engagement occurs directly between SME and provider, off-platform.

---

## AMBER — legal / regulatory review required before build

These may cross into regulated activity depending on how they are implemented and marketed.

- Displaying **investment opportunities** (i.e. an SME presented as raising capital, rather than
  simply as a profile).
- Publishing investment terms (valuation, instrument, equity offered, interest rate, tenor).
- Investment-specific recommendations to a provider or to an SME ("you should invest in X",
  "you should take debt rather than equity").
- Debt matching / lender matching where the platform assesses affordability or creditworthiness.
- Crowdfunding-style functionality (many-to-one funding, pledges, allocations, cap tables).
- Investor expressions of interest, commitments, soft circles or indicative amounts captured
  in-platform.
- Provider-initiated outreach to SMEs based on financial data the SME has not published.
- Any fee charged on a successful capital raise (success fee / carry / finder's fee).
- Aggregated benchmarking that reveals another party's confidential financial data.
- Marketing language such as "raise", "invest", "returns", "portfolio", "deal flow".

Review must consider, at minimum, whether the activity touches securities offering or
intermediation, financial advisory, credit provision, data protection, or consumer protection
regimes. Bodies that may need to be consulted, depending on the eventual functionality, include
the **Securities and Exchange Commission (SEC) Zambia**, **Bank of Zambia**, **PACRA**, **ZRA**,
and the data protection authority. **Do not assume** which apply — confirm with counsel.

---

## RED — do not build without an appropriate regulatory structure

Engineering must not implement these under the current corporate/licensing posture.

- Accepting investor funds for onward deployment.
- Holding, pooling or custodying client or investor funds.
- Escrow of transaction proceeds.
- Executing, settling or recording securities transactions.
- Securities issuance, subscription or allotment workflows.
- Operating anything resembling a securities exchange, trading venue or secondary market.
- Acting as a broker, dealer or placement agent.
- Fund management, discretionary or advisory portfolio management.
- Regulated investment advice, suitability assessments or personal recommendations.
- Guaranteeing, insuring or underwriting outcomes or returns.

Note: the existing wallet/payment rails (Lenco, Paddle) are for **platform subscription,
marketplace service payments and donations only**. They must not be extended to investment
flows. `co_investments` / `co_investment_participants` tables already exist in the schema and
are **RED-adjacent**: they must remain unused (and ideally be disabled) until reviewed.

---

## Data-protection boundary (applies at every level)

Financial statements, tax records, ownership/beneficial-ownership data and identity documents
are sensitive. They must be private-by-default, shared only by explicit SME action, time-boxed,
revocable and fully audit-logged. See the security architecture section of
`CAPITAL_PLATFORM_PHASE0_AUDIT.md`.

---

## Changelog / sign-off register

| Date | Item | Classification | Reviewer | Outcome |
| --- | --- | --- | --- | --- |
| 2026-08-11 | Initial classification | — | — | Drafted, no legal review yet |
