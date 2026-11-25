const test = require("node:test");
const assert = require("node:assert/strict");
const { readJob } = require("../server/jobPosting");

// Use the same required fields that the recruiter form sends when it saves a posting.
const posting = {
  title: "Developer",
  company: "Example",
  location: "Montreal",
  category: "Software",
  job_type: "Internship",
  description: "Develop software.",
  requirements: "JavaScript"
};

// A date stays a calendar day when a recruiter creates or edits the posting.
test("accepts a closing date and lets a recruiter replace it", () => {
  const created = readJob({ ...posting, closing_date: "2028-02-29" });
  assert.equal(created.closing_date, "2028-02-29");
  const edited = readJob({ ...created, closing_date: "2028-03-01" });
  assert.equal(edited.closing_date, "2028-03-01");
});

// Leaving the field out preserves older clients' updates. An empty date explicitly clears it.
test("distinguishes an omitted closing date from a cleared date", () => {
  assert.deepEqual(readJob(posting), posting);
  for (const value of ["", null]) {
    assert.deepEqual(readJob({ ...posting, closing_date: value }), { ...posting, closing_date: null });
  }
});

// Crafted requests must meet the same date format and calendar rules as the date picker.
test("rejects impossible dates, timestamps, and non-date values", () => {
  for (const value of ["2027-02-29", "2028-04-31", "2028-13-01", "0000-01-01", "3/4/2028",
    "2028-03-04T00:00:00Z", 20280304, false]) {
    assert.equal(readJob({ ...posting, closing_date: value }), null, String(value));
  }
});
