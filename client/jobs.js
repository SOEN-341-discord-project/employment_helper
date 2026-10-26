// stuff from the page that we need
const searchForm = document.getElementById("searchForm");
const clearButton = document.getElementById("clearButton");
const message = document.getElementById("message");
const jobList = document.getElementById("jobList");


// asks the server for jobs, filters are optional
async function loadJobs() {

  // the form boxes (.value is whatever the user typed)
  const keyword = searchForm.elements.keyword.value.trim();
  const location = searchForm.elements.location.value.trim();
  const category = searchForm.elements.category.value;

  // building the url, if a box is empty we just dont add it
  const params = new URLSearchParams();
  if (keyword) { params.append("keyword", keyword); }
  if (location) { params.append("location", location); }
  if (category) { params.append("category", category); }

  message.textContent = "Loading jobs...";

  try {
    const response = await fetch("/api/jobs?" + params.toString());
    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.error || "Error. Try again.";
      return;
    }

    showJobs(data);

  } catch (err) {
    // fetch fails if the server is off
    message.textContent = "Cannot load jobs because of server error.";
  }
}


// puts every job on the page
function showJobs(jobs) {

  // empty the list first so old results dont stay
  jobList.innerHTML = "";

  if (jobs.length === 0) {
    message.textContent = "No jobs match your search. Try different words.";
    return;
  }

  if (jobs.length === 1) {
    message.textContent = "1 job found";
  } else {
    message.textContent = jobs.length + " jobs found";
  }

  for (let i = 0; i < jobs.length; i++) {
    jobList.appendChild(makeJobCard(jobs[i]));
  }
}


// makes one job card, details/summary is the dropdown (click once to open)
function makeJobCard(job) {

  const card = document.createElement("details");
  card.className = "job";

  // the part that is always showing
  const summary = document.createElement("summary");

  const title = document.createElement("h2");
  title.className = "job-title";
  title.textContent = job.title;

  const company = document.createElement("p");
  company.className = "job-company";
  company.textContent = job.company + ", " + job.location;

  const tags = document.createElement("div");
  tags.className = "job-tags";
  tags.appendChild(makeTag(job.category));
  tags.appendChild(makeTag(job.job_type));

  summary.appendChild(title);
  summary.appendChild(company);
  summary.appendChild(tags);

  // the part that shows after the click
  const details = document.createElement("div");
  details.className = "job-details";

  const descTitle = document.createElement("h3");
  descTitle.textContent = "Description";

  const description = document.createElement("p");
  description.textContent = job.description;

  const reqTitle = document.createElement("h3");
  reqTitle.textContent = "Requirements";

  // requirements are saved as one line each in the database
  // so we split them up to make a list
  const reqList = document.createElement("ul");
  const reqLines = job.requirements.split("\n");

  for (let i = 0; i < reqLines.length; i++) {
    const line = reqLines[i].trim();
    if (line !== "") {
      const item = document.createElement("li");
      item.textContent = line;
      reqList.appendChild(item);
    }
  }

  const posted = document.createElement("p");
  posted.className = "job-posted";
  posted.textContent = "Posted " + new Date(job.posted_at).toLocaleDateString();

  details.appendChild(descTitle);
  details.appendChild(description);
  details.appendChild(reqTitle);
  details.appendChild(reqList);
  details.appendChild(posted);

  card.appendChild(summary);
  card.appendChild(details);

  return card;
}


// small gray label like "Software"
function makeTag(text) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = text;
  return tag;
}


// search button (or pressing enter)
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();   // stops the page from reloading
  loadJobs();
});

// clear button, empties the boxes and shows everything again
clearButton.addEventListener("click", function () {
  searchForm.reset();
  loadJobs();
});

// show all the jobs when the page first opens
loadJobs();
