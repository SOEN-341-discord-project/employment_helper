const form = document.querySelector("#profileForm");
const resumeFile = document.querySelector("#resumeFile");
const fileName = document.querySelector("#resumeName");
const message = document.querySelector("#message");
const profileMessage = document.querySelector("#profileMessage");
const saveButton = document.querySelector("#save");
const cancelButton = document.querySelector("#cancel");



const allowedExtensions = ["pdf", "doc", "docx"];
const maximumFileSize = 5 * 1024 * 1024;
let savedProfile = new FormData(form);
let savedResumeName = fileName.textContent;
let hasSavedResume = false;
let profileLoaded = false;

function resumeVerification(file) {
  if (!file) {
    return ""; 
  }
  const extension = file.name.split(".").pop().toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return "Only PDF and Word documents are accepted.";
  }
  if (file.size > maximumFileSize) {
    return "The file must be 5 MB or smaller.";
  }
  return "";}


resumeFile.addEventListener("change", function () {
  /*first selected file e.g in browser*/
  const file = resumeFile.files[0];

  if (file) {
    /* the resume name content ( file name is its variable name )*
    ( Part next to the paperclip icon )*/
    fileName.textContent = "Selected file: " + file.name;
  } else {
    fileName.textContent = savedResumeName;
  }
/* the message content ( error message ) only will be displayed 
if resumeVerfication returns something */
  message.textContent = resumeVerification(file);
  profileMessage.textContent = "";
});


// form field part 
form.addEventListener("submit", async function (event) {
  //disable submitting/refreshing the page 
  event.preventDefault();

  if (!profileLoaded || saveButton.disabled) {
    return;
  }


  // name the resumeFile variable as the first index file
  const file = resumeFile.files[0];
  // when sending submission whatever message was there is cleared 
   profileMessage.textContent = "";


   // if theres no selected or saved file the submission wont work and the message is going to be displayed 
  if (!file && !hasSavedResume) {
  profileMessage.textContent = "Please select a résumé before saving.";
  return;
}


// if there is a message ( error message ) the submission wont work

if (message.textContent !== "") {
  return;
}
// now unto the submission part we create a new object that holds 
// all the form data 
const formData = new FormData(form);

if (!file) {
  formData.delete("resume");
}

// while the data is being sent we wanna prevent unecessary requests 

saveButton.disabled = true;
cancelButton.disabled = true;




try {
  const response = await fetch( "/api/profile", {
    method: "POST",
    headers: {
      Authorization: sessionStorage.getItem("accessToken")
    },
    body: formData
  });

  const data = await response.json();

  if (response.ok) {
    // Remember the successfully submitted values.
    savedProfile = formData;
   savedResumeName = "Saved résumé: " + data.profile.resume_name;
   hasSavedResume = true;


     // name is there but not the actual file so we dont waste 
    resumeFile.value = "";
    fileName.textContent = savedResumeName;
    profileMessage.textContent = "Profile saved successfully!";
  } else {
    profileMessage.textContent =
      data.error || data.message || "Unable to save the profile.";
  }
} catch (error) {
  profileMessage.textContent = "Save failed. Please try again.";
} finally {
  // Enable the buttons after success or failure.
  saveButton.disabled = false;
  cancelButton.disabled = false;
  saveButton.textContent = "Save changes";
}
});
cancelButton.addEventListener("click", function () {
  for (const field of form.elements) {
    if (field.name && field.type !== "file") {
      field.value = savedProfile.get(field.name);
    }
  }

  resumeFile.value = "";
  fileName.textContent = savedResumeName;
  message.textContent = "";
  profileMessage.textContent = "";
});


async function loadProfile() {
  saveButton.disabled = true;
  cancelButton.disabled = true;

  const token = sessionStorage.getItem("accessToken");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("/api/profile", {
      headers: {
        Authorization: token
      }
    });

    const data = await response.json();

    if (!response.ok) {
      profileMessage.textContent = data.error || "Cant load profile.";
      return;
    }

    const profile = data.profile;

    if (profile) {
      form.elements.fullName.value = profile.name;
      form.elements.email.value = profile.email;
      form.elements.skills.value = profile.skills;
      form.elements.location.value = profile.location;
      form.elements.workPreference.value = profile.preference_work;
      form.elements.workHours.value = profile.hours_work;
      form.elements.contractType.value = profile.contract;

      hasSavedResume = Boolean(profile.resume_path);

      if (hasSavedResume) {
        savedResumeName = "Saved résumé: " + profile.resume_name;
      }

      fileName.textContent = savedResumeName;
    }

    savedProfile = new FormData(form);
    profileLoaded = true;
    saveButton.disabled = false;
    cancelButton.disabled = false;

  } catch (error) {
    profileMessage.textContent = "Cant load profile.";
  }
}

loadProfile();