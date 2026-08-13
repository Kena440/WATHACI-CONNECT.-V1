import { describe, expect, it } from 'vitest';
import {
  ACTION_STATUSES,
  PlanAction,
  computeProgress,
  derivePlanPriority,
  effectivePriority,
  isOverdue,
  reassessmentEligibility,
} from '@/lib/capitalReadiness/improvementPlan';

const base = (over: Partial<PlanAction> = {}): PlanAction => ({
  id: over.id ?? 'a1',
  assessment_id: 'as1',
  question_key: 'G1',
  category_key: 'governance',
  gap: 'gap',
  action: 'action',
  priority: 'high',
  plan_priority: 'high',
  sort_order: 0,
  responsible_person: null,
  target_date: null,
  required_evidence: null,
  status: 'not_started',
  notes: null,
  submitted_at: null,
  reviewed_at: null,
  completed_at: null,
  review_comment: null,
  ...over,
});

describe('status vocabulary', () => {
  it('uses exactly the six Phase 3 statuses', () => {
    expect(ACTION_STATUSES).toEqual([
      'not_started',
      'in_progress',
      'submitted',
      'under_review',
      'completed',
      'rejected',
    ]);
  });
});

describe('derivePlanPriority', () => {
  it('escalates zero-scoring high-priority gaps to critical', () => {
    expect(derivePlanPriority('high', 0)).toBe('critical');
    expect(derivePlanPriority('high', 1)).toBe('high');
    expect(derivePlanPriority('medium', 1)).toBe('medium');
    expect(derivePlanPriority('medium', 2)).toBe('low');
  });
  it('is deterministic', () => {
    expect(derivePlanPriority('high', 0)).toBe(derivePlanPriority('high', 0));
  });
});

describe('isOverdue', () => {
  const now = new Date(2026, 5, 15);
  it('is false without a target date', () => {
    expect(isOverdue(base(), now)).toBe(false);
  });
  it('is true only when past due and not completed', () => {
    expect(isOverdue(base({ target_date: '2026-06-14' }), now)).toBe(true);
    expect(isOverdue(base({ target_date: '2026-06-15' }), now)).toBe(false);
    expect(isOverdue(base({ target_date: '2026-06-16' }), now)).toBe(false);
    expect(isOverdue(base({ target_date: '2026-01-01', status: 'completed' }), now)).toBe(false);
  });
});

describe('computeProgress', () => {
  it('counts totals, overdue, critical and category progress', () => {
    const now = new Date(2026, 5, 15);
    const actions = [
      base({ id: '1', status: 'completed' }),
      base({ id: '2', plan_priority: 'critical', target_date: '2026-01-01' }),
      base({ id: '3', category_key: 'financial', status: 'submitted' }),
    ];
    const p = computeProgress(actions, now);
    expect(p.total).toBe(3);
    expect(p.completed).toBe(1);
    expect(p.outstanding).toBe(2);
    expect(p.overdue).toBe(1);
    expect(p.critical).toBe(1);
    expect(p.awaitingReview).toBe(1);
    expect(p.progressPercentage).toBe(33);
    expect(p.byCategory.find((c) => c.category_key === 'governance')?.percentage).toBe(50);
  });
});

describe('reassessmentEligibility', () => {
  it('blocks while critical actions are outstanding', () => {
    const r = reassessmentEligibility([
      base({ id: '1', status: 'completed' }),
      base({ id: '2', plan_priority: 'critical' }),
    ]);
    expect(r.eligible).toBe(false);
    expect(r.outstandingCritical).toBe(1);
  });
  it('blocks below the 70% completion threshold', () => {
    const actions = Array.from({ length: 10 }, (_, i) =>
      base({ id: String(i), status: i < 5 ? 'completed' : 'in_progress' }),
    );
    const r = reassessmentEligibility(actions);
    expect(r.requiredCompleted).toBe(7);
    expect(r.eligible).toBe(false);
  });
  it('allows once threshold met and no critical outstanding', () => {
    const actions = Array.from({ length: 10 }, (_, i) =>
      base({ id: String(i), status: i < 7 ? 'completed' : 'in_progress' }),
    );
    expect(reassessmentEligibility(actions).eligible).toBe(true);
  });
});

describe('effectivePriority', () => {
  it('falls back to the Phase 2 priority when not yet derived', () => {
    expect(effectivePriority(base({ plan_priority: null, priority: 'high' }))).toBe('high');
    expect(effectivePriority(base({ plan_priority: null, priority: 'medium' }))).toBe('low');
  });
});
