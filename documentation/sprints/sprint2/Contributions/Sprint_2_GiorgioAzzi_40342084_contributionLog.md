# Sprint 2 Contribution Log

Name: Giorgio Azzi  
Student ID: 40342084  
GitHub username: giorgioazzi13  
Branch: `test/backend-validation`

## Summary

During Sprint 2, I added automated unit tests for the backend validation functions. These tests help detect regressions by confirming that ID validation and job-posting validation continue working after changes are made to the project.

## Contributions

- Created `server/utils/validation.js` to store reusable validation functions.
- Moved `isValidId()` into the validation module.
- Moved `readJob()` into the validation module.
- Updated `server/middleware/account.js` to import `isValidId()`.
- Updated `server/routes/recruiter.js` to import `readJob()`.
- Created `tests/validation.test.js` with 10 automated unit tests.
- Added the `npm test` command to `package.json`.
- Updated `.github/workflows/ci.yml` so GitHub Actions runs the unit tests automatically on pushes and pull requests.

## Automated Tests Added

The tests verify that:

- Positive whole-number IDs are accepted.
- Invalid IDs are rejected.
- A complete and valid job posting is accepted.
- Extra spaces around job fields are removed.
- A job posting with a missing field is rejected.
- An empty required field is rejected.
- An unsupported job category is rejected.
- An unsupported job type is rejected.
- A regular field longer than 120 characters is rejected.
- A description longer than 10,000 characters is rejected.

## Testing Results

- All 10 unit tests passed locally.
- JavaScript syntax validation passed.
- The GitHub Project CI workflow passed successfully.
