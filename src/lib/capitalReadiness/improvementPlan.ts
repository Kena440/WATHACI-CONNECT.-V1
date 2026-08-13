/**
 * Phase 3 — Capital Readiness Improvement Plan.
 *
 * Deterministic, no LLM. Phase 2 gap/action rules remain the single source of truth:
 * nothing here invents gaps, changes assessment scores, or edits historical records.
 * It only derives plan-level metadata (priority, progress, overdue) from Phase 2 output.
 */
import { CATEGORIES, CategoryKey, Priority } from '@/data/capitalReadiness/questionnaire';

export const ACTION_STATUSES = [
  'not_started',
  'in_progress',
  'submitted',
  'under_review',
  'completed',
  'rejected',
] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  under_review: 'Under Review',
  completed: 'Completed',
  rejected: 'Rejected/Needs Revision',
};

/** Statuses an SME may set themselves. Completion is verified by WATHACI only. */
export const SME_SETTABLE_STATUSES: ActionStatus[] = ['not_started', 'in_progress', 'submitted'];
/** Statuses reserved for WATHACI reviewers. */
export const ADMIN_SETTABLE_STATUSES: ActionStatus[] = [
  'under_review',
  'completed',
  'rejected',
  'in_progress',
];

export const PLAN_PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;
export type PlanPriority = (typeof PLAN_PRIORITIES)[number];

export const PLAN_PRIORITY_LABELS: Record<PlanPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PLAN_PRIORITY_ORDER: Record<PlanPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Deterministic escalation of the Phase 2 priority (high/medium) into the Phase 3
 * four-level scale, using the score the SME recorded for the underlying question.
 * The stored Phase 2 `priority` value is never modified.
 *
 *   high   + 0 points  -> critical
 *   high   + >0 points -> high
 *   medium + <=1 point -> medium
 *   medium + >1 point  -> low
 */
export function derivePlanPriority(
  phase2Priority: Priority | string,
  points: number | null | undefined,
): PlanPriority {
  const p = points ?? 0;
  if (phase2Priority === 'critical' || phase2Priority === 'low') return phase2Priority;
  if (phase2Priority === 'high') return p <= 0 ? 'critical' : 'high';
  return p <= 1 ? 'medium' : 'low';
}

export interface PlanAction {
  id: string;
  assessment_id: string;
  question_key: string;
  category_key: string;
  gap: string;
  action: string;
  priority: string;
  plan_priority: string | null;
  sort_order: number;
  responsible_person: string | null;
  target_date: string | null;
  required_evidence: string | null;
  status: string;
  notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  completed_at: string | null;
  review_comment: string | null;
}

export const effectivePriority = (a: PlanAction): PlanPriority =>
  (a.plan_priority as PlanPriority) ??
  derivePlanPriority(a.priority, a.priority === 'high' ? 1 : 2);

/** Overdue only when a target date is in the past and the action is not Completed. */
export function isOverdue(action: PlanAction, now: Date = new Date()): boolean {
  if (!action.target_date) return false;
  if (action.status === 'completed') return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = action.target_date.split('-').map(Number);
  if (!y || !m || !d) return false;
  return new Date(y, m - 1, d).getTime() < today.getTime();
}

export interface PlanProgress {
  total: number;
  completed: number;
  outstanding: number;
  overdue: number;
  critical: number;
  awaitingReview: number;
  progressPercentage: number;
  byCategory: Array<{
    category_key: CategoryKey;
    label: string;
    total: number;
    completed: number;
    percentage: number;
  }>;
}

export function computeProgress(actions: PlanAction[], now: Date = new Date()): PlanProgress {
  const total = actions.length;
  const completed = actions.filter((a) => a.status === 'completed').length;
  const overdue = actions.filter((a) => isOverdue(a, now)).length;
  const critical = actions.filter(
    (a) => effectivePriority(a) === 'critical' && a.status !== 'completed',
  ).length;
  const awaitingReview = actions.filter((a) =>
    ['submitted', 'under_review'].includes(a.status),
  ).length;

  const byCategory = CATEGORIES.map((c) => {
    const inCat = actions.filter((a) => a.category_key === c.key);
    const done = inCat.filter((a) => a.status === 'completed').length;
    return {
      category_key: c.key,
      label: c.label,
      total: inCat.length,
      completed: done,
      percentage: inCat.length === 0 ? 0 : Math.round((done / inCat.length) * 100),
    };
  }).filter((c) => c.total > 0);

  return {
    total,
    completed,
    outstanding: total - completed,
    overdue,
    critical,
    awaitingReview,
    progressPercentage: total === 0 ? 100 : Math.round((completed / total) * 100),
    byCategory,
  };
}

/**
 * Reassessment threshold (explicit and deterministic):
 * every Critical action verified as Completed, AND at least 70% of all actions
 * verified as Completed. Requesting a reassessment never alters the source assessment.
 */
export const REASSESSMENT_COMPLETION_THRESHOLD = 0.7;

export interface ReassessmentEligibility {
  eligible: boolean;
  requiredCompleted: number;
  completed: number;
  outstandingCritical: number;
  reason: string;
}

export function reassessmentEligibility(actions: PlanAction[]): ReassessmentEligibility {
  const total = actions.length;
  const completed = actions.filter((a) => a.status === 'completed').length;
  const outstandingCritical = actions.filter(
    (a) => effectivePriority(a) === 'critical' && a.status !== 'completed',
  ).length;
  const requiredCompleted = Math.ceil(total * REASSESSMENT_COMPLETION_THRESHOLD);

  if (total === 0) {
    return {
      eligible: true,
      requiredCompleted: 0,
      completed: 0,
      outstandingCritical: 0,
      reason: 'No outstanding actions from this assessment.',
    };
  }
  if (outstandingCritical > 0) {
    return {
      eligible: false,
      requiredCompleted,
      completed,
      outstandingCritical,
      reason: `${outstandingCritical} Critical action(s) still need WATHACI verification.`,
    };
  }
  if (completed < requiredCompleted) {
    return {
      eligible: false,
      requiredCompleted,
      completed,
      outstandingCritical,
      reason: `${completed} of ${requiredCompleted} required verified actions completed (${Math.round(
        REASSESSMENT_COMPLETION_THRESHOLD * 100,
      )}% of ${total}).`,
    };
  }
  return {
    eligible: true,
    requiredCompleted,
    completed,
    outstandingCritical,
    reason: 'Threshold met — you can request a new assessment cycle.',
  };
}

export const categoryLabel = (key: string) =>
  CATEGORIES.find((c) => c.key === (key as CategoryKey))?.label ?? key;
