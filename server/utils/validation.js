// Check that a job or application ID is a positive whole number.
function isValidId(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return false;
  }

  return /^[1-9][0-9]*$/.test(String(value));
}

// Check that all job-posting information is valid.
function readJob(body) {
  const job = {};

  const fields = [
    "title",
    "company",
    "location",
    "category",
    "job_type",
    "description",
    "requirements"
  ];

  for (const field of fields) {
    const value = body?.[field];

    const limit =
      field === "description" || field === "requirements" ? 10000 : 120;

    if (
      typeof value !== "string" ||
      !value.trim() ||
      value.trim().length > limit
    ) {
      return null;
    }

    job[field] = value.trim();
  }

  const allowedCategories = ["Software", "Hardware", "Data", "Design"];
  if (!allowedCategories.includes(job.category)) {
    return null;
  }

  const allowedJobTypes = [
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
    "Temporary"
  ];

  if (!allowedJobTypes.includes(job.job_type)) {
    return null;
  }

  return job;
}

// Allow the application and tests to use these functions.
module.exports = { isValidId, readJob };