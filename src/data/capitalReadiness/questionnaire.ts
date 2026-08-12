/**
 * WATHACI Connect — Capital Readiness Self-Assessment
 * Versioned questionnaire definition: CR-2026-01
 *
 * This is the deterministic source of truth for questions, answer wording,
 * points (0/1/2/4), category weights and gap/action rules.
 * No LLM is used for scoring or action generation.
 */

export const QUESTIONNAIRE_VERSION = 'CR-2026-01' as const;

export type CategoryKey =
  | 'governance'
  | 'financial_management'
  | 'legal_compliance'
  | 'business_model'
  | 'management'
  | 'market'
  | 'capital_preparation';

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  /** Weight as a fraction of the overall score. Sums to 1. */
  weight: number;
  description: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'governance', label: 'Governance', weight: 0.15, description: 'Ownership, decision-making and oversight structures.' },
  { key: 'financial_management', label: 'Financial Management', weight: 0.20, description: 'Records, reporting, controls and financial visibility.' },
  { key: 'legal_compliance', label: 'Legal & Compliance', weight: 0.15, description: 'Registration, tax, licensing and contractual position.' },
  { key: 'business_model', label: 'Business Model', weight: 0.15, description: 'Revenue model, customers, unit economics and scalability.' },
  { key: 'management', label: 'Management', weight: 0.10, description: 'Leadership team, roles, skills and succession.' },
  { key: 'market', label: 'Market', weight: 0.10, description: 'Market understanding, competition and positioning.' },
  { key: 'capital_preparation', label: 'Capital Preparation', weight: 0.15, description: 'Documentation and preparation for engaging capital providers.' },
];

export type Priority = 'high' | 'medium';

export interface AnswerOption {
  value: string;
  label: string;
  points: 0 | 1 | 2 | 4;
  /** True for a distinctly captured "I do not know" answer. Always scores 0. */
  isUnknown?: boolean;
}

export interface QuestionDef {
  key: string;
  category: CategoryKey;
  subject: string;
  text: string;
  required: boolean;
  options: AnswerOption[];
  /** Deterministic gap/action rule applied when the answer scores <= 1. */
  rule: { gap: string; action: string; priority: Priority };
}

const UNKNOWN: AnswerOption = { value: 'unknown', label: 'I do not know', points: 0, isUnknown: true };

