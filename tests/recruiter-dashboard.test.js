// Run this file with npm test. Each test sets up sample data, performs an
// action, and uses assertions to check what the dashboard shows afterward.

// These tools come with Node.js.
// test runs each case. assert fails a test when the result differs from what we expect.
const test = require("node:test");
const assert = require("node:assert/strict");
// fs reads files, path builds file paths, and vm runs JavaScript in a separate context.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { countByStatus, countByWeek, summarize } = require("../server/Dashboardstats");

// Read the real dashboard code from the client folder. __dirname is this test file's folder.
const dashboardCode = fs.readFileSync(
  path.join(__dirname, "../client/recruiter.js"),
  "utf8"
);

// Node.js does not provide browser elements. This object acts like a basic
// button, select menu, or card so the real dashboard code can run in the test.
function element(text = "") {
  return {
    // children holds elements inside this one. dataset holds values such as an applicant's status.
    children: [],
    dataset: {},
    // handlers stores functions for browser events such as clicks and changes.
    handlers: {},
    textContent: text,
    value: "",
    hidden: false,
    appendChild(child) {
      // Record both directions so the child knows which element contains it.
      child.parentElement = this;
      this.children.push(child);
    },
    replaceChildren() {
      // Clear the old list before the dashboard renders it again.
      for (const child of this.children) { child.parentElement = null; }
      this.children = [];
    },
    addEventListener(name, handler) { this.handlers[name] = handler; },
    // The dashboard calls these browser methods. These tests don't use their effects.
    setAttribute() {},
    focus() {}
  };
}

async function startDashboard() {
  // Create fresh elements and data for every test so one test cannot affect the next.
  const elements = {};
  const document = {
    getElementById(id) {
      // Keep one object per ID. Looking up the same ID later returns the same object.
      if (!elements[id]) { elements[id] = element(); }
      return elements[id];
    },
    createElement() { return element(); }
  };
  document.getElementById("postingFilter").value = "all";

  // is_active is true for an open posting and false for an archived posting.
  const job = { id: 1, title: "Developer", is_active: true };
  // Avery and Blake share a date. Avery and Casey share a status.
  // This makes it easy to see whether each filter works independently.
  const applications = [
    { id: 1, applicant_name: "Avery", status: "Applied", created_at: "2026-11-08T12:00:00" },
    { id: 2, applicant_name: "Blake", status: "Interview", created_at: "2026-11-08T12:00:00" },
    { id: 3, applicant_name: "Casey", status: "Applied", created_at: "2026-11-09T12:00:00" }
  ];

  // Supply sample data so the tests can run without a server or Supabase.
  async function apiRequest(url, method, body) {
    // Return a copy of the posting, like a fresh response from the server.
    if (url === "/api/recruiter/jobs") { return [{ ...job }]; }
    if (url === "/api/recruiter/jobs/1/applications") { return applications; }
    if (url === "/api/recruiter/jobs/1" && method === "PATCH") {
      // PATCH changes the sample posting, just like Archive or Restore would on the server.
      job.is_active = body.is_active;
      return { ...job };
    }
    throw new Error("Unexpected request: " + url);
  }

  // Give the real script access to our stand-ins for the browser and shared helpers.
  const context = vm.createContext({
    document,
    makeText: (_tag, text) => element(text),
    showDate: date => new Date(date).toLocaleDateString(),
    apiRequest
  });
  // Run the actual dashboard script in the test environment.
  await vm.runInContext(dashboardCode, context);
  // Load the posting's applications, as if the recruiter had clicked View applicants.
  await vm.runInContext("loadApplicants({ id: 1, title: 'Developer' })", context);
  return elements;
}

function visibleApplicants(elements) {
  // Keep only the visible cards. The first child of each card contains the applicant's name.
  return elements.applicantList.children
    .filter(card => !card.hidden)
    .map(card => card.children[0].textContent);
}

