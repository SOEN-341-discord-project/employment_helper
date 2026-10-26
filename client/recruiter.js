const postingForm = document.getElementById("postingForm");
const postingList = document.getElementById("postingList");
const postingMessage = document.getElementById("postingMessage");
const dashboardMessage = document.getElementById("dashboardMessage");
const recruiterContent = document.getElementById("recruiterContent");
const savePosting = document.getElementById("savePosting");
const cancelEdit = document.getElementById("cancelEdit");
const refreshDashboard = document.getElementById("refreshDashboard");
const applicantList = document.getElementById("applicantList");
const applicantMessage = document.getElementById("applicantMessage");
const applicantsTitle = document.getElementById("applicantsTitle");

let editingJobId = null; // null means the form is creating a new posting.
let selectedJob = null; // The posting whose applicants are currently displayed.
const statuses = ["Applied", "Under Review", "Interview", "Offered", "Rejected"];

// Create a normal button and connect its click to a function.
function makeButton(text, onClick) {
  const button = makeText("button", text);
  button.type = "button"; // These buttons must not submit the posting form.
  button.addEventListener("click", onClick);
  return button;
}

// Return the form to its original "create" mode.
function resetPostingForm() {
  postingForm.reset();
  editingJobId = null;
  document.getElementById("formTitle").textContent = "Create a posting";
  savePosting.textContent = "Publish posting";
  cancelEdit.hidden = true;
}

// Fill the existing form with a posting, ready for editing.
function editPosting(job) {
  editingJobId = job.id;
  for (const field of ["title", "company", "location", "category", "job_type", "description", "requirements"]) {
    postingForm.elements[field].value = job[field];
  }
  document.getElementById("formTitle").textContent = "Edit posting";
  savePosting.textContent = "Save changes";
  cancelEdit.hidden = false;
  postingMessage.textContent = "Editing: " + job.title;
  postingForm.elements.title.focus();
}

async function loadDashboard() {
  refreshDashboard.disabled = true;
  dashboardMessage.textContent = "Loading your postings...";
  try {
    const jobs = await apiRequest("/api/recruiter/jobs");
    recruiterContent.hidden = false;
    postingList.replaceChildren();
    dashboardMessage.textContent = jobs.length + " posting(s) in your account.";

    if (jobs.length === 0) {
      postingList.appendChild(makeText("p", "No postings yet. Create your first one using the form.", "panel muted"));
    }

    for (const job of jobs) {
      const card = makeText("article", "", "panel");
      card.appendChild(makeText("h2", job.title));
      card.appendChild(makeText("p", job.company + " · " + job.location, "muted small"));
      card.appendChild(makeText("span", job.is_active ? "Open" : "Closed", "status-badge"));
      card.appendChild(makeText("p", job.category + " · " + job.job_type, "small"));

      const controls = makeText("div", "", "button-row");
      controls.appendChild(makeButton("Edit", function () { editPosting(job); }));
      controls.appendChild(makeButton("View applicants", function () { loadApplicants(job); }));
      const availability = makeButton(job.is_active ? "Close posting" : "Reopen posting", async function () {
        availability.disabled = true;
        try {
          await apiRequest("/api/recruiter/jobs/" + job.id, "PATCH", { is_active: !job.is_active });
          await loadDashboard();
        } catch (error) {
          dashboardMessage.textContent = error.message;
        } finally {
          availability.disabled = false;
        }
      });
      controls.appendChild(availability);
      card.appendChild(controls);
      postingList.appendChild(card);
    }
  } catch (error) {
    // The server denies access if this account is not in the recruiters table.
    recruiterContent.hidden = true;
    dashboardMessage.textContent = error.message;
  } finally {
    refreshDashboard.disabled = false;
  }
}

postingForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // Save with JavaScript rather than reloading the page.
  if (savePosting.disabled) { return; }
  savePosting.disabled = true;
  cancelEdit.disabled = true;
  postingMessage.textContent = "Saving posting...";

  // FormData reads the named fields. fromEntries puts them in a plain object.
  const job = Object.fromEntries(new FormData(postingForm));
  const url = editingJobId ? "/api/recruiter/jobs/" + editingJobId : "/api/recruiter/jobs";
  const method = editingJobId ? "PATCH" : "POST";
  try {
    const savedJob = await apiRequest(url, method, job);
    resetPostingForm();
    postingMessage.textContent = "Posting saved successfully.";
    await loadDashboard();
    if (selectedJob && selectedJob.id === savedJob.id) {
      await loadApplicants(savedJob);
    }
  } catch (error) {
    postingMessage.textContent = error.message;
  } finally {
    savePosting.disabled = false;
    cancelEdit.disabled = false;
  }
});

cancelEdit.addEventListener("click", function () {
  resetPostingForm();
  postingMessage.textContent = "";
});

async function loadApplicants(job) {
  selectedJob = job;
  applicantsTitle.textContent = "Applicants · " + job.title;
  applicantMessage.textContent = "Loading applicants...";
  applicantList.replaceChildren();

  try {
    const applications = await apiRequest("/api/recruiter/jobs/" + job.id + "/applications");
    // Ignore a late response if the recruiter has already selected another job.
    if (selectedJob.id !== job.id) { return; }
    applicantList.replaceChildren();
    applicantMessage.textContent = applications.length ? applications.length + " application(s)." : "No applications for this posting yet.";
    for (const application of applications) {
      applicantList.appendChild(makeApplicantCard(application));
    }
  } catch (error) {
    if (selectedJob.id === job.id) { applicantMessage.textContent = error.message; }
  }
}

function makeApplicantCard(application) {
  const card = makeText("article", "", "panel applicant-card");
  card.appendChild(makeText("h2", application.applicant_name));
  card.appendChild(makeText("p", application.applicant_email, "muted small"));
  card.appendChild(makeText("p", "Applied on " + showDate(application.created_at), "muted small"));
  card.appendChild(makeText("p", "Submitted résumé: " + application.resume_name, "small"));
  const notice = makeText("p", "", "small");
  notice.setAttribute("role", "status");

  const viewResume = makeButton("View submitted résumé", async function () {
    // Open a tab during the click so the browser does not block it as a popup.
    const tab = window.open("about:blank", "_blank");
    if (!tab) { notice.textContent = "Allow a new tab to view this résumé."; return; }
    tab.opener = null;
    viewResume.disabled = true;
    try {
      const data = await apiRequest("/api/recruiter/applications/" + application.id + "/resume");
      tab.location.href = data.url;
      notice.textContent = "";
    } catch (error) {
      tab.close();
      notice.textContent = error.message;
    } finally {
      viewResume.disabled = false;
    }
  });
  card.appendChild(viewResume);

  const controls = makeText("div", "", "status-controls");
  const label = makeText("label", "Application status");
  const select = document.createElement("select");
  for (const status of statuses) {
    const option = makeText("option", status);
    option.value = status;
    select.appendChild(option);
  }
  select.value = application.status;
  label.appendChild(select);
  controls.appendChild(label);

  const saveStatus = makeButton("Save status", async function () {
    saveStatus.disabled = true;
    select.disabled = true;
    try {
      const data = await apiRequest("/api/recruiter/applications/" + application.id, "PATCH", { status: select.value });
      notice.textContent = data.message;
    } catch (error) {
      notice.textContent = error.message;
    } finally {
      saveStatus.disabled = false;
      select.disabled = false;
    }
  });
  controls.appendChild(saveStatus);
  card.appendChild(controls);
  card.appendChild(notice);
  return card;
}

refreshDashboard.addEventListener("click", async function () {
  await loadDashboard();
  if (!recruiterContent.hidden && selectedJob) { await loadApplicants(selectedJob); }
});
loadDashboard();
