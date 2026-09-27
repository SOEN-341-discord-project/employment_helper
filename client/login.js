const form = document.querySelector("#loginForm");
const message = document.querySelector("#message");

form.addEventListener("submit", async function(event) {
  event.preventDefault();
  const email= form.elements.email.value;
  const password= form.elements.password.value;
  const log= { email: email.trim(), password: password};

  const response = await fetch("/api/login", {
    method: "POST",
    headers:{ "Content-Type": "application/json"  },
    body: JSON.stringify(log)
  });
  if (response.ok) { window.location.href = "/resume";
  } else {
    message.textContent = "Password or Email is invalid";
  }
});
