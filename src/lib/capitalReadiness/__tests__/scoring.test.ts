import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  QUESTIONS,
  QUESTIONS_BY_CATEGORY,
  QUESTIONNAIRE_VERSION,
} from '@/data/capitalReadiness/questionnaire';
import {
  AnswerMap,
  bandFor,
  calculateScore,
  isComplete,
  missingRequiredKeys,
} from '@/lib/capitalReadiness/scoring';

/** Build an answer set where every question is answered with the option worth `points`. */
const uniformAnswers = (points: 0 | 1 | 2 | 4): AnswerMap =>
  Object.fromEntries(
    QUESTIONS.map((q) => [q.key, q.options.find((o) => o.points === points && !o.isUnknown)!.value]),
  );

describe('questionnaire definition CR-2026-01', () => {
  it('has 35 questions across 7 weighted categories', () => {
    expect(QUESTIONNAIRE_VERSION).toBe('CR-2026-01');
    expect(QUESTIONS).toHaveLength(35);
    expect(CATEGORIES).toHaveLength(7);
    CATEGORIES.forEach((c) => expect(QUESTIONS_BY_CATEGORY[c.key]).toHaveLength(5));
    expect(CATEGORIES.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1, 10);
  });

  it('uses the exact question keys and only 0/1/2/4 point values', () => {
    expect(QUESTIONS.map((q) => q.key)).toEqual([
      'G1','G2','G3','G4','G5',
      'F1','F2','F3','F4','F5',
      'L1','L2','L3','L4','L5',
      'B1','B2','B3','B4','B5',
      'M1','M2','M3','M4','M5',
      'MK1','MK2','MK3','MK4','MK5',
      'CP1','CP2','CP3','CP4','CP5',
    ]);
    QUESTIONS.forEach((q) => {
      expect(q.options.filter((o) => !o.isUnknown).map((o) => o.points)).toEqual([4, 2, 1, 0]);
      const unknowns = q.options.filter((o) => o.isUnknown);
      unknowns.forEach((u) => expect(u.points).toBe(0));
    });
  });
});

describe('completeness', () => {
  it('an incomplete assessment cannot be submitted and yields no final band', () => {
    const partial: AnswerMap = { G1: 'documented_verified', F1: 'accounting_software' };
    expect(isComplete(partial)).toBe(false);
    expect(missingRequiredKeys(partial)).toHaveLength(33);
  });

  it('a fully answered assessment is complete', () => {
    expect(isComplete(uniformAnswers(4))).toBe(true);
  });
});

