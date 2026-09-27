const form = document.querySelector("#registerForm");
const message = document.querySelector("#message");

form.addEventListener("submit", async function (event) {


   event.preventDefault();

     const { fullName, email, password } = form.elements;
      const passw = password.value;

     const regist = {fullName: fullName.value.trim(),email: email.value.trim(),password: passw
  };

    if (!/\d/.test(passw)) {
  return message.textContent="Password must contain a number.";
}

  if (passw.length < 5 || passw.length > 15) {
    return message.textContent ="Password range is 5 to 15 characters.";
  }

  if (!/[!@#$%^&()]/.test(passw)) {
    return message.textContent = "Password must contain at least one of these: * ! @ # $ % ^ & ( ) ";
  }

  try {
    const response = await fetch("/api/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regist)
    });

    if (response.status===409) {
      message.textContent = "The Email you entered is already being used.";
    } else if (response.ok) {
      message.textContent = "Account successfully created!"; 
    } else {
      message.textContent = "Error. Try again.";
    }
 } catch (err) {
  
    message.textContent = "Server error. Cannot create account.";
  }
});


