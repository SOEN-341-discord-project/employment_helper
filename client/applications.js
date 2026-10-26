const applicationList = document.getElementById("applicationList");
const applicationMessage = document.getElementById("applicationMessage");
const refreshApplications = document.getElementById("refreshApplications");

async function loadApplications() {
  refreshApplications.disabled = true; // Prevent repeated requests while loading.
  applicationMessage.textContent = "Loading applications...";
  applicationList.replaceChildren(); // Remove the previous cards.

  try {
    const applications = await apiRequest("/api/applications");
    if (applications.length === 0) {
      applicationMessage.textContent = "No applications yet. Find a job and apply with your saved résumé.";
      return;
    }

    applicationMessage.textContent = applications.length + " application(s). Refresh to check for updates.";
    for (const application of applications) {
      // jobs is included by the server's foreign-key query.
      const job = application.jobs;
      const card = document.createElement("article");
      card.className = "panel application-card";

      const heading = document.createElement("div");
      heading.appendChild(makeText("h2", job.title));
      heading.appendChild(makeText("p", job.company + " · " + job.location, "muted"));
      card.appendChild(heading);

      // data-status lets CSS give each status a readable badge color.
      const badge = makeText("span", application.status, "status-badge");
      badge.dataset.status = application.status;
      card.appendChild(badge);
      card.appendChild(makeText("p", "Applied on " + showDate(application.created_at), "muted small"));
      if (!job.is_active) {
        card.appendChild(makeText("p", "This posting is closed. Your application is still saved.", "muted small"));
      }
      applicationList.appendChild(card);
    }
  } catch (error) {
    applicationMessage.textContent = error.message;
  } finally {
    refreshApplications.disabled = false;
  }
}

refreshApplications.addEventListener("click", loadApplications);
loadApplications(); // Show saved applications as soon as the page opens.
