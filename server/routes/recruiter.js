const express = require("express");
const supabase = require("../config/supabase");
const { requireUser, requireRecruiter, isValidId } = require("../middleware/account");
const router = express.Router();

// Both checks run before every route in this file.
router.use(requireUser, requireRecruiter);

const statuses = ["Applied", "Under Review", "Interview", "Offered", "Rejected"];

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
  return job;
}

// Look up a posting AND its owner together. Knowing a job ID is not permission.
async function findOwnedJob(jobId, userId) {
  const { data, error } = await supabase.from("jobs")
    .select("*").eq("id", jobId).eq("recruiter_id", userId).maybeSingle();
  if (error) { throw error; }
  return data;
}

// GET /api/recruiter/jobs: list this recruiter's open and closed postings.
router.get("/jobs", async function (req, res) {
  try {
    const { data, error } = await supabase.from("jobs").select("*")
      .eq("recruiter_id", req.user.id).order("posted_at", { ascending: false });
    if (error) { throw error; }
    res.json(data);
  } catch (error) {
    console.error("Recruiter jobs failed:", error);
    res.status(500).json({ error: "Unable to load your postings." });
  }
});

// POST /api/recruiter/jobs: create a posting owned by the verified recruiter.
router.post("/jobs", async function (req, res) {
  const job = readJob(req.body);
  if (!job) { return res.status(400).json({ error: "Complete every field with valid job details." }); }
  try {
    const { data, error } = await supabase.from("jobs")
      .insert({ ...job, recruiter_id: req.user.id, is_active: true })
      .select().single();
    if (error) { throw error; }
    res.status(201).json(data);
  } catch (error) {
    console.error("Posting creation failed:", error);
    res.status(500).json({ error: "Unable to create the posting." });
  }
});

// PATCH /api/recruiter/jobs/:id: edit a posting or close/reopen it.
router.patch("/jobs/:id", async function (req, res) {
  if (!isValidId(req.params.id)) { return res.status(400).json({ error: "Invalid job." }); }
  try {
    const existing = await findOwnedJob(req.params.id, req.user.id);
    if (!existing) { return res.status(404).json({ error: "Posting not found in your account." }); }

    let changes;
    // A request with only is_active changes availability, not the description.
    if (Object.keys(req.body || {}).length === 1 && typeof req.body.is_active === "boolean") {
      changes = { is_active: req.body.is_active };
    } else {
      changes = readJob(req.body);
      if (!changes) { return res.status(400).json({ error: "Complete every field with valid job details." }); }
    }

    const { data, error } = await supabase.from("jobs").update(changes)
      .eq("id", req.params.id).eq("recruiter_id", req.user.id).select().single();
    if (error) { throw error; }
    res.json(data);
  } catch (error) {
    console.error("Posting update failed:", error);
    res.status(500).json({ error: "Unable to update the posting." });
  }
});

// GET /api/recruiter/jobs/:id/applications: applicants for one owned posting.
router.get("/jobs/:id/applications", async function (req, res) {
  if (!isValidId(req.params.id)) { return res.status(400).json({ error: "Invalid job." }); }
  try {
    if (!await findOwnedJob(req.params.id, req.user.id)) {
      return res.status(404).json({ error: "Posting not found in your account." });
    }
    const { data, error } = await supabase.from("applications")
      .select("id, applicant_name, applicant_email, resume_name, status, created_at")
      .eq("job_id", req.params.id).order("created_at", { ascending: false });
    if (error) { throw error; }
    res.json(data);
  } catch (error) {
    console.error("Applicant loading failed:", error);
    res.status(500).json({ error: "Unable to load applicants." });
  }
});

// Find an application only when its job belongs to this recruiter.
async function findOwnedApplication(id, userId) {
  const { data, error } = await supabase.from("applications")
    .select("id, job_id, resume_path, resume_name").eq("id", id).maybeSingle();
  if (error) { throw error; }
  if (!data || !await findOwnedJob(data.job_id, userId)) { return null; }
  return data;
}

// PATCH /api/recruiter/applications/:id: change an applicant's status.
router.patch("/applications/:id", async function (req, res) {
  if (!isValidId(req.params.id) || !statuses.includes(req.body?.status)) {
    return res.status(400).json({ error: "Choose a valid application status." });
  }
  try {
    if (!await findOwnedApplication(req.params.id, req.user.id)) {
      return res.status(404).json({ error: "Application not found in your postings." });
    }
    const { error } = await supabase.from("applications")
      .update({ status: req.body.status }).eq("id", req.params.id);
    if (error) { throw error; }
    res.json({ message: "Application status updated." });
  } catch (error) {
    console.error("Status update failed:", error);
    res.status(500).json({ error: "Unable to update the application status." });
  }
});

// GET /api/recruiter/applications/:id/resume: view the résumé submitted for this job.
router.get("/applications/:id/resume", async function (req, res) {
  if (!isValidId(req.params.id)) { return res.status(400).json({ error: "Invalid application." }); }
  try {
    const application = await findOwnedApplication(req.params.id, req.user.id);
    if (!application) {
      return res.status(404).json({ error: "Application not found in your postings." });
    }
    // A temporary link opens a private file without exposing the secret key.
    const { data, error } = await supabase.storage.from("resumes")
      .createSignedUrl(application.resume_path, 300);
    if (error) { throw error; }
    res.json({ url: data.signedUrl });
  } catch (error) {
    console.error("Applicant résumé failed:", error);
    res.status(500).json({ error: "Unable to open this résumé." });
  }
});

module.exports = router;