export const QUESTIONS: QuestionDef[] = [
  // ---------------- Governance (15%) ----------------
  {
    key: 'G1',
    category: 'governance',
    subject: 'Ownership structure',
    text: 'How clearly documented is the ownership structure of the business?',
    required: true,
    options: [
      { value: 'documented_verified', label: 'Fully documented shareholding, with share certificates or equivalent records', points: 4 },
      { value: 'documented_informal', label: 'Documented, but records are informal or incomplete', points: 2 },
      { value: 'verbal_only', label: 'Understood verbally between owners, nothing written', points: 1 },
      { value: 'none', label: 'Ownership split has not been agreed or recorded', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Ownership structure is not clearly documented.', action: 'Record the shareholding split in writing and issue share certificates or equivalent ownership records.', priority: 'high' },
  },
  {
    key: 'G2',
    category: 'governance',
    subject: 'Board or advisory oversight',
    text: 'Does the business have a board or advisory body that meets regularly?',
    required: true,
    options: [
      { value: 'board_regular', label: 'A board or advisory body meets on a fixed schedule with recorded minutes', points: 4 },
      { value: 'board_irregular', label: 'A board or advisers exist but meet irregularly', points: 2 },
      { value: 'informal_advisers', label: 'Only informal advisers are consulted occasionally', points: 1 },
      { value: 'none', label: 'No board or advisory body exists', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'No functioning board or advisory oversight.', action: 'Appoint at least two external advisers and hold documented quarterly oversight meetings.', priority: 'high' },
  },
  {
    key: 'G3',
    category: 'governance',
    subject: 'Decision-making and delegation',
    text: 'How are significant business decisions made and authorised?',
    required: true,
    options: [
      { value: 'written_policy', label: 'A written delegation-of-authority policy sets approval limits', points: 4 },
      { value: 'consistent_unwritten', label: 'Consistent practice exists but is not written down', points: 2 },
      { value: 'owner_only', label: 'The owner decides everything case by case', points: 1 },
      { value: 'ad_hoc', label: 'Decisions are ad hoc with no clear authority', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Decision-making authority is undefined.', action: 'Write a short delegation-of-authority policy setting spending and commitment approval limits.', priority: 'high' },
  },
  {
    key: 'G4',
    category: 'governance',
    subject: 'Record keeping of company decisions',
    text: 'Are company records such as minutes, resolutions and registers maintained?',
    required: true,
    options: [
      { value: 'complete', label: 'Statutory registers, resolutions and minutes are complete and current', points: 4 },
      { value: 'partial', label: 'Some records are kept but are incomplete or out of date', points: 2 },
      { value: 'rare', label: 'Records are only created when a third party demands them', points: 1 },
      { value: 'none', label: 'No company records are maintained', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Company records and resolutions are not maintained.', action: 'Open a statutory records file and record all resolutions and registers going forward.', priority: 'high' },
  },
  {
    key: 'G5',
    category: 'governance',
    subject: 'Separation of owner and business affairs',
    text: 'How well separated are the owner’s personal finances from the business?',
    required: true,
    options: [
      { value: 'fully_separate', label: 'Separate bank accounts and no personal expenses run through the business', points: 4 },
      { value: 'mostly_separate', label: 'Separate accounts, but some personal transactions still mix', points: 2 },
      { value: 'occasional_mixing', label: 'One account is used for both, with informal tracking', points: 1 },
      { value: 'not_separate', label: 'Personal and business funds are not separated at all', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Personal and business finances are mixed.', action: 'Open a dedicated business bank account and stop routing personal transactions through the business.', priority: 'high' },
  },

  // ---------------- Financial Management (20%) ----------------
  {
    key: 'F1',
    category: 'financial_management',
    subject: 'Bookkeeping',
    text: 'How are the business’s financial records kept?',
    required: true,
    options: [
      { value: 'accounting_software', label: 'Accounting software updated at least monthly', points: 4 },
      { value: 'spreadsheets', label: 'Structured spreadsheets updated regularly', points: 2 },
      { value: 'manual_irregular', label: 'Manual notes or receipts kept irregularly', points: 1 },
      { value: 'none', label: 'No financial records are kept', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Bookkeeping is irregular or absent.', action: 'Adopt accounting software or a standard bookkeeping template and reconcile monthly.', priority: 'high' },
  },
  {
    key: 'F2',
    category: 'financial_management',
    subject: 'Financial statements',
    text: 'Which financial statements can the business produce for the last completed year?',
    required: true,
    options: [
      { value: 'audited_or_reviewed', label: 'Audited or independently reviewed statements', points: 4 },
      { value: 'accountant_prepared', label: 'Accountant-prepared statements that are not audited or reviewed', points: 2 },
      { value: 'internal_only', label: 'Internally prepared summaries only', points: 1 },
      { value: 'none', label: 'No financial statements are available', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'No credible annual financial statements.', action: 'Engage an accountant to prepare financial statements for the last completed financial year.', priority: 'high' },
  },
  {
    key: 'F3',
    category: 'financial_management',
    subject: 'Cash flow management',
    text: 'Does the business maintain a forward-looking cash flow forecast?',
    required: true,
    options: [
      { value: 'rolling_forecast', label: 'A rolling forecast of 6 months or more is maintained and reviewed', points: 4 },
      { value: 'short_forecast', label: 'A short forecast of 1 to 3 months is maintained', points: 2 },
      { value: 'mental_tracking', label: 'Cash position is tracked informally without a forecast', points: 1 },
      { value: 'none', label: 'No cash flow tracking or forecasting', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'No forward-looking cash flow forecast.', action: 'Build a rolling 6-month cash flow forecast and update it monthly.', priority: 'high' },
  },
  {
    key: 'F4',
    category: 'financial_management',
    subject: 'Financial controls',
    text: 'What internal financial controls are in place over payments and cash?',
    required: true,
    options: [
      { value: 'documented_controls', label: 'Documented controls with dual approval and regular reconciliation', points: 4 },
      { value: 'basic_controls', label: 'Basic controls such as approval by the owner and periodic checks', points: 2 },
      { value: 'minimal', label: 'Minimal controls, largely trust based', points: 1 },
      { value: 'none', label: 'No financial controls', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Weak or absent internal financial controls.', action: 'Introduce dual approval for payments above a set threshold and reconcile bank accounts monthly.', priority: 'high' },
  },
  {
    key: 'F5',
    category: 'financial_management',
    subject: 'Debt and obligations tracking',
    text: 'How well does the business track its existing debt and financial obligations?',
    required: true,
    options: [
      { value: 'full_schedule', label: 'A complete schedule of all loans, terms and repayment dates is maintained', points: 4 },
      { value: 'partial_schedule', label: 'Main obligations are tracked but the schedule is incomplete', points: 2 },
      { value: 'informal', label: 'Obligations are remembered informally', points: 1 },
      { value: 'none', label: 'Obligations are not tracked', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Existing debt and obligations are not fully tracked.', action: 'Create a schedule listing every loan and obligation with amounts, terms and repayment dates.', priority: 'high' },
  },

  // ---------------- Legal & Compliance (15%) ----------------
  {
    key: 'L1',
    category: 'legal_compliance',
    subject: 'Business registration',
    text: 'What is the registration status of the business?',
    required: true,
    options: [
      { value: 'registered_current', label: 'Registered with current annual returns filed', points: 4 },
      { value: 'registered_overdue', label: 'Registered but annual returns are overdue', points: 2 },
      { value: 'in_progress', label: 'Registration is in progress', points: 1 },
      { value: 'unregistered', label: 'Not registered', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Business registration is incomplete or not current.', action: 'Complete registration and bring all statutory filings up to date.', priority: 'high' },
  },
  {
    key: 'L2',
    category: 'legal_compliance',
    subject: 'Tax compliance',
    text: 'What is the business’s tax compliance position?',
    required: true,
    options: [
      { value: 'compliant_certificate', label: 'Registered for tax and holds a current tax clearance certificate', points: 4 },
      { value: 'registered_filing', label: 'Registered and filing, but no current clearance certificate', points: 2 },
      { value: 'registered_behind', label: 'Registered but behind on filings or payments', points: 1 },
      { value: 'not_registered', label: 'Not registered for tax', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Tax compliance is not current.', action: 'Register for tax where required, clear outstanding filings and obtain a tax clearance certificate.', priority: 'high' },
  },
  {
    key: 'L3',
    category: 'legal_compliance',
    subject: 'Sector licences and permits',
    text: 'Does the business hold the licences and permits required for its sector?',
    required: true,
    options: [
      { value: 'all_current', label: 'All required licences and permits are held and current', points: 4 },
      { value: 'some_expired', label: 'Most are held but some have expired or are pending renewal', points: 2 },
      { value: 'applying', label: 'Applications are under way but none issued yet', points: 1 },
      { value: 'none', label: 'Required licences or permits are not held', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Required sector licences or permits are missing or expired.', action: 'List every licence the sector requires and renew or apply for each outstanding one.', priority: 'high' },
  },
  {
    key: 'L4',
    category: 'legal_compliance',
    subject: 'Customer and supplier contracts',
    text: 'Are relationships with customers and suppliers governed by written contracts?',
    required: true,
    options: [
      { value: 'written_reviewed', label: 'Written contracts for all material relationships, legally reviewed', points: 4 },
      { value: 'written_some', label: 'Written contracts for some relationships', points: 2 },
      { value: 'verbal', label: 'Mostly verbal agreements or purchase orders only', points: 1 },
      { value: 'none', label: 'No agreements are documented', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Material relationships are not covered by written contracts.', action: 'Put written contracts in place for all material customers and suppliers.', priority: 'high' },
  },
  {
    key: 'L5',
    category: 'legal_compliance',
    subject: 'Employment and labour compliance',
    text: 'How does the business handle employment contracts and statutory labour obligations?',
    required: true,
    options: [
      { value: 'contracts_and_statutory', label: 'Written contracts for all staff and statutory contributions paid on time', points: 4 },
      { value: 'contracts_partial', label: 'Contracts for some staff, statutory obligations partly met', points: 2 },
      { value: 'informal', label: 'Staff engaged informally without written terms', points: 1 },
      { value: 'none', label: 'No employment documentation or statutory contributions', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Employment documentation or statutory labour obligations are incomplete.', action: 'Issue written employment contracts to all staff and regularise statutory contributions.', priority: 'high' },
  },

  // ---------------- Business Model (15%) ----------------
  {
    key: 'B1',
    category: 'business_model',
    subject: 'Revenue model clarity',
    text: 'How clearly defined is the way the business earns revenue?',
    required: true,
    options: [
      { value: 'defined_documented', label: 'Revenue streams are documented with pricing per product or service', points: 4 },
      { value: 'defined_informal', label: 'Revenue streams are clear to the team but not documented', points: 2 },
      { value: 'evolving', label: 'The revenue model is still changing frequently', points: 1 },
      { value: 'undefined', label: 'The revenue model has not been defined', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'The revenue model is not clearly defined or documented.', action: 'Document each revenue stream with its pricing and contribution to total revenue.', priority: 'medium' },
  },
  {
    key: 'B2',
    category: 'business_model',
    subject: 'Unit economics',
    text: 'Does the business know the cost and margin of each product or service it sells?',
    required: true,
    options: [
      { value: 'calculated_tracked', label: 'Cost and margin are calculated per product or service and tracked over time', points: 4 },
      { value: 'estimated', label: 'Costs and margins are estimated at a high level', points: 2 },
      { value: 'rough_idea', label: 'Only a rough sense of overall profitability exists', points: 1 },
      { value: 'unknown', label: 'Costs and margins are not known', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Unit costs and margins are not understood.', action: 'Calculate direct cost and gross margin for each main product or service line.', priority: 'medium' },
  },
  {
    key: 'B3',
    category: 'business_model',
    subject: 'Customer concentration',
    text: 'How dependent is revenue on the largest customer?',
    required: true,
    options: [
      { value: 'under_20', label: 'The largest customer is under 20% of revenue', points: 4 },
      { value: 'twenty_to_forty', label: 'The largest customer is 20% to 40% of revenue', points: 2 },
      { value: 'forty_to_seventy', label: 'The largest customer is 40% to 70% of revenue', points: 1 },
      { value: 'over_seventy', label: 'The largest customer is over 70% of revenue', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Revenue is highly concentrated in one customer.', action: 'Set a customer diversification target and build a pipeline to reduce reliance on the largest account.', priority: 'medium' },
  },
  {
    key: 'B4',
    category: 'business_model',
    subject: 'Revenue trend',
    text: 'How has revenue moved over the last 12 months?',
    required: true,
    options: [
      { value: 'growing_consistently', label: 'Growing consistently and the growth is evidenced in records', points: 4 },
      { value: 'stable', label: 'Broadly stable', points: 2 },
      { value: 'volatile', label: 'Highly volatile or unpredictable', points: 1 },
      { value: 'declining_or_none', label: 'Declining, or the business has no revenue yet', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Revenue is declining, volatile or not yet established.', action: 'Document the drivers behind the revenue trend and set a written plan to stabilise or grow sales.', priority: 'medium' },
  },
  {
    key: 'B5',
    category: 'business_model',
    subject: 'Scalability of delivery',
    text: 'Can the business serve significantly more customers without proportionally more cost?',
    required: true,
    options: [
      { value: 'proven_scalable', label: 'Delivery is systemised and has already scaled without proportional cost', points: 4 },
      { value: 'partly_systemised', label: 'Some processes are systemised, others depend on individuals', points: 2 },
      { value: 'manual', label: 'Delivery is manual and depends heavily on the owner', points: 1 },
      { value: 'not_assessed', label: 'Scalability has not been considered', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Delivery is not systemised enough to scale.', action: 'Document core delivery processes and identify which steps must be systemised or delegated before growth.', priority: 'medium' },
  },

  // ---------------- Management (10%) ----------------
  {
    key: 'M1',
    category: 'management',
    subject: 'Management team composition',
    text: 'Who runs the day-to-day management of the business?',
    required: true,
    options: [
      { value: 'team_with_roles', label: 'A management team with clearly assigned functional roles', points: 4 },
      { value: 'two_or_three', label: 'Two or three people share management duties informally', points: 2 },
      { value: 'owner_plus_help', label: 'The owner manages everything with some part-time help', points: 1 },
      { value: 'owner_only', label: 'The owner alone manages every function', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Management depends on a single person.', action: 'Assign functional responsibilities to named individuals and begin building a small management team.', priority: 'medium' },
  },
  {
    key: 'M2',
    category: 'management',
    subject: 'Relevant sector experience',
    text: 'How much relevant sector experience does the leadership have?',
    required: true,
    options: [
      { value: 'over_five', label: 'More than five years of directly relevant experience', points: 4 },
      { value: 'two_to_five', label: 'Two to five years of relevant experience', points: 2 },
      { value: 'under_two', label: 'Less than two years of relevant experience', points: 1 },
      { value: 'none', label: 'No prior experience in this sector', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Limited relevant sector experience in the leadership.', action: 'Recruit an adviser or non-executive with deep sector experience to strengthen the leadership.', priority: 'medium' },
  },
  {
    key: 'M3',
    category: 'management',
    subject: 'Skills gaps',
    text: 'Has the business identified and addressed its leadership skills gaps?',
    required: true,
    options: [
      { value: 'identified_addressed', label: 'Gaps are identified and being addressed through hiring or training', points: 4 },
      { value: 'identified_only', label: 'Gaps are identified but not yet addressed', points: 2 },
      { value: 'vague', label: 'Only a vague sense of where the gaps are', points: 1 },
      { value: 'not_considered', label: 'Skills gaps have not been considered', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Leadership skills gaps have not been identified or addressed.', action: 'Complete a simple skills audit of the leadership team and set a hiring or training plan.', priority: 'medium' },
  },
  {
    key: 'M4',
    category: 'management',
    subject: 'Key person dependency',
    text: 'What happens to the business if the founder or a key person is unavailable for a month?',
    required: true,
    options: [
      { value: 'continues_normally', label: 'Operations continue normally under documented cover arrangements', points: 4 },
      { value: 'continues_reduced', label: 'Operations continue at reduced capacity', points: 2 },
      { value: 'severe_disruption', label: 'Operations would be severely disrupted', points: 1 },
      { value: 'stops', label: 'The business would stop', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'The business is critically dependent on one person.', action: 'Document key responsibilities and appoint a named deputy for each critical function.', priority: 'medium' },
  },
  {
    key: 'M5',
    category: 'management',
    subject: 'Performance management',
    text: 'How is team performance planned and reviewed?',
    required: true,
    options: [
      { value: 'targets_and_reviews', label: 'Written targets with scheduled performance reviews', points: 4 },
      { value: 'informal_reviews', label: 'Targets discussed informally and reviewed occasionally', points: 2 },
      { value: 'reactive', label: 'Performance is only addressed when problems arise', points: 1 },
      { value: 'none', label: 'No performance planning or review', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'No structured performance planning or review.', action: 'Set written targets per role and hold documented reviews at least quarterly.', priority: 'medium' },
  },

  // ---------------- Market (10%) ----------------
  {
    key: 'MK1',
    category: 'market',
    subject: 'Target market definition',
    text: 'How well defined is the target market?',
    required: true,
    options: [
      { value: 'defined_with_data', label: 'Clearly defined segments supported by data on size and demand', points: 4 },
      { value: 'defined_no_data', label: 'Clearly described but not supported by data', points: 2 },
      { value: 'broad', label: 'Defined very broadly, for example "anyone who needs this"', points: 1 },
      { value: 'undefined', label: 'The target market has not been defined', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'The target market is not clearly defined or evidenced.', action: 'Define the priority customer segments and gather data on their size and demand.', priority: 'medium' },
  },
  {
    key: 'MK2',
    category: 'market',
    subject: 'Competitor understanding',
    text: 'How well does the business understand its competitors?',
    required: true,
    options: [
      { value: 'documented_analysis', label: 'A documented comparison of competitors and their pricing', points: 4 },
      { value: 'general_awareness', label: 'General awareness of the main competitors', points: 2 },
      { value: 'limited', label: 'Limited knowledge of who the competitors are', points: 1 },
      { value: 'none', label: 'Competitors have not been considered', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Competitor landscape is not understood.', action: 'Produce a written competitor comparison covering offering, pricing and positioning.', priority: 'medium' },
  },
  {
    key: 'MK3',
    category: 'market',
    subject: 'Differentiation',
    text: 'How distinct is the business’s offering from alternatives available to customers?',
    required: true,
    options: [
      { value: 'clear_evidenced', label: 'A clear differentiator that customers explicitly cite', points: 4 },
      { value: 'clear_unevidenced', label: 'A clear differentiator internally, not yet validated with customers', points: 2 },
      { value: 'price_only', label: 'Differentiation is mainly on price', points: 1 },
      { value: 'none', label: 'No identified differentiation', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'The offering is not meaningfully differentiated.', action: 'Define the differentiator and validate it with at least five existing customers.', priority: 'medium' },
  },
  {
    key: 'MK4',
    category: 'market',
    subject: 'Customer acquisition channels',
    text: 'How does the business acquire new customers?',
    required: true,
    options: [
      { value: 'repeatable_measured', label: 'Repeatable channels with measured cost and conversion', points: 4 },
      { value: 'repeatable_unmeasured', label: 'Consistent channels, but cost and conversion are not measured', points: 2 },
      { value: 'referrals_only', label: 'Only word of mouth and inbound referrals', points: 1 },
      { value: 'ad_hoc', label: 'Customer acquisition is ad hoc', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'No repeatable, measured customer acquisition channel.', action: 'Select two acquisition channels and track cost per lead and conversion for 90 days.', priority: 'medium' },
  },
  {
    key: 'MK5',
    category: 'market',
    subject: 'Market risk awareness',
    text: 'Has the business identified the main external risks to its market?',
    required: true,
    options: [
      { value: 'documented_mitigation', label: 'Key risks are documented with mitigation plans', points: 4 },
      { value: 'identified_only', label: 'Key risks are identified but no mitigation plans exist', points: 2 },
      { value: 'aware_informally', label: 'Risks are discussed informally', points: 1 },
      { value: 'not_considered', label: 'Market risks have not been considered', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Market risks are not documented or mitigated.', action: 'List the top five market risks and record a mitigation step for each.', priority: 'medium' },
  },

  // ---------------- Capital Preparation (15%) ----------------
  {
    key: 'CP1',
    category: 'capital_preparation',
    subject: 'Capital requirement definition',
    text: 'How clearly has the business defined the amount of capital it needs?',
    required: true,
    options: [
      { value: 'costed_amount', label: 'A specific amount built up from a costed plan', points: 4 },
      { value: 'approximate', label: 'An approximate amount based on general estimates', points: 2 },
      { value: 'vague', label: 'A vague sense that more funding is needed', points: 1 },
      { value: 'undefined', label: 'The capital requirement has not been worked out', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'The capital requirement is not defined.', action: 'Build a costed use-of-funds schedule that establishes the exact amount required.', priority: 'high' },
  },
  {
    key: 'CP2',
    category: 'capital_preparation',
    subject: 'Use of funds plan',
    text: 'Is there a written plan for how capital would be deployed?',
    required: true,
    options: [
      { value: 'itemised_milestones', label: 'An itemised plan linked to milestones and timelines', points: 4 },
      { value: 'high_level', label: 'A high-level written plan without milestones', points: 2 },
      { value: 'verbal', label: 'A plan exists only in discussion', points: 1 },
      { value: 'none', label: 'No plan for use of funds', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'No written use-of-funds plan.', action: 'Write an itemised use-of-funds plan linking each amount to a milestone and timeline.', priority: 'high' },
  },
  {
    key: 'CP3',
    category: 'capital_preparation',
    subject: 'Financial projections',
    text: 'Does the business have financial projections for the next three years?',
    required: true,
    options: [
      { value: 'three_year_assumptions', label: 'Three-year projections with documented assumptions', points: 4 },
      { value: 'one_year', label: 'Projections for about one year', points: 2 },
      { value: 'rough', label: 'Rough figures only', points: 1 },
      { value: 'none', label: 'No projections', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'No credible financial projections.', action: 'Prepare three-year projections with written assumptions for revenue, costs and cash.', priority: 'high' },
  },
  {
    key: 'CP4',
    category: 'capital_preparation',
    subject: 'Supporting documentation pack',
    text: 'How ready is the documentation a capital provider would typically request?',
    required: true,
    options: [
      { value: 'organised_pack', label: 'A single organised pack of registration, financial and legal documents is ready', points: 4 },
      { value: 'partially_assembled', label: 'Documents exist but would need to be gathered from several places', points: 2 },
      { value: 'scattered', label: 'Some documents are missing or out of date', points: 1 },
      { value: 'none', label: 'The documentation is not prepared', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Supporting documentation is not assembled.', action: 'Assemble one document pack with registration, tax, financial and contract records in current versions.', priority: 'high' },
  },
  {
    key: 'CP5',
    category: 'capital_preparation',
    subject: 'Understanding of capital options',
    text: 'How well does the leadership understand the capital options available and their implications?',
    required: true,
    options: [
      { value: 'informed_choice', label: 'A considered view of which capital type suits the business and why', points: 4 },
      { value: 'general_understanding', label: 'A general understanding of the main options', points: 2 },
      { value: 'limited', label: 'Limited understanding beyond bank lending', points: 1 },
      { value: 'none', label: 'No understanding of the available options', points: 0 },
      UNKNOWN,
    ],
    rule: { gap: 'Limited understanding of capital options and their implications.', action: 'Review the main capital types and record which are appropriate for the business and why.', priority: 'high' },
  },
];

export const QUESTIONS_BY_CATEGORY: Record<CategoryKey, QuestionDef[]> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.key] = QUESTIONS.filter((q) => q.category === c.key);
    return acc;
  },
  {} as Record<CategoryKey, QuestionDef[]>,
);

export const QUESTION_MAP: Record<string, QuestionDef> = Object.fromEntries(
  QUESTIONS.map((q) => [q.key, q]),
);

export const REQUIRED_QUESTION_KEYS = QUESTIONS.filter((q) => q.required).map((q) => q.key);
