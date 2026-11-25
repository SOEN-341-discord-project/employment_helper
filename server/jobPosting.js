// A PostgreSQL date has no time component. Round-trip through UTC to reject dates like February 30.
function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) {
    return false;
  }

  const midnight = value + "T00:00:00.000Z";
  return new Date(midnight).toJSON() === midnight;
}

// Validate on the server too: browser form checks can be bypassed.
function readJob(body) {
  const job = {};
  const fields = ["title", "company", "location", "category", "job_type", "description", "requirements"];
  for (const field of fields) {
    const value = body?.[field];
    const limit = field === "description" || field === "requirements" ? 10000 : 120;
    if (typeof value !== "string" || !value.trim() || value.trim().length > limit) {
      return null;
    }
    job[field] = value.trim();
  }
  if (!["Software", "Hardware", "Data", "Design"].includes(job.category)) { return null; }
  if (!["Full-time", "Part-time", "Internship", "Contract", "Temporary"].includes(job.job_type)) { return null; }
  // Older clients can omit the field on edit. Clearing the form explicitly removes the date.
  const closingDate = body.closing_date;
  if (closingDate === "" || closingDate === null) {
    job.closing_date = null;
  } else if (closingDate !== undefined) {
    if (!isCalendarDate(closingDate)) { return null; }
    job.closing_date = closingDate;
  }

  return job;
}

module.exports = { readJob };