describe('scoring', () => {
  it('all-best answers score exactly 100 and band Capital Ready', () => {
    const r = calculateScore(uniformAnswers(4));
    expect(r.overall_score).toBe(100);
    expect(r.band).toBe('capital_ready');
    expect(r.actions).toHaveLength(0);
  });

  it('all-worst answers score exactly 0, band Early Stage, and flag 35 high/medium actions', () => {
    const r = calculateScore(uniformAnswers(0));
    expect(r.overall_score).toBe(0);
    expect(r.band).toBe('early_stage');
    expect(r.actions).toHaveLength(35);
    expect(r.actions[0].priority).toBe('high');
    expect(r.actions[r.actions.length - 1].priority).toBe('medium');
  });

  it('all 2-point answers score exactly 50 (Developing)', () => {
    const r = calculateScore(uniformAnswers(2));
    expect(r.overall_score).toBe(50);
    expect(r.band).toBe('developing');
    expect(r.actions).toHaveLength(0);
  });

  it('all 1-point answers score exactly 25 and flag every question', () => {
    const r = calculateScore(uniformAnswers(1));
    expect(r.overall_score).toBe(25);
    expect(r.actions).toHaveLength(35);
  });

  it('unknown answers score zero, distinctly from a 0-point answer', () => {
    const answers = uniformAnswers(4);
    answers.G1 = 'unknown';
    const r = calculateScore(answers);
    const gov = r.categories.find((c) => c.category_key === 'governance')!;
    expect(gov.earned_points).toBe(16);
    expect(gov.category_percentage).toBe(80);
    // 80 * 0.15 + 100 * 0.85 = 97
    expect(r.overall_score).toBe(97);
    expect(r.actions.map((a) => a.question_key)).toContain('G1');
  });

  it('known fixture answer set produces the exact expected score and band', () => {
    // Governance 4,4,2,2,1 = 13/20 = 65%
    // Financial 4,2,2,1,0 = 9/20 = 45%
    // Legal 4,4,2,2,2 = 14/20 = 70%
    // Business model 2,2,2,1,1 = 8/20 = 40%
    // Management 4,4,2,2,2 = 14/20 = 70%
    // Market 2,2,1,1,0 = 6/20 = 30%
    // Capital prep 2,1,1,0,2 = 6/20 = 30%
    const fixture: Array<[string, 0 | 1 | 2 | 4]> = [
      ['G1', 4], ['G2', 4], ['G3', 2], ['G4', 2], ['G5', 1],
      ['F1', 4], ['F2', 2], ['F3', 2], ['F4', 1], ['F5', 0],
      ['L1', 4], ['L2', 4], ['L3', 2], ['L4', 2], ['L5', 2],
      ['B1', 2], ['B2', 2], ['B3', 2], ['B4', 1], ['B5', 1],
      ['M1', 4], ['M2', 4], ['M3', 2], ['M4', 2], ['M5', 2],
      ['MK1', 2], ['MK2', 2], ['MK3', 1], ['MK4', 1], ['MK5', 0],
      ['CP1', 2], ['CP2', 1], ['CP3', 1], ['CP4', 0], ['CP5', 2],
    ];
    const answers: AnswerMap = Object.fromEntries(
      fixture.map(([key, pts]) => {
        const q = QUESTIONS.find((x) => x.key === key)!;
        return [key, q.options.find((o) => o.points === pts && !o.isUnknown)!.value];
      }),
    );

    const r = calculateScore(answers);
    const pct = Object.fromEntries(r.categories.map((c) => [c.category_key, c.category_percentage]));
    expect(pct).toEqual({
      governance: 65,
      financial_management: 45,
      legal_compliance: 70,
      business_model: 40,
      management: 70,
      market: 30,
      capital_preparation: 30,
    });
    // 65*.15 + 45*.20 + 70*.15 + 40*.15 + 70*.10 + 30*.10 + 30*.15 = 49.75
    expect(r.overall_score).toBe(49.75);
    expect(r.band).toBe('developing');
    expect(r.actions.map((a) => a.question_key).sort()).toEqual(
      ['B4', 'B5', 'CP2', 'CP3', 'CP4', 'F4', 'F5', 'G5', 'MK3', 'MK4', 'MK5'].sort(),
    );
    // high priority (governance/financial/legal/capital prep) sorted before medium
    expect(r.actions.slice(0, 6).map((a) => a.question_key)).toEqual([
      'G5', 'F4', 'F5', 'CP2', 'CP3', 'CP4',
    ]);
  });

  it('recalculation is idempotent', () => {
    const answers = uniformAnswers(2);
    answers.G1 = 'verbal_only';
    answers.MK5 = 'not_considered';
    const a = calculateScore(answers);
    const b = calculateScore(answers);
    const c = calculateScore({ ...answers });
    expect(b).toEqual(a);
    expect(c).toEqual(a);
  });
});

describe('bands', () => {
  it('maps score ranges to the specified bands', () => {
    expect(bandFor(0)).toBe('early_stage');
    expect(bandFor(39.99)).toBe('early_stage');
    expect(bandFor(40)).toBe('developing');
    expect(bandFor(59.99)).toBe('developing');
    expect(bandFor(60)).toBe('nearly_ready');
    expect(bandFor(79.99)).toBe('nearly_ready');
    expect(bandFor(80)).toBe('capital_ready');
    expect(bandFor(100)).toBe('capital_ready');
  });
});
