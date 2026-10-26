
# User Stories

## AI-Generated User Stories

US-01 — Account Registration
As a job seeker, I want to create an account so that I can access personalized job search features.

US-02 — User Login
As a registered user, I want to log in securely so that I can access my account and its information.

US-03 — Profile Management
As a job seeker, I want to update my skills, education, and work experience so that recruiters can view my current qualifications.

US-04 — Resume Upload (DONE)

As a job seeker, I want to upload my resume so that I can use it when applying for jobs.

US-05 — Job Posting Creation
As a recruiter, I want to publish a job posting with its title, description, requirements, and location so that I can attract suitable applicants.

US-06 — Job Search and Filtering
As a job seeker, I want to search for jobs by keyword and filter results by location and job type so that I can find relevant opportunities.

US-07 — Job Application Submission
As a job seeker, I want to apply for a posted job using my uploaded resume so that the recruiter can consider me for the position.
    Task 7.01: Submit an application
    Task 7.02: 7.02 avoid duplicate applications

US-08 — Application Status Tracking
As a job seeker, I want to view whether each application is Applied, Interview, Offered, or Rejected so that I can track my progress.

US-09 — Saved Jobs
As a job seeker, I want to save interesting job postings so that I can easily return to them and apply later.

US-10 — Generative AI Resume Feedback
As a job seeker, I want to receive AI-generated feedback on my resume for a selected job posting so that I can improve how clearly it presents my relevant qualifications.
if everyone could give one user story would be good so trello is setup please

## Team Generated User Stories and Features

US-11 — Real Job Postings
As a job seeker, I want to see  postings collected from legitimate sources

US-12 — Personalized Jobs and Common Requirements
 As a job seeker, I'd like to see jobs that match my profile  and have requirements that are present all across the those jobs highlighted so that I know which skills to prioritize or potentially add to my resume.

US-13 Insight Info
As a job seeker, I want to have insight on each listing, I want to see how many person applied to each position and for how long this listing has been posted.

US-14 - Friendly UI
As a job seeker, I want the UI to be very easy to understand and to navigate through.
    TASK US-14.6: As a job seaker, I want a nice landingpage that is clear and easy to navigation through with no jardins.
        Task US-14.6.1: Log-in button that prompts to the login page
        Task US-14.6.2: Create an account button
        Task US-14.6.3: Nice and simple landing page with a guide on how to proceed

US-15
As a job seeker, I want to have control on what type of emails and notifications I recieve. I want to choose if I only want to get notified when I get an interview or also when a new position is out.



US-16 — Manage Job Postings

As a recruiter, I want to view, edit, close, and reopen my own job postings so that I can keep available opportunities up to date.

    Tasks:

    Task 16.01: Display the logged-in recruiter’s postings.

    Task 16.02: Allow the recruiter to edit their postings.

    Task 16.03: Allow the recruiter to close and reopen postings.

    Task 16.04: Prevent recruiters from managing another recruiter’s postings.

        Acceptance tests:

        Editing a posting updates its information in job search.

        Closing a posting removes it from search; reopening makes it available again.

US-17 — Review Received Applications

    As a recruiter, I want to view applications received for my postings and open submitted résumés so that I can review candidates.

    Tasks:

    Task 17.01: Display applications for a selected posting.

    Task 17.02: Display applicant names, emails, and application dates.

    Task 17.03: Allow viewing the résumé submitted with each application.

    Task 17.04: Restrict access to the recruiter who owns the posting.

        Acceptance tests:

        An application appears under the correct recruiter’s posting.

        The recruiter can open the résumé submitted with that application.

US-18 — Update Application Status

    As a recruiter, I want to update an application’s status so that applicants can follow their progress.

    Tasks:

    Task 18.01: Provide Applied, Under Review, Interview, Offered, and Rejected status choices.

    Task 18.02: Save status changes for applications to the recruiter’s own postings.

    Task 18.03: Display saved status changes on the applicant’s tracking page.

        Acceptance tests:

        A saved status change appears when the applicant refreshes their applications.

        An unauthorized user cannot change an application’s status.