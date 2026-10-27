Sprint 2 Contribution Log : Jamar Warner Johnson 40253688
User story 6



Job listing Page:
Created the jobs listing page and the surrounding files (jobs.html, css, js) that displays available job postings. Each posting shows its title, company, location, category and type. Added messages for total jobs, empty results and if a server error occurred.

Search:
Keyword, location, category
Keyword searches title, company, and description (so as to not skip a job if title is vague)
Location and category can be used alone or with other features.
Clear button to erase filters and re-display all postings.

Backend
	Get job in api that reads from the Supabase table. Uses previously mentioned filters and returns newer postings. 

Style: Styled in black and white to match website theme. Time spent on layout spacing and dropdown as well.

Tested searches individually and combined. Tested empty search and empty result. Tested clear button. Open and close the dropdown. 

I also wrote a python script that connects to canada jobs to scrape the website with a default parameter to simulate and pretend as if it were an actual user to then scrape jobs for a usable output. 

Time spent:
Style: ~5 hours:
Search, filter, Backend: [12 hours]
Testing : 3 hours
Python script: 2 hours
Total time: 22 hours
