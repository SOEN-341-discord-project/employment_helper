Member: Arman
Issue : US-01.1, US-02.01



I established the websites login and registration pages via a visual inspiration #Beacons loginpage: https://account.beacons.ai/signin

There was a successful attempt to recreate the CSS visual environment 
( CSS login page tutorials on youtube)


The page checks for valid password entries when creating accounts via JS and displays messages for invalid entries. Addiitonally, these entries are sent over to the server side and certain messages (e.g error) can also be displayed depending on the server response.


Local host verificaations were done, but backend checks are still needed after backend implementation is done.


Member: Amer Abou Ahmad


I implemented the backend resume upload functionality using express and Formidable, including file validation and to make sure the user does not upload a file that is larger than 5MB in size. I integrated Supabase storage so resumes are stored permanently in the "resumes" bracket of the Supabase database. I also added and connected the /api/resumes/upload route to the main Express server and tested that it works fine and that the files are actually being stored in the Supabase by posting through Postman sample files. I also created the cover page and contributed to the readme file. 

