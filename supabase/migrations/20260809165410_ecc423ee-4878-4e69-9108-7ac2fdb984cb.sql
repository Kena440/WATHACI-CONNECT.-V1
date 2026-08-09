DROP VIEW public.v_directory_profiles;
CREATE VIEW public.v_directory_profiles AS SELECT * FROM public.v_public_profiles;
GRANT SELECT ON public.v_directory_profiles TO anon, authenticated;

CREATE OR REPLACE VIEW public.v_public_profiles_safe AS
 SELECT id,
    COALESCE(
      NULLIF(TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(last_name), ''))), ''),
      NULLIF(TRIM(full_name), ''),
      NULLIF(TRIM(display_name), '')
    ) AS display_name,
    account_type,
    city,
    country,
    bio,
    avatar_url,
    business_name,
    industry_sector,
    specialization,
    skills,
    services_offered,
    rating,
    reviews_count,
    total_jobs_completed,
    website_url,
    linkedin_url,
    portfolio_url,
    availability_status,
    is_profile_complete,
    created_at
   FROM public.profiles
  WHERE is_profile_complete = true;
GRANT SELECT ON public.v_public_profiles_safe TO anon, authenticated;