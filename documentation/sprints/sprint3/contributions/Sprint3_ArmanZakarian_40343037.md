Sprint 3 Contribution Log ; Arman Zakarian
Feature 3 — Notifications and Reminders
- I made notifications.html for the notifications page and used the profile.css we already had. I added the bell to the navbar so when the user clicks it, it takes them to that page. I used notifications.png for the bell and kept the same styling as the other icons when selected.
- I wrote notifications.js so when the page opens it gets the notifications from the server. Each one shows the message and the date and time the alert appeared. I also added Mark as read for unread notifications. Once the server saves that change, the button is removed and the notification stays on the page.
- In recruiter. js I added the date and time field that shows up when the recruiter selects Interview. If there was already an interview time saved, that time is put back in the field in local time.
- I changed the Save function so it checks that the recruiter picked a future time before sending the request. I added the time to the same object as the status so both are sent to the server. While it is saving, the button and fields are disabled and then enabled again when the request finishes.
User Stories and Acceptance Tests
 For US-14.2, I added the notification bell so users can open the notifications page from the navbar.
- For Task 18.02, I added the interview date and time to the save function that was already there.
- I tested the applicant side after changing the status to Interview. I opened the bell and saw the status update, the alert date and the Mark as read button. The date I saw there was when the notification was posted. The scheduled interview time was a separate thing to check.
Automated Tests and CI
- I ran npm.cmd test after making the frontend changes and all 5 existing tests passed. These were the tests for archiving and restoring postings and for filtering applications by status and date.
- I checked GitHub Actions after PR #58 was merged into master and the checks passed.
  https://github.com/SOEN-341-discord-project/employment_helper/actions/runs/43854448198
Time and Supporting Evidence
- First version of the notifications page, JavaScript and navbar bell
  https://github.com/SOEN-341-discord-project/employment_helper/commit/5887e5ddd66a580261fa8e2b8e0b1496cc288746
- Added Mark as read, the date and time on alerts, and the changes for saving an interview in recruiter.js
  https://github.com/SOEN-341-discord-project/employment_helper/commit/ffb415daaea385aaa627f2bd047a10afbfa36653
- Wrote the Sprint 3 meeting minutes and documented the AI use for the bell and the JavaScript save process.
  https://github.com/SOEN-341-discord-project/employment_helper/commit/e3fb194b33d05fe2a4d411ef06f600b1d343888d
 
- Merged the final frontend changes into master through PR #58.
  https://github.com/SOEN-341-discord-project/employment_helper/commit/6722eab886771c0045a5b14eeecc5546e270514a
Total estimated time — [13 Hours]

NOTE I only included the main commits for my work.
