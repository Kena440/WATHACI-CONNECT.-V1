import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QUESTIONNAIRE_VERSION, QUESTION_MAP } from '@/data/capitalReadiness/questionnaire';
import {
  AnswerMap,
  calculateScore,
  isComplete,
  isUnknownAnswer,
  pointsFor,
} from '@/lib/capitalReadiness/scoring';

export interface AssessmentRow {
  id: string;
  user_id: string;
  questionnaire_version: string;
  status: 'draft' | 'submitted';
  overall_score: number | null;
  readiness_band: string | null;
  submitted_at: string | null;
  created_at: string;
}

export const useCapitalReadiness = () => {
  const { user } = useAuth();
  const [draft, setDraft] = useState<AssessmentRow | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [history, setHistory] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('capital_readiness_assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });
    setHistory((data as AssessmentRow[]) ?? []);
  }, [user]);

  const ensureDraft = useCallback(async (): Promise<AssessmentRow | null> => {
    if (!user) return null;
    const { data: existing } = await supabase
      .from('capital_readiness_assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .maybeSingle();

    if (existing) return existing as AssessmentRow;

    const { data, error } = await supabase
      .from('capital_readiness_assessments')
      .insert({ user_id: user.id, questionnaire_version: QUESTIONNAIRE_VERSION, status: 'draft' })
      .select()
      .single();
    if (error) {
      console.error('Failed to create assessment draft', error);
      return null;
    }
    return data as AssessmentRow;
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const d = await ensureDraft();
      if (cancelled) return;
      setDraft(d);
      if (d) {
        const { data: responses } = await supabase
          .from('capital_readiness_responses')
          .select('question_key, answer_value')
          .eq('assessment_id', d.id);
        if (!cancelled) {
          setAnswers(
            Object.fromEntries((responses ?? []).map((r) => [r.question_key, r.answer_value])) as AnswerMap,
          );
        }
      }
      await loadHistory();
      if (!cancelled) setLoading(false);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [user, ensureDraft, loadHistory]);

  /** Persist a single answer immediately so refreshes never lose progress. */
  const setAnswer = useCallback(
    async (questionKey: string, answerValue: string) => {
      setAnswers((prev) => ({ ...prev, [questionKey]: answerValue }));
      if (!draft) return;
      const q = QUESTION_MAP[questionKey];
      const points = pointsFor(questionKey, answerValue);
      if (!q || points === null) return;
      setSaving(true);
      const { error } = await supabase.from('capital_readiness_responses').upsert(
        {
          assessment_id: draft.id,
          question_key: questionKey,
          category_key: q.category,
          answer_value: answerValue,
          points,
          is_unknown: isUnknownAnswer(questionKey, answerValue),
        },
        { onConflict: 'assessment_id,question_key' },
      );
      if (error) console.error('Failed to save answer', error);
      setSaving(false);
    },
    [draft],
  );

  const submit = useCallback(async (): Promise<string | null> => {
    if (!draft || !user || !isComplete(answers)) return null;
    setSubmitting(true);
    try {
      const result = calculateScore(answers);

      const { error: catError } = await supabase.from('capital_readiness_category_scores').insert(
        result.categories.map((c) => ({
          assessment_id: draft.id,
          category_key: c.category_key,
          earned_points: c.earned_points,
          max_points: c.max_points,
          category_percentage: c.category_percentage,
          category_weight: c.category_weight,
          weighted_score: c.weighted_score,
        })),
      );
      if (catError) throw catError;

      if (result.actions.length > 0) {
        const { error: actError } = await supabase.from('capital_readiness_actions').insert(
          result.actions.map((a) => ({
            assessment_id: draft.id,
            question_key: a.question_key,
            category_key: a.category_key,
            gap: a.gap,
            action: a.action,
            priority: a.priority,
            sort_order: a.sort_order,
          })),
        );
        if (actError) throw actError;
      }

      const { error } = await supabase
        .from('capital_readiness_assessments')
        .update({
          status: 'submitted',
          overall_score: result.overall_score,
          readiness_band: result.band,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', draft.id);
      if (error) throw error;

      const submittedId = draft.id;
      setDraft(null);
      setAnswers({});
      await loadHistory();
      return submittedId;
    } catch (e) {
      console.error('Failed to submit assessment', e);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [draft, user, answers, loadHistory]);

  /** Start a fresh attempt. Submitted attempts remain untouched historical snapshots. */
  const startNewAttempt = useCallback(async () => {
    const d = await ensureDraft();
    setDraft(d);
    setAnswers({});
    return d;
  }, [ensureDraft]);

  return {
    draft,
    answers,
    history,
    loading,
    saving,
    submitting,
    setAnswer,
    submit,
    startNewAttempt,
    reloadHistory: loadHistory,
  };
};

export interface AssessmentDetail {
  assessment: AssessmentRow;
  categories: Array<{
    category_key: string;
    category_percentage: number;
    category_weight: number;
    weighted_score: number;
    earned_points: number;
    max_points: number;
  }>;
  actions: Array<{
    question_key: string;
    category_key: string;
    gap: string;
    action: string;
    priority: 'high' | 'medium';
    sort_order: number;
  }>;
}

export const fetchAssessmentDetail = async (id: string): Promise<AssessmentDetail | null> => {
  const { data: assessment } = await supabase
    .from('capital_readiness_assessments')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!assessment) return null;

  const [{ data: categories }, { data: actions }] = await Promise.all([
    supabase.from('capital_readiness_category_scores').select('*').eq('assessment_id', id),
    supabase
      .from('capital_readiness_actions')
      .select('*')
      .eq('assessment_id', id)
      .order('sort_order', { ascending: true }),
  ]);

  return {
    assessment: assessment as AssessmentRow,
    categories: (categories as AssessmentDetail['categories']) ?? [],
    actions: (actions as AssessmentDetail['actions']) ?? [],
  };
};
