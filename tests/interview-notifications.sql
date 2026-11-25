-- Run after application-deadline-reminders.sql in the same disposable PostgreSQL database.
-- Add the recruiter fields and API roles from Supabase to the existing test schema.
ALTER TABLE public.applications ADD COLUMN status text NOT NULL DEFAULT 'Applied',
  ADD COLUMN interview_at timestamptz;
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role;

-- Seed a legacy interview with duplicate alerts, another pending interview that was cancelled,
-- and an unrelated status notification that must survive every save.
INSERT INTO public.jobs (id, title, recruiter_id) VALUES
  (50, 'Developer', '00000000-0000-4000-8000-000000000002');
INSERT INTO public.applications (id, applicant_id, job_id, status, interview_at) VALUES
  (50, '00000000-0000-4000-8000-000000000001', 50, 'Interview', TIMESTAMPTZ '2099-07-15 15:30Z'),
  (51, '00000000-0000-4000-8000-000000000005', 50, 'Applied', NULL);
INSERT INTO public.notifications (recipient_id, job_id, application_id, type, message, is_read, available_at)
SELECT a.applicant_id, 50, a.id, v.type, v.message, v.was_read, TIMESTAMPTZ '2099-07-01 10:00Z'
FROM (VALUES (50, 'interview_invitation', 'legacy invitation', false),
             (50, 'interview_reminder', 'legacy reminder', true),
             (50, 'interview_reminder', 'legacy reminder', false),
             (51, 'interview_reminder', 'cancelled interview', false),
             (50, 'application_status', 'existing history', true)) v(app_id, type, message, was_read)
JOIN public.applications a ON a.id = v.app_id;

\ir ../supabase/interview_notifications.sql

-- Call the same database operation as the recruiter route with a verified test recruiter's ID.
CREATE FUNCTION pg_temp.save_status(app_id bigint, new_status text, at_time timestamptz DEFAULT NULL)
RETURNS boolean LANGUAGE sql AS $$
  SELECT public.set_recruiter_application_status(app_id, '00000000-0000-4000-8000-000000000002', new_status, at_time);
$$;
CREATE TEMP VIEW interview_alerts AS SELECT * FROM public.notifications
  WHERE application_id IN (50, 51) AND type IN ('interview_invitation', 'interview_reminder');

SELECT pg_temp.expect('installation repairs one legacy interview pair and preserves its read reminder',
  (SELECT count(*) = 2 FROM interview_alerts WHERE application_id = 50) AND
  (SELECT is_read AND available_at = TIMESTAMPTZ '2099-07-14 15:30Z'
     AND message LIKE '%11:30 (Montreal time)%' FROM interview_alerts WHERE application_id = 50 AND type = 'interview_reminder'));
SELECT pg_temp.expect('an outstanding reminder for a previously cancelled interview is withdrawn',
  NOT EXISTS (SELECT FROM interview_alerts WHERE application_id = 51));
SELECT pg_temp.expect('only the backend role can execute the recruiter operation',
  has_function_privilege('service_role','public.set_recruiter_application_status(bigint,uuid,text,timestamptz)','EXECUTE')
  AND NOT has_function_privilege('anon','public.set_recruiter_application_status(bigint,uuid,text,timestamptz)','EXECUTE')
  AND NOT has_function_privilege('authenticated','public.set_recruiter_application_status(bigint,uuid,text,timestamptz)','EXECUTE'));

-- A different recruiter cannot change the status or the inbox. A first schedule creates one pair.
SELECT pg_temp.expect('another owner cannot update the application',
  NOT public.set_recruiter_application_status(51, '00000000-0000-4000-8000-000000000003', 'Rejected', NULL));
SELECT pg_temp.expect('the successful initial interview save persists',
  pg_temp.save_status(51, 'Interview', TIMESTAMPTZ '2099-01-08 17:00Z'));