test("US-16 archives and restores a posting", async () => {
  const elements = await startDashboard();
  // Look up the current card each time because the dashboard rebuilds it after an update.
  const posting = () => elements.postingList.children[0];
  // The card's last child is the button row. Find the action by its label.
  const action = text => posting().children.at(-1).children.find(button => button.textContent === text);

  // Call the saved click handler to simulate the recruiter clicking Archive.
  await action("Archive posting").handlers.click();
  // Set the menu value and call its change handler to apply the Open filter.
  elements.postingFilter.value = "open";
  elements.postingFilter.handlers.change();
  assert.equal(posting().hidden, true);

  // The archived posting should appear here. Restoring it should remove it from this view.
  elements.postingFilter.value = "archived";
  elements.postingFilter.handlers.change();
  assert.equal(posting().hidden, false);
  await action("Restore posting").handlers.click();
  assert.equal(posting().hidden, true);

  // Confirm that the restored posting is visible again under Open.
  elements.postingFilter.value = "open";
  elements.postingFilter.handlers.change();
  assert.equal(posting().hidden, false);
});

test("US-17 filters applications by status", async () => {
  const elements = await startDashboard();
  // Choose Applied. Blake has Interview and should be hidden.
  elements.applicantStatus.value = "Applied";
  elements.applicantStatus.handlers.change();
  assert.deepEqual(visibleApplicants(elements), ["Avery", "Casey"]);
});

test("US-17 filters applications by application date", async () => {
  const elements = await startDashboard();
  // Choose November 8. Casey applied on November 9 and should be hidden.
  elements.applicantDate.value = "2026-11-08";
  elements.applicantDate.handlers.change();
  assert.deepEqual(visibleApplicants(elements), ["Avery", "Blake"]);
});

test("US-17 combines both filters and shows the matching count", async () => {
  const elements = await startDashboard();
  // Avery is the only applicant who matches both the status and the date.
  elements.applicantStatus.value = "Applied";
  elements.applicantDate.value = "2026-11-08";
  elements.applicantDate.handlers.change();
  assert.deepEqual(visibleApplicants(elements), ["Avery"]);
  assert.equal(elements.applicantMessage.textContent, "Showing 1 of 3 applications.");
});

test("US-17 clears both filters and shows all applications", async () => {
  const elements = await startDashboard();
  // Apply both filters first so Clear filters has something to reset.
  elements.applicantStatus.value = "Applied";
  elements.applicantDate.value = "2026-11-08";
  elements.applicantDate.handlers.change();
  // Simulate the click, then check both menu values and the visible list.
  elements.clearApplicantFilters.handlers.click();
  assert.equal(elements.applicantStatus.value, "");
  assert.equal(elements.applicantDate.value, "");
  assert.deepEqual(visibleApplicants(elements), ["Avery", "Blake", "Casey"]);
});

const seekerApplications = [
    { id: 1, status: "Applied", created_at: "2026-11-09T09:00:00Z" },   
    { id: 2, status: "Interview", created_at: "2026-11-03T15:30:00Z" }, 
    { id: 3, status: "Rejected", created_at: "2026-11-14T20:00:00Z" },  
    { id: 4, status: "Applied", created_at: "2026-11-08T08:00:00Z" }    
];

test("Job seeker dashboard counts each status and builds the summary", () => {
    assert.deepEqual(countByStatus(seekerApplications), {
        Applied: 2,
        "Under Review": 0,
        Interview: 1,
        Offered: 0,
        Rejected: 1
    });

    assert.deepEqual(summarize(seekerApplications), {
        total: 4,
        pending: 2,
        interviews: 1,
        offers: 0,
        rejected: 1
    });
});

test("Job seeker dashboard counts applications per week, oldest week first", () => {
    assert.deepEqual(countByWeek(seekerApplications), [
        { week: "2026-11-01", count: 1 },
        { week: "2026-11-08", count: 3 }
    ]);
});