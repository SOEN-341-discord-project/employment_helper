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
const postingFilter = document.getElementById("postingFilter");
const applicantFilters = document.getElementById("applicantFilters");
const applicantStatus = document.getElementById("applicantStatus");
const applicantDate = document.getElementById("applicantDate");

let editingJobId = null; // null means the form is creating a new posting.
let selectedJob = null; // The posting whose applicants are currently displayed.
let applicantRequest = 0;
const statuses = ["Applied", "Under Review", "Interview", "Offered", "Rejected"];

// Use the same statuses for filtering and for updating an application.
for (const status of statuses) {
  const option = makeText("option", status);
  option.value = status;
  applicantStatus.appendChild(option);
}

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
    for (const job of jobs) {
      const card = makeText("article", "", "panel");
      card.dataset.postingState = job.is_active ? "open" : "archived";
      card.appendChild(makeText("h2", job.title));
      card.appendChild(makeText("p", job.company + " · " + job.location, "muted small"));
      card.appendChild(makeText("span", job.is_active ? "Open" : "Archived", "status-badge"));
      card.appendChild(makeText("p", job.category + " · " + job.job_type, "small"));

      const controls = makeText("div", "", "button-row");
      controls.appendChild(makeButton("Edit", function () { editPosting(job); }));
      controls.appendChild(makeButton("View applicants", function () {
        loadApplicants(job);
        applicantsTitle.focus();
      }));
      const availability = makeButton(job.is_active ? "Archive posting" : "Restore posting", async function () {
        availability.disabled = true;
        try {
          // Reuse the existing active flag so archived postings keep their applications.
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
    filterPostings();
  } catch (error) {
    // The server denies access if this account is not in the recruiters table.
    recruiterContent.hidden = true;
    dashboardMessage.textContent = error.message;
  } finally {
    refreshDashboard.disabled = false;
  }
}

function filterPostings() {
  const filter = postingFilter.value;
  let visible = 0;
  for (const card of postingList.children) {
    card.hidden = filter !== "all" && card.dataset.postingState !== filter;
    if (!card.hidden) { visible++; }
  }
  dashboardMessage.textContent = visible
    ? "Showing " + visible + " of " + postingList.children.length + " postings."
    : "No " + (filter === "all" ? "" : filter + " ") + "postings to show.";
}

postingFilter.addEventListener("change", filterPostings);

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
  if (selectedJob?.id !== job.id) {
    applicantStatus.value = "";
    applicantDate.value = "";
  }
  selectedJob = job;
  const request = ++applicantRequest;
  applicantsTitle.textContent = "Applicants · " + job.title;
  applicantMessage.textContent = "Loading applicants...";
  applicantFilters.hidden = true;
  applicantList.replaceChildren();

  try {
    const applications = await apiRequest("/api/recruiter/jobs/" + job.id + "/applications");
    // An older response must not replace the list from a newer request.
    if (request !== applicantRequest) { return; }
    for (const application of applications) {
      applicantList.appendChild(makeApplicantCard(application));
    }
    applicantFilters.hidden = false;
    filterApplicants();
  } catch (error) {
    if (request === applicantRequest) { applicantMessage.textContent = error.message; }
  }
}

// Compare dates in the recruiter's local time, just like the date on each card.
function filterApplicants() {
  const status = applicantStatus.value;
  const date = applicantDate.value;
  const selectedDate = date ? new Date(date + "T00:00:00").toDateString() : "";
  let visible = 0;

  for (const card of applicantList.children) {
    const matchesStatus = !status || card.dataset.status === status;
    const matchesDate = !date || card.dataset.appliedDate === selectedDate;
    card.hidden = !matchesStatus || !matchesDate;
    if (!card.hidden) { visible++; }
  }

  const total = applicantList.children.length;
  if (total === 0) {
    applicantMessage.textContent = "No applications for this posting yet.";
  } else if (visible === 0) {
    applicantMessage.textContent = "No applications match these filters.";
  } else {
    applicantMessage.textContent = "Showing " + visible + " of " + total + " applications.";
  }
}

applicantStatus.addEventListener("change", filterApplicants);
applicantDate.addEventListener("change", filterApplicants);
document.getElementById("clearApplicantFilters").addEventListener("click", function () {
  applicantStatus.value = "";
  applicantDate.value = "";
  filterApplicants();
});

function makeApplicantCard(application) {
  const card = makeText("article", "", "panel applicant-card");
  card.dataset.status = application.status;
  card.dataset.appliedDate = new Date(application.created_at).toDateString();
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
      card.dataset.status = select.value;
      if (card.parentElement === applicantList) {
        filterApplicants();
        if (card.hidden) { applicantMessage.textContent += " " + data.message; }
      }
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
