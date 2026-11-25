# Sprint 4 AI Usage Log — Giorgio Azzi

Student ID: 40342084  
Feature: Sprint 4 Feature 5 — Notifications and Analytics  
Tool and model: GPT-6.2 Astra (Ultra)  

# Purpose of AI use

I used GPT-6.2 Astra (Ultra) to learn how to design and implement the unit, regression, and acceptance tests for my Sprint 4 work. The model helped me write all 32 automated checks I added. I also used it to learn how to create a disposable database so I could test notification behavior without affecting our team's real Supabase data.

# What I learned and implemented

- Unit testing. The model helped me isolate the closing-date validator and test it with Node's built-in test runner. I added three tests covering valid and invalid dates, replacing a date, and the difference between leaving a date out of an update and explicitly clearing it. One example was checking that February 29 is accepted in a leap year and rejected in a non-leap year.

- Regression testing. I learned to turn a bug into a repeatable test. Saving the same interview twice used to create duplicate notifications. With AI assistance, I wrote a check that saves the interview twice and verifies that the seeker still has one invitation and one reminder, with the same read status. I also added a dashboard test that changes the history filter, refreshes the data, and checks that the selected filter and overall application total remain correct.

- Acceptance and integration testing. I asked what the 16 deadline checks actually verified and whether they counted as acceptance tests. The model helped me translate our feature rules into 16 deadline checks and 12 interview checks. For example, a deadline reminder must be hidden at 8:59:59 a.m. Montreal time and available at 9:00 a.m. Another check verifies that rescheduling an interview removes the reminder for the old time. These tests also cover integration because they run the actual database functions and triggers and inspect the resulting notifications.

# How I used AI to create a disposable database

I used the model to understand how GitHub Actions can start a fresh PostgreSQL 17 database for each test run. With its help, I configured the workflow and wrote SQL scripts that create the required tables, insert sample seekers, recruiters, jobs, and applications, and install the same reminder logic used in Supabase.

The tests then perform actions such as applying for a job or rescheduling an interview and check exactly which notification records exist afterward. If a result is incorrect, the check fails and stops the CI job. The temporary database is discarded after the run, so the next run starts with predictable data.