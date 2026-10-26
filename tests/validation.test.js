const test = require("node:test");
const assert = require("node:assert/strict");

const { isValidId, readJob } = require("../server/utils/validation");

function createValidJob() {
  return {
    title: "Software Developer",
    company: "Example Company",
    location: "Montreal",
    category: "Software",
    job_type: "Full-time",
    description: "Develop and maintain software.",
    requirements: "Knowledge of JavaScript."
  };
}

test("isValidId accepts positive whole-number IDs", function () {
  const validIds = [1, 25, "1", "999"];

  for (const id of validIds) {
    assert.equal(isValidId(id), true);
  }
});

test("isValidId rejects invalid IDs", function () {
  const invalidIds = [
    0,
    -1,
    1.5,
    "0",
    "-4",
    "1.5",
    "hello",
    "",
    null,
    undefined
  ];

  for (const id of invalidIds) {
    assert.equal(isValidId(id), false);
  }
});

test("readJob accepts a complete valid job", function () {
  const job = createValidJob();
  const result = readJob(job);

  assert.deepEqual(result, job);
});

test("readJob removes spaces around field values", function () {
  const job = createValidJob();
  job.title = "  Software Developer  ";

  const result = readJob(job);

  assert.equal(result.title, "Software Developer");
});

test("readJob rejects a job with a missing field", function () {
  const job = createValidJob();
  delete job.title;

  assert.equal(readJob(job), null);
});

test("readJob rejects an empty required field", function () {
  const job = createValidJob();
  job.company = "   ";

  assert.equal(readJob(job), null);
});

test("readJob rejects an unsupported category", function () {
  const job = createValidJob();
  job.category = "Medicine";

  assert.equal(readJob(job), null);
});

test("readJob rejects an unsupported job type", function () {
  const job = createValidJob();
  job.job_type = "Volunteer";

  assert.equal(readJob(job), null);
});

test("readJob rejects a regular field longer than 120 characters", function () {
  const job = createValidJob();
  job.title = "a".repeat(121);

  assert.equal(readJob(job), null);
});

test("readJob rejects a description longer than 10000 characters", function () {
  const job = createValidJob();
  job.description = "a".repeat(10001);

  assert.equal(readJob(job), null);
});