-- Install in the CareerConnect Supabase project after jobs.closing_date and the
-- application_deadline notification type are available. The bell already uses available_at.
BEGIN;

-- Keep the scheduling code outside the schema exposed through the Supabase API.
CREATE SCHEMA IF NOT EXISTS careerconnect_private;

-- Only deadline notices are unique per seeker and posting. Other notification types can repeat.
CREATE UNIQUE INDEX IF NOT EXISTS notifications_one_application_deadline
  ON public.notifications (recipient_id, job_id)
  WHERE type = 'application_deadline';

-- Build the audience from accounts, including seekers who have not made a profile yet.
-- Convert 9 a.m. on the previous calendar day using Montreal's daylight-saving rules.
CREATE OR REPLACE VIEW careerconnect_private.eligible_job_deadlines AS
SELECT seeker.id AS recipient_id, job.id AS job_id, job.title, job.closing_date,
       ((job.closing_date - 1) + TIME '09:00') AT TIME ZONE 'America/Toronto' AS available_at
FROM public.jobs AS job
CROSS JOIN auth.users AS seeker
WHERE job.is_active AND job.closing_date IS NOT NULL
  AND COALESCE(seeker.raw_user_meta_data ->> 'account_type', 'job_seeker') = 'job_seeker'
  AND NOT EXISTS (SELECT 1 FROM public.recruiters AS r WHERE r.user_id = seeker.id)
  AND NOT EXISTS (
    SELECT 1 FROM public.applications AS a
    WHERE a.applicant_id = seeker.id AND a.job_id = job.id
  );

-- Reconcile only the affected posting, seeker, or pair. Both NULLs request the initial backfill.
CREATE OR REPLACE FUNCTION careerconnect_private.sync_job_deadlines(
  target_job bigint, target_seeker uuid
) RETURNS void
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
  today_in_montreal date := (statement_timestamp() AT TIME ZONE 'America/Toronto')::date;
BEGIN
  -- Changes to jobs, roles and applications can overlap. Serialize the reconciliation
  -- so each writer sees the previous committed result before updating the same reminders.
  PERFORM pg_advisory_xact_lock(hashtext('careerconnect.job_deadlines'), 0);

  -- Remove reminders after an application, role change, archive, or cleared/expired
  -- replacement date. Keep already-delivered history for an unchanged past deadline.
  DELETE FROM public.notifications AS notice
  WHERE notice.type = 'application_deadline'
    AND (target_job IS NULL OR notice.job_id = target_job)
    AND (target_seeker IS NULL OR notice.recipient_id = target_seeker)
    AND NOT EXISTS (
      SELECT 1 FROM careerconnect_private.eligible_job_deadlines AS eligible
      WHERE eligible.job_id = notice.job_id AND eligible.recipient_id = notice.recipient_id
        AND (eligible.closing_date >= today_in_montreal OR eligible.available_at = notice.available_at)
    );

  -- Schedule ahead, including for offline seekers. A date change makes the new reminder
  -- unread; a title edit or repeated save preserves its read state and notification ID.
  INSERT INTO public.notifications AS notice
    (recipient_id, type, message, job_id, available_at)
  SELECT recipient_id, 'application_deadline',
         format('Applications for %s close on %s.', title, to_char(closing_date, 'YYYY-MM-DD')),
         job_id, available_at
  FROM careerconnect_private.eligible_job_deadlines
  WHERE closing_date >= today_in_montreal
    AND (target_job IS NULL OR job_id = target_job)
    AND (target_seeker IS NULL OR recipient_id = target_seeker)
  ON CONFLICT (recipient_id, job_id) WHERE type = 'application_deadline'
  DO UPDATE SET message = EXCLUDED.message, available_at = EXCLUDED.available_at,
                is_read = CASE WHEN notice.available_at = EXCLUDED.available_at
                               THEN notice.is_read ELSE false END
  WHERE (notice.message, notice.available_at) IS DISTINCT FROM (EXCLUDED.message, EXCLUDED.available_at);
END;
$$;

-- Database events cover postings and seekers created in either order. Privileged access
-- to auth.users is limited to this trigger and all table references use explicit schemas.
CREATE OR REPLACE FUNCTION careerconnect_private.on_job_deadline_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_TABLE_NAME = 'jobs' THEN
    -- Undated new postings have no schedule to create.
    IF TG_OP = 'INSERT' AND NEW.closing_date IS NULL THEN
      RETURN NULL;
    END IF;
    PERFORM careerconnect_private.sync_job_deadlines(NEW.id, NULL);
  ELSIF TG_TABLE_NAME = 'users' THEN
    -- Updates to unrelated signup metadata do not change a seeker's eligibility.
    IF TG_OP = 'UPDATE' AND (OLD.raw_user_meta_data ->> 'account_type')
        IS NOT DISTINCT FROM (NEW.raw_user_meta_data ->> 'account_type') THEN
      RETURN NULL;
    END IF;
    PERFORM careerconnect_private.sync_job_deadlines(NULL, NEW.id);
  ELSIF TG_TABLE_NAME = 'applications' THEN
    -- On reassignment, reconcile both the original pair and the new pair.
    IF TG_OP <> 'INSERT' THEN
      PERFORM careerconnect_private.sync_job_deadlines(OLD.job_id, OLD.applicant_id);
    END IF;
    IF TG_OP <> 'DELETE' THEN
      PERFORM careerconnect_private.sync_job_deadlines(NEW.job_id, NEW.applicant_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'recruiters' THEN
    -- The recruiter registry also determines eligibility for older accounts.
    IF TG_OP <> 'INSERT' THEN
      PERFORM careerconnect_private.sync_job_deadlines(NULL, OLD.user_id);
    END IF;
    IF TG_OP <> 'DELETE' THEN
      PERFORM careerconnect_private.sync_job_deadlines(NULL, NEW.user_id);
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- Only database triggers and the installer call these helpers.
REVOKE ALL ON FUNCTION careerconnect_private.on_job_deadline_change() FROM PUBLIC;
REVOKE ALL ON FUNCTION careerconnect_private.sync_job_deadlines(bigint, uuid) FROM PUBLIC;

-- Posting edits reschedule or cancel notices. The existing job foreign key handles deletes.
CREATE OR REPLACE TRIGGER sync_posting_deadline
AFTER INSERT OR UPDATE OF closing_date, title, is_active ON public.jobs
FOR EACH ROW EXECUTE FUNCTION careerconnect_private.on_job_deadline_change();

-- Include new seekers and account role changes. Normal logins do not update these fields.
CREATE OR REPLACE TRIGGER sync_seeker_deadlines
AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
FOR EACH ROW EXECUTE FUNCTION careerconnect_private.on_job_deadline_change();

-- Someone who already applied should no longer receive the corresponding deadline alert.
CREATE OR REPLACE TRIGGER sync_applicant_deadline
AFTER INSERT OR DELETE OR UPDATE OF applicant_id, job_id ON public.applications
FOR EACH ROW EXECUTE FUNCTION careerconnect_private.on_job_deadline_change();

-- Recruiter access may also be granted or removed independently of signup metadata.
CREATE OR REPLACE TRIGGER sync_recruiter_deadlines
AFTER INSERT OR DELETE OR UPDATE OF user_id ON public.recruiters
FOR EACH ROW EXECUTE FUNCTION careerconnect_private.on_job_deadline_change();

-- Cover eligible jobs and accounts that already exist at installation.
SELECT careerconnect_private.sync_job_deadlines(NULL, NULL);
COMMIT;
