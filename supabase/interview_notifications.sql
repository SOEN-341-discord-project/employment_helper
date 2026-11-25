-- Install once in Supabase before deploying the recruiter route that calls this function.
BEGIN;

-- A recruiter save and all of its inbox changes commit together. The application row lock
-- serializes simultaneous saves, including two requests for the same interview time.
CREATE OR REPLACE FUNCTION public.set_recruiter_application_status(
  p_application_id bigint, p_recruiter_id uuid, p_status text, p_interview_at timestamptz
) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  application record;
  requested_status public.applications.status%TYPE := p_status;
  changed boolean;
  interview_details text;
  notice record;
  saved_notice public.notifications%ROWTYPE;
BEGIN
  SELECT a.status, a.interview_at, a.applicant_id, a.job_id, j.title
    INTO application
    FROM public.applications a JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = p_application_id AND j.recruiter_id = p_recruiter_id
    FOR UPDATE OF a FOR SHARE OF j;
  IF NOT FOUND THEN RETURN false; END IF;

  -- Keep the same validation for callers of the database function and the web form.
  IF p_status IS NULL OR p_status NOT IN ('Applied', 'Under Review', 'Interview', 'Offered', 'Rejected')
     OR (p_status = 'Interview' AND (p_interview_at IS NULL OR p_interview_at <= statement_timestamp()))
     OR (p_status <> 'Interview' AND p_interview_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Invalid application status or interview time' USING ERRCODE = '22023';
  END IF;

  changed := application.status IS DISTINCT FROM requested_status
             OR application.interview_at IS DISTINCT FROM p_interview_at;
  IF changed THEN
    UPDATE public.applications SET status = requested_status, interview_at = p_interview_at
      WHERE id = p_application_id;

    -- Rescheduling or leaving Interview withdraws both old notices, even if already visible.
    DELETE FROM public.notifications WHERE application_id = p_application_id
      AND type IN ('interview_invitation', 'interview_reminder');
  END IF;

  -- Preserve the applicant's status history and announce each actual transition once.
  IF application.status IS DISTINCT FROM requested_status THEN
    INSERT INTO public.notifications (recipient_id, job_id, application_id, type, message)
    VALUES (application.applicant_id, application.job_id, p_application_id, 'application_status',
            format('Your application for %s is now %s.', application.title, p_status));
  END IF;
  IF p_status <> 'Interview' THEN RETURN true; END IF;

  -- Invitations are immediate. Reminders start 24 hours before the interview, or immediately
  -- for short-notice interviews. Label the time zone explicitly for seekers outside Montreal.
  interview_details := format('for %s is scheduled for %s (Montreal time).',
      application.title, to_char(p_interview_at AT TIME ZONE 'America/Toronto', 'Mon DD, YYYY HH24:MI'));
  FOR notice IN
    SELECT * FROM (VALUES
      ('interview_invitation', 'Your interview ' || interview_details),
      ('interview_reminder', 'Reminder: your interview ' || interview_details)
    ) AS content(type, message)
  LOOP
    -- Older versions could write several copies. Keep the newest schedule and prefer a read
    -- copy of that same message, so saving the interview again preserves its read state.
    SELECT * INTO saved_notice FROM public.notifications
      WHERE application_id = p_application_id AND type = notice.type
        AND recipient_id = application.applicant_id
      ORDER BY id DESC LIMIT 1 FOR UPDATE;
    IF FOUND THEN
      -- A repeat save also repairs legacy duplicates without reissuing the surviving notice.
      UPDATE public.notifications SET message = notice.message,
        is_read = is_read OR EXISTS (SELECT FROM public.notifications copy
          WHERE copy.application_id = p_application_id AND copy.type = notice.type
            AND copy.recipient_id = application.applicant_id AND copy.message = saved_notice.message AND copy.is_read),
        available_at = CASE WHEN notice.type = 'interview_reminder'
          THEN greatest(saved_notice.created_at, p_interview_at - interval '24 hours')
          ELSE saved_notice.available_at END
        WHERE id = saved_notice.id;
      DELETE FROM public.notifications WHERE application_id = p_application_id AND type = notice.type
        AND recipient_id = application.applicant_id AND id <> saved_notice.id;
    ELSE
      INSERT INTO public.notifications (recipient_id, job_id, application_id, type, message, created_at, available_at)
      VALUES (application.applicant_id, application.job_id, p_application_id, notice.type, notice.message, statement_timestamp(),
        CASE WHEN notice.type = 'interview_reminder'
          THEN greatest(statement_timestamp(), p_interview_at - interval '24 hours')
          ELSE statement_timestamp() END);
    END IF;
  END LOOP;
  RETURN true;
END;
$$;

-- Only the server may pass a verified recruiter's ID. Browser API roles cannot invoke this RPC.
REVOKE ALL ON FUNCTION public.set_recruiter_application_status(bigint, uuid, text, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_recruiter_application_status(bigint, uuid, text, timestamptz)
  TO service_role;

-- Repair existing upcoming interviews at installation and retract legacy queued reminders
-- for interviews that no longer exist. Leave delivered history for completed interviews alone.
DELETE FROM public.notifications n USING public.applications a
  WHERE n.application_id = a.id AND n.type = 'interview_reminder' AND n.available_at > statement_timestamp()
    AND (a.status IS DISTINCT FROM 'Interview' OR a.interview_at IS NULL OR a.interview_at <= statement_timestamp());
WITH upcoming AS MATERIALIZED (
  SELECT a.id, j.recruiter_id, a.interview_at FROM public.applications a JOIN public.jobs j ON j.id = a.job_id
  WHERE a.status = 'Interview' AND a.interview_at > statement_timestamp() AND j.recruiter_id IS NOT NULL
  ORDER BY a.id FOR UPDATE OF a FOR SHARE OF j
)
SELECT public.set_recruiter_application_status(id, recruiter_id, 'Interview', interview_at) FROM upcoming;
COMMIT;
