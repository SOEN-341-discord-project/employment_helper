# Sprint 2 Contribution Log — Amer Abou Ahmad



## Landing Page — US-14.6.1, US-14.6.2, US-14.6.3



- Created a simple landing page introducing CareerConnect and explaining how users can get started.

- Added links to the login and registration pages.

- Completed the tasks for login access, account creation access, and introductory guidance.



## Supabase Job Postings Table



- Created the SQL table used to store job postings in Supabase.

- Defined fields for the job title, company, location, category, job type, description, requirements, and posting date.

- Added sample postings to support development and testing.

- Helped troubleshoot Supabase connection and API key configuration issues.



## Résumé Viewing and Downloading



- Extended the existing profile functionality with View résumé and Download résumé links.

- Added an authenticated server route that retrieves the logged-in user's saved résumé.

- Used temporary Supabase Storage links to provide access to the uploaded document.

- Updated the links after loading a profile or replacing a résumé.



## Feature 3 — Job Application Submission and Tracking



- Implemented application submission using the applicant's saved profile and résumé.

- Added an Apply button to job postings and a confirmation message after successful submission.

- Created the applications table and connected applications to users and job postings.

- Prevented duplicate applications to the same posting.

- Created a My applications page displaying submitted applications and their statuses.

- Supported Applied, Under Review, Interview, Offered, and Rejected statuses.

- Added server checks restricting users to their own application records.



## Feature 4 — Recruiter Dashboard and Posting Management



- Took over completion of Feature 4 after Liam, who had started the feature, became unavailable.

- Implemented a recruiter dashboard for creating, editing, closing, and reopening postings.

- Connected postings to their owners and restricted recruiters to managing their own postings.

- Displayed applications received for a selected posting.

- Added access to submitted résumés and controls for updating application statuses.

- Connected recruiter status changes to the applicant tracking page.

- Added Job seeker and Recruiter choices during registration.

- Added database support for automatically assigning recruiter access to new recruiter accounts.



## Continuous Integration



- Added a GitHub Actions workflow triggered by pushes and pull requests.

- Configured dependency installation using npm ci.

- Added automated syntax checks for client and server JavaScript files.

- The pipeline checks dependency installation and JavaScript syntax; it does not run functional tests.



## Integration and Documentation



- Integrated Features 3 and 4 with the existing login, profiles, résumés, and job listings.

- Added navigation links to the application tracking page and recruiter dashboard.

- Prepared database setup and installation instructions.

- Prepared acceptance test descriptions for successful application submission and duplicate prevention.

- Updated user stories and task descriptions.

- Prepared meeting minutes covering planning, progress review, and the Feature 4 handover.

- Contributed a substantial portion of the Sprint 2 documentation.



## Time and Supporting Evidence

> [!NOTE]
> I DID NOT ADD ALL OF MY COMMITS, THERE ARE SO MANY, I JUST ADDED THE MAIN AND THE FINAL CHANGES COMMITS.

- Landing page: [Time Spent: 13 Hours] — [Landing page](https://github.com/SOEN-341-discord-project/employment_helper/commit/9f1eac481f39cda19632c9e6dfb2cfd83148c2df).

- Job postings database: [Time Spent: 2 Hours] — Configured directly in Supabase.

- Résumé viewing and downloading: [Time Spent: 3 Hours] — [Implementation commit](https://github.com/SOEN-341-discord-project/employment_helper/commit/474468b4f7b2592aa83ebc1ab3f8ae487d9724f1).

- Feature 3: [Time spent: 14 Hours] — [Applications and tracking implementation](https://github.com/SOEN-341-discord-project/employment_helper/commit/820350f619a544df0a15e31ad7f8fe1cf6a777bf).

- Feature 4 and recruiter registration: [Time spent : 13 hours] — [Recruiter dashboard and account selection implementation](https://github.com/SOEN-341-discord-project/employment_helper/commit/820350f619a544df0a15e31ad7f8fe1cf6a777bf).

- CI pipeline: [Time Spent: 1 Hour] — [Workflow implementation](https://github.com/SOEN-341-discord-project/employment_helper/commit/3471b9e4139db23bb537bd9462c319de474d428f).

- Documentation: [Time Spent: 1 Hour] — [User stories and contribution log updates](https://github.com/SOEN-341-discord-project/employment_helper/commit/100a1df51f94432c86d07950b51672f119189517); [Sprint 2 documentation setup](https://github.com/SOEN-341-discord-project/employment_helper/commit/0d9e3244aa1f03c0a0596d5450c91e2a30d86476).


**Total time:** [41 Hours] -- Note: I didn't include everything, just the main and the final commits. For example, while building feature 3, if I did 10 commits during working on it, I just added the final one.

## AI Usage

AI assistance is documented in my Sprint 2 AI Usage Log.

**AI Usage Log:** [Sprint 2 AI Usage Log](https://github.com/SOEN-341-discord-project/employment_helper/blob/3471b9e4139db23bb537bd9462c319de474d428f/documentation/sprints/sprint2/AI_LOGS/editing_folder/Sprint_2_AmerAbouAhmad_40307355_AI_Log.md)