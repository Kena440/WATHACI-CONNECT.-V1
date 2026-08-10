CREATE TABLE public.business_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_categories TO anon, authenticated;
GRANT ALL ON public.business_categories TO service_role;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business categories are viewable by everyone"
  ON public.business_categories FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.business_categories (name, sort_order) VALUES
  ('Access to Finance', 1),
  ('Marketing & Sales', 2),
  ('Legal & Compliance', 3),
  ('Bookkeeping & Tax', 4),
  ('HR & Recruitment', 5),
  ('Digital & IT', 6),
  ('Business Strategy', 7),
  ('Operations & Supply Chain', 8),
  ('Business Development', 9),
  ('Other', 99);

CREATE TABLE public.sme_needs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sme_profile_id uuid NOT NULL REFERENCES public.sme_profiles(profile_id) ON DELETE CASCADE,
  category text NOT NULL REFERENCES public.business_categories(name) ON UPDATE CASCADE,
  description text,
  budget_range_min numeric,
  budget_range_max numeric,
  urgency text NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low','medium','high')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sme_needs_profile ON public.sme_needs (sme_profile_id);
CREATE INDEX idx_sme_needs_category ON public.sme_needs (category);
GRANT SELECT ON public.sme_needs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sme_needs TO authenticated;
GRANT ALL ON public.sme_needs TO service_role;
ALTER TABLE public.sme_needs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SME needs are viewable by everyone"
  ON public.sme_needs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "SMEs can insert their own needs"
  ON public.sme_needs FOR INSERT TO authenticated WITH CHECK (auth.uid() = sme_profile_id);
CREATE POLICY "SMEs can update their own needs"
  ON public.sme_needs FOR UPDATE TO authenticated USING (auth.uid() = sme_profile_id) WITH CHECK (auth.uid() = sme_profile_id);
CREATE POLICY "SMEs can delete their own needs"
  ON public.sme_needs FOR DELETE TO authenticated USING (auth.uid() = sme_profile_id);
CREATE TRIGGER update_sme_needs_updated_at BEFORE UPDATE ON public.sme_needs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.freelancer_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_profile_id uuid NOT NULL REFERENCES public.freelancer_profiles(profile_id) ON DELETE CASCADE,
  category text NOT NULL REFERENCES public.business_categories(name) ON UPDATE CASCADE,
  title text NOT NULL,
  deliverable text,
  price numeric,
  currency text NOT NULL DEFAULT 'ZMW',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_freelancer_services_profile ON public.freelancer_services (freelancer_profile_id);
CREATE INDEX idx_freelancer_services_category ON public.freelancer_services (category);
GRANT SELECT ON public.freelancer_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.freelancer_services TO authenticated;
GRANT ALL ON public.freelancer_services TO service_role;
ALTER TABLE public.freelancer_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Freelancer services are viewable by everyone"
  ON public.freelancer_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Freelancers can insert their own services"
  ON public.freelancer_services FOR INSERT TO authenticated WITH CHECK (auth.uid() = freelancer_profile_id);
CREATE POLICY "Freelancers can update their own services"
  ON public.freelancer_services FOR UPDATE TO authenticated USING (auth.uid() = freelancer_profile_id) WITH CHECK (auth.uid() = freelancer_profile_id);
CREATE POLICY "Freelancers can delete their own services"
  ON public.freelancer_services FOR DELETE TO authenticated USING (auth.uid() = freelancer_profile_id);
CREATE TRIGGER update_freelancer_services_updated_at BEFORE UPDATE ON public.freelancer_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing SME top_needs into structured rows
INSERT INTO public.sme_needs (sme_profile_id, category, description)
SELECT s.profile_id,
  CASE need
    WHEN 'Access to Finance' THEN 'Access to Finance'
    WHEN 'Business Registration & Compliance' THEN 'Legal & Compliance'
    WHEN 'Legal & Regulatory Guidance' THEN 'Legal & Compliance'
    WHEN 'Quality Certification' THEN 'Legal & Compliance'
    WHEN 'Market Access' THEN 'Marketing & Sales'
    WHEN 'Marketing & Branding' THEN 'Marketing & Sales'
    WHEN 'Skilled Workforce' THEN 'HR & Recruitment'
    WHEN 'Technology & Digital Tools' THEN 'Digital & IT'
    WHEN 'Export Support' THEN 'Business Development'
    WHEN 'Government Contracts' THEN 'Business Development'
    WHEN 'Mentorship & Advisory' THEN 'Business Strategy'
    WHEN 'Equipment & Machinery' THEN 'Operations & Supply Chain'
    WHEN 'Workspace & Facilities' THEN 'Operations & Supply Chain'
    WHEN 'Supply Chain Partners' THEN 'Operations & Supply Chain'
    WHEN 'Accounting & Bookkeeping' THEN 'Bookkeeping & Tax'
    ELSE 'Other'
  END,
  need
FROM public.sme_profiles s
CROSS JOIN LATERAL unnest(s.top_needs) AS need
WHERE s.top_needs IS NOT NULL AND array_length(s.top_needs, 1) > 0;

-- Migrate existing freelancer services_offered text into a single generic listing
INSERT INTO public.freelancer_services (freelancer_profile_id, category, title, deliverable)
SELECT f.profile_id, 'Other', COALESCE(NULLIF(f.professional_title, ''), 'Services'), f.services_offered
FROM public.freelancer_profiles f
WHERE COALESCE(TRIM(f.services_offered), '') <> '';