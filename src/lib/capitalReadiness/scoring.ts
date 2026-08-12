/**
 * Deterministic scoring engine for the Capital Readiness Self-Assessment (CR-2026-01).
 * No LLM involvement: identical answers always produce identical output.
 */
import {
  CATEGORIES,
  CategoryKey,
  Priority,
  QUESTIONS,
  QUESTION_MAP,
  QUESTIONNAIRE_VERSION,
  REQUIRED_QUESTION_KEYS,
} from '@/data/capitalReadiness/questionnaire';

/** Map of question key -> selected answer option value. */
export type AnswerMap = Record<string, string>;

export interface CategoryScore {
  category_key: CategoryKey;
  label: string;
  earned_points: number;
  max_points: number;
  /** earned / max * 100 */
  category_percentage: number;
  category_weight: number;
  /** category_percentage * weight */
  weighted_score: number;
}

export interface ActionItem {
  question_key: string;
  category_key: CategoryKey;
  gap: string;
  action: string;
  priority: Priority;
  sort_order: number;
}

export type ReadinessBand = 'early_stage' | 'developing' | 'nearly_ready' | 'capital_ready';

export interface ScoreResult {
  version: typeof QUESTIONNAIRE_VERSION;
  overall_score: number;
  band: ReadinessBand;
  categories: CategoryScore[];
  actions: ActionItem[];
  strongest: CategoryScore[];
  gaps: CategoryScore[];
}

export const BAND_LABELS: Record<ReadinessBand, string> = {
  early_stage: 'Early Stage',
  developing: 'Developing',
  nearly_ready: 'Nearly Ready',
  capital_ready: 'Capital Ready',
};

export const BAND_DESCRIPTIONS: Record<ReadinessBand, string> = {
  early_stage:
    'Foundational structures are still being put in place. Focus on the high priority actions below before engaging capital providers.',
  developing:
    'Some foundations are in place and others still need work. Closing the gaps below will strengthen your position in conversations with capital providers.',
  nearly_ready:
    'Most areas are in reasonable shape. A focused effort on the remaining gaps will improve how prepared you are to engage capital providers.',
  capital_ready:
    'Your preparation across these areas is strong. This reflects preparedness to engage capital providers; it is not a prediction of funding.',
};

/** Round to 4 decimal places, avoiding floating point drift. */
const round4 = (n: number): number => Math.round((n + Number.EPSILON) * 10000) / 10000;

export function pointsFor(questionKey: string, answerValue: string | undefined): number | null {
  const q = QUESTION_MAP[questionKey];
  if (!q || !answerValue) return null;
  const opt = q.options.find((o) => o.value === answerValue);
  return opt ? opt.points : null;
}

export function isUnknownAnswer(questionKey: string, answerValue: string | undefined): boolean {
  const q = QUESTION_MAP[questionKey];
  if (!q || !answerValue) return false;
  return Boolean(q.options.find((o) => o.value === answerValue)?.isUnknown);
}

export function missingRequiredKeys(answers: AnswerMap): string[] {
  return REQUIRED_QUESTION_KEYS.filter((k) => {
    const v = answers[k];
    return !v || pointsFor(k, v) === null;
  });
}

export function isComplete(answers: AnswerMap): boolean {
  return missingRequiredKeys(answers).length === 0;
}

export function bandFor(score: number): ReadinessBand {
  if (score < 40) return 'early_stage';
  if (score < 60) return 'developing';
  if (score < 80) return 'nearly_ready';
  return 'capital_ready';
}

export function answeredCount(answers: AnswerMap): number {
  return QUESTIONS.filter((q) => pointsFor(q.key, answers[q.key]) !== null).length;
}

/**
 * category_percentage = earned / max applicable * 100
 * weighted category score = category_percentage * category weight
 * overall = sum of weighted category scores (0-100)
 */
export function calculateScore(answers: AnswerMap): ScoreResult {
  const categories: CategoryScore[] = CATEGORIES.map((c) => {
    const qs = QUESTIONS.filter((q) => q.category === c.key);
    const applicable = qs.filter((q) => pointsFor(q.key, answers[q.key]) !== null);
    const earned = applicable.reduce((sum, q) => sum + (pointsFor(q.key, answers[q.key]) ?? 0), 0);
    const max = applicable.length * 4;
    const percentage = max > 0 ? round4((earned / max) * 100) : 0;
    return {
      category_key: c.key,
      label: c.label,
      earned_points: earned,
      max_points: max,
      category_percentage: percentage,
      category_weight: c.weight,
      weighted_score: round4(percentage * c.weight),
    };
  });

  const overall = round4(categories.reduce((sum, c) => sum + c.weighted_score, 0));

  const actions: ActionItem[] = QUESTIONS.filter((q) => {
    const p = pointsFor(q.key, answers[q.key]);
    return p !== null && p <= 1;
  }).map((q) => ({
    question_key: q.key,
    category_key: q.category,
    gap: q.rule.gap,
    action: q.rule.action,
    priority: q.rule.priority,
    sort_order: 0,
  }));

  actions.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
    return QUESTIONS.findIndex((q) => q.key === a.question_key) - QUESTIONS.findIndex((q) => q.key === b.question_key);
  });
  actions.forEach((a, i) => {
    a.sort_order = i;
  });

  const ranked = [...categories].sort((a, b) => b.category_percentage - a.category_percentage);

  return {
    version: QUESTIONNAIRE_VERSION,
    overall_score: overall,
    band: bandFor(overall),
    categories,
    actions,
    strongest: ranked.slice(0, 3),
    gaps: [...ranked].reverse().slice(0, 3),
  };
}
