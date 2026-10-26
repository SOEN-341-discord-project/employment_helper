const express = require("express");
const supabase = require("../config/supabase");
const { requireUser, isValidId } = require("../middleware/account");
const router = express.Router();

// All application routes require a verified login.
router.use(requireUser);

// GET /api/applications: show only the logged-in user's applications.
router.get("/", async function (req, res) {
  try {
    const { data, error } = await supabase
      .from("applications")
      // The foreign key connects each application to its job information.
      .select("id, status, created_at, jobs(title, company, location, is_active)")
      .eq("applicant_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) { throw error; }
    res.json(data);
  } catch (error) {
    console.error("Application loading failed:", error);
    res.status(500).json({ error: "Unable to load applications. Check the database setup." });
  }
});

// POST /api/applications: apply using the résumé already saved in the profile.
router.post("/", async function (req, res) {
  const jobId = req.body?.job_id;
  if (!isValidId(jobId)) {
    return res.status(400).json({ error: "Choose a valid job." });
  }

  try {
    // A closed or missing posting cannot receive new applications.
    const job = await supabase.from("jobs")
      .select("id, recruiter_id, is_active")
      .eq("id", jobId).maybeSingle();
    if (job.error) { throw job.error; }
    if (!job.data || !job.data.is_active) {
      return res.status(404).json({ error: "This job is no longer accepting applications." });
    }
    if (job.data.recruiter_id === req.user.id) {
      return res.status(400).json({ error: "You cannot apply to your own posting." });
    }

    // Read the applicant's details from their own saved profile.
    const profile = await supabase.from("career_profiles")
      .select("name, email, resume_name, resume_path")
      .eq("id", req.user.id).maybeSingle();
    if (profile.error) { throw profile.error; }
    if (!profile.data?.resume_path || !profile.data.name || !profile.data.email) {
      return res.status(400).json({ error: "Save your profile and upload a résumé before applying." });
    }

    const { error } = await supabase.from("applications").insert({
      job_id: job.data.id,
      applicant_id: req.user.id,
      // Keep the details submitted today, even if the profile changes later.
      applicant_name: profile.data.name,
      applicant_email: profile.data.email,
      resume_name: profile.data.resume_name,
      resume_path: profile.data.resume_path,
      status: "Applied"
    });

    // A database uniqueness rule also prevents two rapid clicks creating duplicates.
    if (error?.code === "23505") {
      return res.status(409).json({ error: "You have already applied to this job." });
    }
    if (error) { throw error; }
    res.status(201).json({ message: "Application submitted successfully! Track it in My applications." });
  } catch (error) {
    console.error("Application submission failed:", error);
    res.status(500).json({ error: "Unable to submit your application. Please try again." });
  }
});

module.exports = router;
