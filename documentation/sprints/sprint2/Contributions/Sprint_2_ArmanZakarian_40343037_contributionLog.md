Sprint 2 Contribution Log :  Arman Zakarian



My main contribution was Feature 1: User Profile and Resume Management.



CSS Design and Profile Page



[Estimated Time Spent: 15 Hours]



I redesigned the entirety of the CSS.( For instance I remade the login page / the register page 

.



I then Subsequently implemented the same CSS design in the profile page that includes : personal information, skills, location, and job .



Résumé Integration and Validation



[Estimated Time Spent: 9 Hours]



Integrated résumé selection into the profile page, replacing the separate résumé upload page.



Added browser / backend side field validation, résumé file-type and size checks as well as success/error messages.



Added the paperclip button and selected file name next to it. Error messages appear below the résumé section if the file isnt accepted.



Removed the old separate résumé page and client side resume.js since it was now integrated inside the profile section.



Supabase Profile Table and Backend



[Estimated Time Spent: 12 Hours]



Created the Supabase profile table and backend routes for loading and saving each user’s information.



Connected the frontend to the backend using the login token to identify the user’s account.



Adapted Amer’s résumé upload code into my profile.js ( server side ); keeping the existing résumé when only profile information changes.



Everytime someone is logged it’s connected to the user ID : so the information being loaded and updated belongs to their account.



I also added  backend checks for required fields, email format, job preferences and résumé files before saving.



Saving, Loading and Cancelling Changes



[Estimated Time Spent: 8 Hours]



Cancel button to restore previous server states as well as server side updates initalized on the UI.When refreshing after updating the profile to restore saved values and profile loading after refreshing the page.



Made it so the user can modify their information without having to select the same résumé again.



Saved résumé name stays displayed after saving and refreshing even though the actual file input is cleared.



Disabled the Save and Cancel buttons while sending the request to prevent subsequent requests during saving.



Testing and Troubleshooting



[Estimated Time Spent: 5 Hours]



Tested saving, reloading, cancelling edits, and updating information without replacing the résumé.



Worked through server connection issues, profile routes not loading, login token verification and Supabase API key configuration.



Check if the information of the profile that’s saved is sent back from the server when new refresh instead of being empty 



Navbar and Login



[Estimated Time Spent: 4 Hours]



Added the shared navbar and the missing login.js.



Navbar includes Home, Profile and Log out links with hover effects and active page highlighting.



Connected login.js to the existing backend to store the login token and redirect to the profile page after logging in.



Documentation



[Estimated Time Spent: 2 Hours]



Documented my Sprint 2 contributions and added the commit links showing the profile interface, backend connection and merge into master.



Time and Supporting Evidence







CSS, profile page, résumé integration, navbar and login.js :  Implementation commit⁠ https://github.com/SOEN-341-discord-project/employment_helper/commit/cb0577fa378e354cd4c0e8984cdae8515924064c



Backend connection, profile saving, loading and Cancel :  Implementation commit⁠ https://github.com/SOEN-341-discord-project/employment_helper/commit/3e7ec2cd14e12f624a3cb79667e024ea9a4b044a



Supabase profile table :  Configured directly in Supabase.



Amer merging my branch into master  Merge pull request #31 https://github.com/SOEN-341-discord-project/employment_helper/commit/683df951752c24c5460380d3daf2457eeef532d2



Documentation :  Sprint 2 contributions⁠.https://github.com/SOEN-341-discord-project/employment_helper/commit/30c5c3ebab5ebbc5c9a0a73f3666f0fc1d3aa778



Total estimated time: [55 Hours].
