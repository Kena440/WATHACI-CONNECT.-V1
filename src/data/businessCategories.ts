/**
 * Shared business category taxonomy.
 * Mirrors the canonical list in the `business_categories` table and is used on
 * both the SME-needs side and the freelancer-services side so the two can be matched.
 */
export const businessCategories = [
  'Access to Finance',
  'Marketing & Sales',
  'Legal & Compliance',
  'Bookkeeping & Tax',
  'HR & Recruitment',
  'Digital & IT',
  'Business Strategy',
  'Operations & Supply Chain',
  'Business Development',
  'Other',
] as const;

export type BusinessCategory = (typeof businessCategories)[number];

export const urgencyOptions = [
  { value: 'low', label: 'Low — exploring options' },
  { value: 'medium', label: 'Medium — within a few months' },
  { value: 'high', label: 'High — urgent' },
] as const;

export interface SmeNeedInput {
  id?: string;
  category: string;
  description?: string | null;
  budget_range_min?: number | null;
  budget_range_max?: number | null;
  urgency: 'low' | 'medium' | 'high';
}

export interface FreelancerServiceInput {
  id?: string;
  category: string;
  title: string;
  deliverable?: string | null;
  price?: number | null;
  currency: string;
}
