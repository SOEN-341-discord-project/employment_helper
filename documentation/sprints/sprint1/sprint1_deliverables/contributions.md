Member: Arman
Issue : US-01.1, US-02.01



I established the websites login and registration pages via a visual inspiration #Beacons loginpage: https://account.beacons.ai/signin

There was a successful attempt to recreate the CSS visual environment 
( CSS login page tutorials on youtube)


The page checks for valid password entries when creating accounts via JS and displays messages for invalid entries. Addiitonally, these entries are sent over to the server side and certain messages (e.g error) can also be displayed depending on the server response.


Local host verificaations were done, but backend checks are still needed after backend implementation is done.


Member: Amer Abou Ahmad : US-04.01


I implemented the backend resume upload functionality using express and Formidable, including file validation and to make sure the user does not upload a file that is larger than 5MB in size. I integrated Supabase storage so resumes are stored permanently in the "resumes" bracket of the Supabase database. I also added and connected the /api/resumes/upload route to the main Express server and tested that it works fine and that the files are actually being stored in the Supabase by posting through Postman sample files. I also created the cover page and contributed to the readme file.
I also fixed merge issues that could cause integration problems between the front and back end.



Member: Jamar Warner Johnson

I set up the project structure in Node.js backend by initializing the project with npm (node package manager) and configuring the infancy of the project. This included the initial dependencies/packages like express and formidable. I created the main server.js file which initializes the express app. I organized the project initially into different folders to better allow for clarity when developing new functions.



Member: Liam Casasola 
Issue: US-01.2, US-02.2

For the first sprint I mainly handled the back end portion of the login and user registration page. I created our team's Supabase project and built the register and login routes. The server checks input, catches duplicate emails, gives a generic message on failed logins, and returns an access token. I kept our keys out of GitHub with a .env file, matched the password rules with our front end, and fixed the page links by including an HTML extension. Then I merged my work to the master repository after discussing my code with my teammates.



Member: Georges Mourad

For Sprint 1, I mainly worked on the project organization and documentation. I organized the 15 user stories as GitHub Issues and added the task breakdowns, labels, types, priorities, and effort levels. I also worked on the Sprint 1 planning, including the backlog, priorities, effort estimation, team capacity, and risks. I contributed to the meeting minutes, AI usage documentation, and the Team Process Definition. I also helped organize the GitHub project board and Sprint 1 deliverables.
