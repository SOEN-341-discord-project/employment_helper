// This file has one job: show the current year in the footer.
// index.html loads it with defer, so the footer exists before this code runs.

// Find the HTML element with id="year" and store it in a variable.
const yearElement = document.getElementById("year");

// Create a Date object, then get its year as a number, such as 2026.
const currentYear = new Date().getFullYear();

// Replace the element's text with the current year.
yearElement.textContent = currentYear;
