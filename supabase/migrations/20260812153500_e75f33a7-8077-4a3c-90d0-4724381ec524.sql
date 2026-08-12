CREATE TABLE public.capital_readiness_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_version text NOT NULL DEFAULT 'CR-2026-01',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted')),
  overall_score numeric(7,4),
  readiness_band text CHECK (readiness_band IN ('early_stage','developing','nearly_ready','capital_ready')),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX capital_readiness_one_draft_per_user
  ON public.capital_readiness_assessments (user_id, questionnaire_version)
  WHERE status = 'draft';
CREATE INDEX capital_readiness_assessments_user_idx
  ON public.capital_readiness_assessments (user_id, created_at DESC);

CREATE TABLE public.capital_readiness_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.capital_readiness_assessments(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  category_key text NOT NULL,
  answer_value text NOT NULL,
  points integer NOT NULL CHECK (points IN (0,1,2,4)),
  is_unknown boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, question_key)
);
CREATE INDEX capital_readiness_responses_assessment_idx
  ON public.capital_readiness_responses (assessment_id);

CREATE TABLE public.capital_readiness_category_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.capital_readiness_assessments(id) ON DELETE CASCADE,
  category_key text NOT NULL,
  earned_points integer NOT NULL,
  max_points integer NOT NULL,
  category_percentage numeric(7,4) NOT NULL,
  category_weight numeric(5,4) NOT NULL,
  weighted_score numeric(7,4) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, category_key)
);
CREATE INDEX capital_readiness_category_scores_assessment_idx
  ON public.capital_readiness_category_scores (assessment_id);

CREATE TABLE public.capital_readiness_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.capital_readiness_assessments(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  category_key text NOT NULL,
  gap text NOT NULL,
  action text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('high','medium')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, question_key)
);
CREATE INDEX capital_readiness_actions_assessment_idx
  ON public.capital_readiness_actions (assessment_id);

GRANT SELECT, INSERT, UPDATE ON public.capital_readiness_assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capital_readiness_responses TO authenticated;
GRANT SELECT, INSERT ON public.capital_readiness_category_scores TO authenticated;
GRANT SELECT, INSERT ON public.capital_readiness_actions TO authenticated;
GRANT ALL ON public.capital_readiness_assessments TO service_role;
GRANT ALL ON public.capital_readiness_responses TO service_role;
GRANT ALL ON public.capital_readiness_category_scores TO service_role;
GRANT ALL ON public.capital_readiness_actions TO service_role;

ALTER TABLE public.capital_readiness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_readiness_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_readiness_category_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_readiness_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own assessments"
  ON public.capital_readiness_assessments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Owners create own assessments"
  ON public.capital_readiness_assessments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'draft');
CREATE POLICY "Owners update own draft assessments"
  ON public.capital_readiness_assessments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'draft')
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners read own responses"
  ON public.capital_readiness_responses FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.capital_readiness_assessments a
                 WHERE a.id = assessment_id AND (a.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "Owners write own draft responses"
  ON public.capital_readiness_responses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.capital_readiness_assessments a
                      WHERE a.id = assessment_id AND a.user_id = auth.uid() AND a.status = 'draft'));
CREATE POLICY "Owners update own draft responses"
  ON public.capital_readiness_responses FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.capital_readiness_assessments a
                 WHERE a.id = assessment_id AND a.user_id = auth.uid() AND a.status = 'draft'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.capital_readiness_assessments a
                      WHERE a.id = assessment_id AND a.user_id = auth.uid() AND a.status = 'draft'));
CREATE POLICY "Owners delete own draft responses"
  ON public.capital_readiness_responses FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.capital_readiness_assessments a
                 WHERE a.id = assessment_id AND a.user_id = auth.uid() AND a.status = 'draft'));

CREATE POLICY "Owners read own category scores"
  ON public.capital_readiness_category_scores FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.capital_readiness_assessments a
                 WHERE a.id = assessment_id AND (a.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "Owners insert own category scores"
  ON public.capital_readiness_category_scores FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.capital_readiness_assessments a
                      WHERE a.id = assessment_id AND a.user_id = auth.uid()));

CREATE POLICY "Owners read own actions"
  ON public.capital_readiness_actions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.capital_readiness_assessments a
                 WHERE a.id = assessment_id AND (a.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "Owners insert own actions"
  ON public.capital_readiness_actions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.capital_readiness_assessments a
                      WHERE a.id = assessment_id AND a.user_id = auth.uid()));

CREATE TRIGGER capital_readiness_assessments_updated_at
  BEFORE UPDATE ON public.capital_readiness_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER capital_readiness_responses_updated_at
  BEFORE UPDATE ON public.capital_readiness_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();