SELECT pg_temp.expect('first save sends an immediate invitation, one status alert and one 24-hour reminder',
  (SELECT count(*) = 2 AND bool_and(NOT is_read) FROM interview_alerts WHERE application_id = 51) AND
  (SELECT available_at <= statement_timestamp() FROM interview_alerts WHERE application_id = 51 AND type = 'interview_invitation') AND
  (SELECT available_at = TIMESTAMPTZ '2099-01-07 17:00Z' FROM interview_alerts WHERE application_id = 51 AND type = 'interview_reminder') AND
  (SELECT count(*) = 1 FROM public.notifications WHERE application_id = 51 AND type = 'application_status'));

-- Repeating a save with an equivalent offset must preserve row identity, timing and read state.
UPDATE public.notifications SET is_read = true WHERE application_id = 51 AND type = 'interview_invitation';
CREATE TEMP TABLE initial_notices AS SELECT * FROM public.notifications WHERE application_id = 51;
SELECT pg_temp.save_status(51, 'Interview', TIMESTAMPTZ '2099-01-08 12:00-05');
SELECT pg_temp.expect('repeat save preserves every notification field and creates no duplicates',
  NOT EXISTS ((SELECT * FROM initial_notices EXCEPT SELECT * FROM public.notifications WHERE application_id = 51)
    UNION ALL (SELECT * FROM public.notifications WHERE application_id = 51 EXCEPT SELECT * FROM initial_notices)));

-- A reschedule replaces the old time, including a reminder that is already due.
SELECT pg_temp.save_status(51, 'Interview', statement_timestamp() + interval '2 hours');
SELECT pg_temp.expect('short-notice reschedule shows a single unread pair immediately',
  (SELECT count(*) = 2 AND bool_and(NOT is_read AND available_at <= statement_timestamp())
     FROM interview_alerts WHERE application_id = 51) AND
  NOT EXISTS (SELECT FROM interview_alerts n JOIN initial_notices i USING (id)) AND
  (SELECT count(*) = 1 FROM public.notifications WHERE application_id = 51 AND type = 'application_status'));
SELECT pg_temp.save_status(51, 'Interview', TIMESTAMPTZ '2099-03-24 14:00Z');
SELECT pg_temp.expect('rescheduling a due reminder moves it out of the bell until the new time',
  (SELECT available_at = TIMESTAMPTZ '2099-03-23 14:00Z' FROM interview_alerts
   WHERE application_id = 51 AND type = 'interview_reminder'));

-- A failed notification write must roll back both the application and its prior reminders.
ALTER TABLE public.notifications ADD CONSTRAINT fixture_reject_offer
  CHECK (message <> 'Your application for Developer is now Offered.');
DO $$ BEGIN
  PERFORM pg_temp.save_status(51, 'Offered');
  RAISE EXCEPTION 'expected the test constraint to reject the write';
EXCEPTION WHEN check_violation THEN NULL;
END $$;
SELECT pg_temp.expect('failed save keeps the old interview and both notices',
  (SELECT status = 'Interview' AND interview_at = TIMESTAMPTZ '2099-03-24 14:00Z' FROM public.applications WHERE id = 51) AND
  (SELECT count(*) = 2 FROM interview_alerts WHERE application_id = 51));
ALTER TABLE public.notifications DROP CONSTRAINT fixture_reject_offer;

-- Cancellation clears the interview, keeps status history, and does not affect another seeker.
SELECT pg_temp.save_status(51, 'Rejected');
SELECT pg_temp.save_status(51, 'Rejected');
SELECT pg_temp.expect('cancellation and retry leave no interview alerts and exactly one rejection',
  NOT EXISTS (SELECT FROM interview_alerts WHERE application_id = 51) AND
  (SELECT status = 'Rejected' AND interview_at IS NULL FROM public.applications WHERE id = 51) AND
  (SELECT count(*) = 1 FROM public.notifications WHERE application_id = 51 AND message LIKE '%is now Rejected.'));
SELECT pg_temp.expect('another application retains its alerts and existing read status history',
  (SELECT count(*) = 2 FROM interview_alerts WHERE application_id = 50) AND
  (SELECT is_read FROM public.notifications WHERE application_id = 50 AND message = 'existing history'));
