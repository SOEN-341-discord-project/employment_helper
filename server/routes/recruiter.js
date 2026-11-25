const express = require("express");
const supabase = require("../config/supabase");
const { requireUser, requireRecruiter, isValidId } = require("../middleware/account");
// Create and edit requests share the same posting and closing-date validation.
const { readJob } = require("../jobPosting");
const invalidJobMessage = "Check the required job details and any application closing date.";
const router = express.Router();

// Both checks run before every route in this file.
router.use(requireUser, requireRecruiter);

const statuses = ["Applied", "Under Review", "Interview", "Offered", "Rejected"];

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
  // Reject invalid dates before inserting the posting.
  if (!job) { return res.status(400).json({ error: invalidJobMessage }); }
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
      // Apply the same date rules when editing an existing posting.
      if (!changes) { return res.status(400).json({ error: invalidJobMessage }); }
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
      .select("id, applicant_name, applicant_email, resume_name, status, interview_at, created_at")
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
    .select("id, job_id, applicant_id, status, interview_at, resume_path, resume_name").eq("id", id).maybeSingle();
  if (error) { throw error; }
  if (!data || !await findOwnedJob(data.job_id, userId)) { return null; }
  return data;
}

// Validate the interview time here, then save the application and its alerts together.
router.patch("/applications/:id", async function (req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid application." });
  }

  const status = req.body?.status;
  if (!statuses.includes(status)) {
    return res.status(400).json({ error: "Choose a valid application status." });
  }

  let interviewAt = null;
  if (status === "Interview") {
    const date = new Date(req.body.interview_at);
    if (!req.body.interview_at || Number.isNaN(date.getTime()) || date <= new Date()) {
      return res.status(400).json({ error: "Choose a valid future interview date and time." });
    }
    interviewAt = date.toISOString();
  }

  try {
    // The database checks ownership and locks the application before changing its reminders.
    const { data: found, error } = await supabase.rpc("set_recruiter_application_status", {
      p_application_id: req.params.id,
      p_recruiter_id: req.user.id,
      p_status: status,
      p_interview_at: interviewAt
    });
    if (error) { throw error; }
    if (!found) {
      return res.status(404).json({ error: "Application not found in your postings." });
    }
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
