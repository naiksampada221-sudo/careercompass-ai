CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'resumes_analyzed', (SELECT count(*) FROM activity_history WHERE activity_type = 'resume_analysis'),
    'ats_scans', (SELECT count(*) FROM activity_history WHERE activity_type = 'ats_scan'),
    'interview_sessions', (SELECT count(*) FROM activity_history WHERE activity_type = 'interview_practice'),
    'total_activities', (SELECT count(*) FROM activity_history),
    'total_users', (SELECT count(DISTINCT user_id) FROM activity_history)
  );
$$;