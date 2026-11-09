# Sprint 3 Contribution Log — Amer Abou Ahmad

## Feature 1 — Recruiter Dashboard and Posting Management

- Updated the recruiter dashboard so recruiters can archive and restore their own job postings.
- Added filters for all, open, and archived postings. Archived postings are hidden from job search, but recruiters can still review the applications they received.
- Added applicant filters by status and application date. Recruiters can use either filter on its own or both together.
- Added a matching application count and a **Clear filters** button. The list also updates when a recruiter changes an applicant’s status.

## User Stories and Acceptance Tests

- Updated **US-16 — Manage Job Postings** with archiving, restoring, and posting filters.
- Updated **US-17 — Review Received Applications** with applicant filters, matching counts, and filter reset.
- Prepared acceptance tests for archiving and restoring a posting, opening submitted résumés, filtering applications, and checking that recruiters can only access applications for their own postings.

## Automated Tests and CI

- Added five automated tests covering archiving and restoring, filtering by status, filtering by date, combining both filters, and clearing the filters.
- Updated `package.json` and the existing GitHub Actions workflow to run the tests through `npm test`.
- Verified locally that all five tests passed and that all 17 client and server JavaScript files passed syntax checks.

## Time and Supporting Evidence

- Recruiter dashboard and user story updates — 7 hours. [Implementation commit](https://github.com/SOEN-341-discord-project/employment_helper/commit/de265dfabb55395b4ba20d1d68612b9b6d08b93b)
- Acceptance test preparation — 2 hours.
- Automated tests and CI — 2 hours. 

**Total time** — [11 hours]

**NOTE** I did not add all the commits, I just put the major one.