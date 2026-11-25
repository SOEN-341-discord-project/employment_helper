# Sprint 4 Contribution Log — Giorgio Azzi

Student ID: 40342084   
Feature 5: Notifications and Analytics  
Branch: sprint4/feature5_notifications_analytics  


# My responsibility

In Sprint 3, I implemented the notification backend for new applications, application status changes, interview invitations, and interview reminders. In Sprint 4, I built application deadline reminders on top of that system, corrected how interview notifications behave when recruiters edit an application, and improved access to the existing job seeker analytics dashboard. I also added automated tests for these changes and integrated the database tests into GitHub Actions.

# 1. Job posting closing dates

Application deadline reminders required a reliable closing date for each posting. I coordinated with the team and took responsibility for adding that field across the database, recruiter form, backend, and job seeker view.

- I added the optional closing_date column to the Supabase jobs table. I used PostgreSQL date because a posting closes on a calendar day. The reminder delivery time is stored separately. Existing postings can keep an empty closing date.
- I added a date picker to the recruiter posting form. A recruiter can set a deadline when creating a posting, see the saved date when editing it, replace it, or clear it.
- I moved the existing readJob() validation into server/jobPosting.js so creating and editing a posting use the same rules. I added server-side checks for the YYYY-MM-DD format and for dates that actually exist on the calendar.
- I handled two different edit requests. If a client leaves closing_date out of the request, the existing date is preserved. If the recruiter explicitly clears the field, the deadline is removed.
- I updated the job details shown to seekers. A dated posting displays “Apply by” followed by the saved date. An undated posting displays “No deadline listed.”

# 2. Application deadline reminders

- I extended the allowed notification types in Supabase to include application_deadline. I reused the existing notification table, bell, read status, and available_at field.
- I implemented the reminder for 9:00 a.m. Montreal time on the calendar day before the posting closes. 
- Since we do not track interest in a posting, I used this eligibility rule: an active posting with a closing date can generate a reminder for each job seeker who has not already applied. Recruiters are excluded. 
- I added database triggers that update reminders when postings, accounts, recruiter roles, or applications change. This covers both a new posting created for existing seekers and a new seeker joining after a posting already exists.
- I added a database uniqueness rule so each seeker can have only one deadline reminder per posting. Editing a job title updates the message and preserves its read state. Changing the closing date updates the delivery time and makes the revised reminder unread.
- I made the reminder disappear when the seeker applies, the posting is archived, the recruiter clears the date, or the account becomes a recruiter. Expired postings do not generate new reminders.
- I installed the scheduling logic in Supabase and kept the installation script in the repository so teammates can review it and the tests can install the same logic in a clean database.

# 3. Interview invitations, reminders, and status updates

- I updated the recruiter status route to call the Supabase function set_recruiter_application_status. It checks that the recruiter owns the posting and saves the application change and its notifications in one transaction. If a notification write fails, the previous application status and reminders are preserved.
- Scheduling an interview sends an immediate invitation and schedules a reminder 24 hours before the interview. For an interview booked less than 24 hours ahead, the reminder becomes available immediately.
- Saving the same interview again preserves one invitation, one reminder, and their read state. Rescheduling replaces the old alerts. Moving the application out of Interview clears the interview time and removes the notification.
- I made application status notifications correspond to actual status changes. For example, saving Rejected twice creates one rejection notification.
- I installed the function in Supabase. Its installation also repairs duplicate alerts for upcoming interviews and withdraws queued reminders for interviews that are no longer scheduled.

# 4. Job seeker analytics dashboard

The dashboard already calculated application totals, status breakdowns, and weekly activity. My changes made it easier to find, filter, and read.

- I added a Dashboard link to the shared navigation bar so seekers can open the page directly from the app.
- I connected the application-history filter to all five statuses: Applied, Under Review, Interview, Offered, and Rejected. Selecting a status filters the history immediately. The totals, status breakdown, and weekly chart continue to describe the seeker's full application history.


# Closing-date validation — 3 unit tests

In tests/job-closing-date.test.js, I used Node's built-in test runner and strict assertions to call the real readJob function with sample posting data.

1. **Create and replace a valid date.** I verified that February 29 is accepted in a leap year and that editing the posting replaces it with the new date.
2. **Omit or clear a date.** I verified that omitting the field leaves it out of the update, while an empty string or `null` explicitly clears it.
3. **Reject invalid input.** I tested impossible dates such as April 31, February 29 in a non-leap year, invalid months, timestamps, incorrectly formatted strings, and non-string values.

# Dashboard history filter — 1 component regression test

In tests/recruiter-dashboard.test.js, I added one test that runs the real client/dashboard.js in Node with a simulated browser document and sample API responses. The test selects statuses, triggers the same change and refresh handlers as the page, and checks the rendered results.

It verifies that all five options appear, selecting Interview displays only interview applications, and the overall total stays unchanged. It also checks the empty result for Offered, refreshes after an application's status changes, verifies that the selection is preserved without duplicating options, and clears the filter to restore the full history.

# Application deadlines — 16 database integration and acceptance checks

In tests/application-deadline-reminders.sql, I created sample accounts, recruiters, jobs, applications, and notifications in a disposable database. The test installs the actual scheduling script, changes the sample records, and checks what the triggers write to the notification table.

The checks cover:

- Eligibility for existing and newly registered seekers, including seekers without a career profile. Recruiters and people who already applied are excluded.
- Active postings with dates, along with archived, expired, and undated postings. A new seeker can still see a due reminder for a posting closing that day.
- Winter and summer time conversion. One check verifies the exact visibility boundary: the reminder is hidden at 8:59:59 a.m. Montreal time and available at 9:00 a.m.
- Duplicate prevention, title edits, read-state preservation, and rescheduling when a closing date changes.
- Removal after an application, archive, cleared deadline, or promotion to recruiter. The checks also verify that another seeker's reminder and an unrelated status notification are preserved.

# Interview notifications — 12 database integration and regression checks

In tests/interview-notifications.sql, I created sample applications with duplicate and outdated interview alerts, installed the actual database function, and called the same operation used by the recruiter route.

The checks cover:

- Repairing existing duplicate alerts while preserving read status, and withdrawing a queued reminder for a previously cancelled interview.
- Restricting the database operation to the backend role and rejecting an update from a recruiter who does not own the posting.
- Scheduling the first interview and verifying the immediate invitation, application status notification, and 24-hour reminder.
- Saving the same interview again using an equivalent time-zone offset. The test compares the notification records before and after to verify that their IDs, times, and read states are preserved.
- Rescheduling first to a short-notice interview and then to a later date. The tests verify that the old reminder disappears and the replacement becomes available at the correct time.
- Handling a failed write. I used a temporary database constraint to deliberately reject a notification and verified that the application and its previous reminders were restored together.
- Cancelling an interview and repeating the save. The checks verify that the interview time is cleared, the old alerts are removed, only one rejection notification exists, and another applicant's records are unaffected.

# 6. Continuous integration and verification

- I updated .github/workflows/ci.yml to start a disposable PostgreSQL 17 database on pushes and pull requests. The workflow runs both SQL test files and fails if a database assertion raises an error.
- The full local run passed 12 JavaScript tests and 28 database checks, for 40 passing checks. My Sprint 4 changes added 32 of those checks. The other eight JavaScript tests already existed.