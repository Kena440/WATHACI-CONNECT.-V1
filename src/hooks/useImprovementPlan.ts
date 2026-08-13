import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QUESTIONNAIRE_VERSION } from '@/data/capitalReadiness/questionnaire';
import {
  ActionStatus,
  PlanAction,
  derivePlanPriority,
  reassessmentEligibility,
} from '@/lib/capitalReadiness/improvementPlan';
import type { AssessmentRow } from '@/hooks/useCapitalReadiness';

export interface EvidenceRow {
  id: string;
  action_id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  verification_status: string;
  reviewer_comment: string | null;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  action_id: string;
  actor_id: string | null;
  actor_role: string;
  from_status: string | null;
  to_status: string | null;
  comment: string | null;
  created_at: string;
}

export const EVIDENCE_BUCKET = 'capital-readiness-evidence';

export const useImprovementPlan = (assessmentId?: string) => {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentRow | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [actions, setActions] = useState<PlanAction[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadActions = useCallback(async (id: string) => {
    const [{ data: acts }, { data: responses }] = await Promise.all([
      supabase
        .from('capital_readiness_actions')
        .select('*')
        .eq('assessment_id', id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('capital_readiness_responses')
        .select('question_key, points')
        .eq('assessment_id', id),
    ]);

    const rows = (acts ?? []) as unknown as PlanAction[];
    const pointsByKey = Object.fromEntries(
      (responses ?? []).map((r) => [r.question_key, r.points as number]),
    );

    // Derive plan priority once, deterministically, for rows created before Phase 3.
    const missing = rows.filter((r) => !r.plan_priority);
    if (missing.length > 0) {
      await Promise.all(
        missing.map((r) => {
          const derived = derivePlanPriority(r.priority, pointsByKey[r.question_key]);
          r.plan_priority = derived;
          return supabase
            .from('capital_readiness_actions')
            .update({ plan_priority: derived })
            .eq('id', r.id);
        }),
      );
    }
    setActions([...rows]);

    const actionIds = rows.map((r) => r.id);
    if (actionIds.length > 0) {
      const [{ data: ev }, { data: rv }] = await Promise.all([
        supabase
          .from('capital_readiness_action_evidence')
          .select('*')
          .in('action_id', actionIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('capital_readiness_action_reviews')
          .select('*')
          .in('action_id', actionIds)
          .order('created_at', { ascending: false }),
      ]);
      setEvidence((ev ?? []) as EvidenceRow[]);
      setReviews((rv ?? []) as ReviewRow[]);
    } else {
      setEvidence([]);
      setReviews([]);
    }
  }, []);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: list } = await supabase
      .from('capital_readiness_assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });

    const history = (list ?? []) as AssessmentRow[];
    setAssessments(history);
    const target = assessmentId
      ? history.find((h) => h.id === assessmentId) ?? history[0]
      : history[0];
    setAssessment(target ?? null);
    if (target) await loadActions(target.id);
    else setActions([]);
    setLoading(false);
  }, [user, assessmentId, loadActions]);

  useEffect(() => {
    load();
  }, [load]);

  const updateAction = useCallback(
    async (id: string, patch: Partial<PlanAction>) => {
      setBusy(true);
      const { error } = await supabase.from('capital_readiness_actions').update(patch).eq('id', id);
      if (!error) {
        setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      }
      setBusy(false);
      return error;
    },
    [],
  );

  const changeStatus = useCallback(
    async (action: PlanAction, next: ActionStatus, comment?: string) => {
      setBusy(true);
      const { error } = await supabase
        .from('capital_readiness_actions')
        .update({ status: next })
        .eq('id', action.id);
      if (!error && user) {
        await supabase.from('capital_readiness_action_reviews').insert({
          action_id: action.id,
          actor_id: user.id,
          actor_role: 'sme',
          from_status: action.status,
          to_status: next,
          comment: comment ?? null,
        });
        await loadActions(action.assessment_id);
      }
      setBusy(false);
      return error;
    },
    [user, loadActions],
  );

  const uploadEvidence = useCallback(
    async (action: PlanAction, file: File) => {
      if (!user) return new Error('Not authenticated');
      setBusy(true);
      const path = `${user.id}/${action.id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from(EVIDENCE_BUCKET).upload(path, file);
      if (upErr) {
        setBusy(false);
        return upErr;
      }
      const { error } = await supabase.from('capital_readiness_action_evidence').insert({
        action_id: action.id,
        user_id: user.id,
        storage_path: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      });
      if (!error) await loadActions(action.assessment_id);
      setBusy(false);
      return error;
    },
    [user, loadActions],
  );

  const deleteEvidence = useCallback(
    async (row: EvidenceRow) => {
      setBusy(true);
      await supabase.storage.from(EVIDENCE_BUCKET).remove([row.storage_path]);
      await supabase.from('capital_readiness_action_evidence').delete().eq('id', row.id);
      setEvidence((prev) => prev.filter((e) => e.id !== row.id));
      setBusy(false);
    },
    [],
  );

  /**
   * Starts a brand-new Phase 2 assessment cycle. The source assessment, its score,
   * responses and actions are left completely untouched.
   */
  const requestReassessment = useCallback(async (): Promise<string | null> => {
    if (!user || !assessment) return null;
    const eligibility = reassessmentEligibility(actions);
    if (!eligibility.eligible) return null;
    setBusy(true);
    try {
      const { data: existingDraft } = await supabase
        .from('capital_readiness_assessments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .maybeSingle();

      let newId = existingDraft?.id ?? null;
      if (!newId) {
        const { data, error } = await supabase
          .from('capital_readiness_assessments')
          .insert({
            user_id: user.id,
            questionnaire_version: QUESTIONNAIRE_VERSION,
            status: 'draft',
          })
          .select('id')
          .single();
        if (error) throw error;
        newId = data.id;
      }

      await supabase.from('capital_readiness_reassessment_requests').insert({
        user_id: user.id,
        source_assessment_id: assessment.id,
        new_assessment_id: newId,
        total_actions: actions.length,
        completed_actions: actions.filter((a) => a.status === 'completed').length,
        status: 'cycle_started',
      });
      return newId;
    } catch (e) {
      console.error('Failed to request reassessment', e);
      return null;
    } finally {
      setBusy(false);
    }
  }, [user, assessment, actions]);

  return {
    assessment,
    assessments,
    actions,
    evidence,
    reviews,
    loading,
    busy,
    reload: load,
    updateAction,
    changeStatus,
    uploadEvidence,
    deleteEvidence,
    requestReassessment,
    setAssessmentId: (id: string) => {
      const target = assessments.find((a) => a.id === id);
      if (target) {
        setAssessment(target);
        loadActions(target.id);
      }
    },
  };
};

export const signedEvidenceUrl = async (path: string): Promise<string | null> => {
  const { data } = await supabase.storage.from(EVIDENCE_BUCKET).createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
};
