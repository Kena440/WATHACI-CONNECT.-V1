-- ============ 1. Extend capital_readiness_actions ============
ALTER TABLE public.capital_readiness_actions
  DROP CONSTRAINT IF EXISTS capital_readiness_actions_priority_check;
ALTER TABLE public.capital_readiness_actions
  ADD CONSTRAINT capital_readiness_actions_priority_check
  CHECK (priority IN ('critical','high','medium','low'));

ALTER TABLE public.capital_readiness_actions
  ADD COLUMN IF NOT EXISTS plan_priority text CHECK (plan_priority IN ('critical','high','medium','low')),
  ADD COLUMN IF NOT EXISTS responsible_person text,
  ADD COLUMN IF NOT EXISTS target_date date,
  ADD COLUMN IF NOT EXISTS required_evidence text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_comment text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.capital_readiness_actions
  DROP CONSTRAINT IF EXISTS capital_readiness_actions_status_check;
ALTER TABLE public.capital_readiness_actions
  ADD CONSTRAINT capital_readiness_actions_status_check
  CHECK (status IN ('not_started','in_progress','submitted','under_review','completed','rejected'));

CREATE INDEX IF NOT EXISTS capital_readiness_actions_status_idx
  ON public.capital_readiness_actions (status);

-- ============ 2. Evidence ============
CREATE TABLE IF NOT EXISTS public.capital_readiness_action_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL REFERENCES public.capital_readiness_actions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','accepted','rejected')),
  reviewer_comment text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cr_action_evidence_action_idx
  ON public.capital_readiness_action_evidence (action_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.capital_readiness_action_evidence TO authenticated;
GRANT ALL ON public.capital_readiness_action_evidence TO service_role;
ALTER TABLE public.capital_readiness_action_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins read evidence"
  ON public.capital_readiness_action_evidence FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Owners upload own evidence"
  ON public.capital_readiness_action_evidence FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.capital_readiness_actions ac
      JOIN public.capital_readiness_assessments a ON a.id = ac.assessment_id
      WHERE ac.id = action_id AND a.user_id = auth.uid()
    )
  );
CREATE POLICY "Owners delete own pending evidence"
  ON public.capital_readiness_action_evidence FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND verification_status = 'pending');
CREATE POLICY "Admins review evidence"
  ON public.capital_readiness_action_evidence FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============ 3. Review audit trail ============
CREATE TABLE IF NOT EXISTS public.capital_readiness_action_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL REFERENCES public.capital_readiness_actions(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  actor_role text NOT NULL DEFAULT 'sme' CHECK (actor_role IN ('sme','admin')),
  from_status text,
  to_status text,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cr_action_reviews_action_idx
  ON public.capital_readiness_action_reviews (action_id, created_at DESC);

GRANT SELECT, INSERT ON public.capital_readiness_action_reviews TO authenticated;
GRANT ALL ON public.capital_readiness_action_reviews TO service_role;
ALTER TABLE public.capital_readiness_action_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins read action reviews"
  ON public.capital_readiness_action_reviews FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.capital_readiness_actions ac
      JOIN public.capital_readiness_assessments a ON a.id = ac.assessment_id
      WHERE ac.id = action_id AND a.user_id = auth.uid()
    )
  );
CREATE POLICY "Participants insert action reviews"
  ON public.capital_readiness_action_reviews FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND (
      public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.capital_readiness_actions ac
        JOIN public.capital_readiness_assessments a ON a.id = ac.assessment_id
        WHERE ac.id = action_id AND a.user_id = auth.uid()
      )
    )
  );

-- ============ 4. Reassessment requests ============
CREATE TABLE IF NOT EXISTS public.capital_readiness_reassessment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_assessment_id uuid NOT NULL REFERENCES public.capital_readiness_assessments(id) ON DELETE CASCADE,
  new_assessment_id uuid REFERENCES public.capital_readiness_assessments(id) ON DELETE SET NULL,
  total_actions integer NOT NULL DEFAULT 0,
  completed_actions integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','cycle_started')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cr_reassessment_user_idx
  ON public.capital_readiness_reassessment_requests (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.capital_readiness_reassessment_requests TO authenticated;
GRANT ALL ON public.capital_readiness_reassessment_requests TO service_role;
ALTER TABLE public.capital_readiness_reassessment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins read reassessment requests"
  ON public.capital_readiness_reassessment_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Owners create reassessment requests"
  ON public.capital_readiness_reassessment_requests FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.capital_readiness_assessments a
      WHERE a.id = source_assessment_id AND a.user_id = auth.uid() AND a.status = 'submitted'
    )
  );
CREATE POLICY "Owners update own reassessment requests"
  ON public.capital_readiness_reassessment_requests FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============ 5. Action update policies ============
GRANT UPDATE ON public.capital_readiness_actions TO authenticated;

CREATE POLICY "Owners update own plan actions"
  ON public.capital_readiness_actions FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.capital_readiness_assessments a
    WHERE a.id = assessment_id AND a.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.capital_readiness_assessments a
    WHERE a.id = assessment_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "Admins update plan actions"
  ON public.capital_readiness_actions FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============ 6. Guard trigger: protect Phase 2 fields + status workflow ============
CREATE OR REPLACE FUNCTION public.capital_readiness_action_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin boolean;
BEGIN
  v_admin := public.is_admin(auth.uid());

  IF NEW.assessment_id IS DISTINCT FROM OLD.assessment_id
     OR NEW.question_key IS DISTINCT FROM OLD.question_key
     OR NEW.category_key IS DISTINCT FROM OLD.category_key
     OR NEW.gap IS DISTINCT FROM OLD.gap
     OR NEW.action IS DISTINCT FROM OLD.action
     OR NEW.priority IS DISTINCT FROM OLD.priority
     OR NEW.sort_order IS DISTINCT FROM OLD.sort_order THEN
    RAISE EXCEPTION 'Assessment findings are immutable';
  END IF;

  IF OLD.plan_priority IS NOT NULL AND NEW.plan_priority IS DISTINCT FROM OLD.plan_priority THEN
    RAISE EXCEPTION 'Plan priority is derived and cannot be changed';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT v_admin THEN
      IF NEW.status NOT IN ('not_started','in_progress','submitted') THEN
        RAISE EXCEPTION 'Only WATHACI reviewers can set status %', NEW.status;
      END IF;
      IF OLD.status IN ('completed','under_review') THEN
        RAISE EXCEPTION 'This action is locked pending WATHACI review';
      END IF;
    END IF;

    IF NEW.status = 'submitted' THEN
      NEW.submitted_at := now();
    END IF;
    IF NEW.status IN ('under_review','completed','rejected') THEN
      NEW.reviewed_at := now();
    END IF;
    NEW.completed_at := CASE WHEN NEW.status = 'completed' THEN now() ELSE NULL END;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS capital_readiness_action_guard_trg ON public.capital_readiness_actions;
CREATE TRIGGER capital_readiness_action_guard_trg
  BEFORE UPDATE ON public.capital_readiness_actions
  FOR EACH ROW EXECUTE FUNCTION public.capital_readiness_action_guard();

-- ============ 7. Evidence storage policies ============
CREATE POLICY "Evidence owners upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'capital-readiness-evidence'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Evidence owners and admins read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'capital-readiness-evidence'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin(auth.uid()))
  );
CREATE POLICY "Evidence owners delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'capital-readiness-evidence'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );