const form = document.querySelector("#resumeForm");
const resumeFile = document.querySelector("#resumeFile");
const fileName = document.querySelector("#fileName");
const message = document.querySelector("#message");
const uploadButton = form.querySelector('button[type="submit"]');

const allowedExtensions = ["pdf", "doc", "docx"];
const maximumFileSize = 5 * 1024 * 1024; // 5 MB

resumeFile.addEventListener("change", function () {
  const selectedFile = resumeFile.files[0];

  if (selectedFile) {
    fileName.textContent = "Selected file: " + selectedFile.name;
  } else {
    fileName.textContent = "No file selected";
  }

  message.textContent = "";
});

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const selectedFile = resumeFile.files[0];

  if (!selectedFile) {
    message.textContent = "Please select a resume.";
    message.style.color = "red";
    return;
  }

  const extension = selectedFile.name
    .split(".")
    .pop()
    .toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    message.textContent = "Only PDF and Word documents are accepted.";
    message.style.color = "red";
    return;
  }

  if (selectedFile.size > maximumFileSize) {
    message.textContent = "The file must be smaller than 5 MB.";
    message.style.color = "red";
    return;
  }

  const formData = new FormData();
  formData.append("resume", selectedFile);

  uploadButton.disabled = true;
  uploadButton.textContent = "Uploading...";
  message.textContent = "";

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      message.textContent = "Resume uploaded successfully!";
      message.style.color = "green";

      form.reset();
      fileName.textContent = "No file selected";
    } else {
      message.textContent = data.error || "Unable to upload the resume.";
      message.style.color = "red";
    }
  } catch (error) {
    message.textContent = "Cannot connect to the server.";
    message.style.color = "red";
  } finally {
    uploadButton.disabled = false;
    uploadButton.textContent = "Upload resume";
  }
});