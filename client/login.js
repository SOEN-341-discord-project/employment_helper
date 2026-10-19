const form = document.querySelector("#loginForm");
const message = document.querySelector("#message");

form.addEventListener("submit", async function (event) {


   event.preventDefault();

     const { email, password } = form.elements;
      const passw = password.value;

     const login = {email: email.value.trim(),password: passw
  };

  if (!login.email || !passw) {
    return message.textContent = "Email and Password are needed.";
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login)
    });

   const data = await response.json();

if (response.status === 401) {
  message.textContent = "Incorrect email or password.";
} else if (response.ok) {
  sessionStorage.setItem("accessToken", data.accessToken);
  window.location.href = "profile.html";
} else {
  message.textContent = data.error || "Error. Try again.";
}

 } catch (err) {
  
    message.textContent = "Cannot login because of server error.";
  }
});