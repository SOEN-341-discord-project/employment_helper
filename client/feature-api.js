// Shared helpers for the two new pages. They avoid repeating the same code.

// Send a request to our server with the token saved by the existing login page.
async function apiRequest(url, method = "GET", body = null) {
  const token = sessionStorage.getItem("accessToken");
  if (!token) { throw new Error("Please log in before using this page."); }

  const options = {
    method: method,
    headers: { Authorization: token }
  };
  if (body !== null) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body); // Turn a JavaScript object into JSON text.
  }

  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) { throw new Error(data.error || "The request failed. Please try again."); }
  return data;
}

// Build an element with plain text. textContent does not execute HTML from users.
function makeText(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}

// Both pages display dates in the visitor's normal local date format.
function showDate(value) {
  return new Date(value).toLocaleDateString();
}
