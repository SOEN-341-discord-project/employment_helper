const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const router = express.Router();
const supabase = require("../config/supabase");


//request profile page
router.use(async function (req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "You are not logged in." });
    }
    const result = await supabase.auth.getUser(token);

   if (result.error || !result.data.user) {
  console.error("Login verification failed:", result.error);
  return res.status(401).json({ error: "Error: Try again to login." });
}

    req.user = result.data.user; next();
  } catch (error) {  res.status(500).json({ error: "Cant seem to reach the account." }); //server connection issue
  }
});
router.get("/", async function (req, res) {
  try {
    const result = await supabase
      .from("career_profiles")
      .select("*")
      .eq("id", req.user.id)
      .maybeSingle();

    if (result.error) {throw result.error; }

    res.json({ profile: result.data });

   } catch (error) {
    console.error("Profile loading error:", error);
    res.status(500).json({ error: "Profile doesn't seem to load." });
  }
});




//form checking

router.post("/", function (req, res) {


  const form = formidable.formidable({
  maxFileSize: 5 * 1024 * 1024,
  maxFiles: 1
});


   //req the resume and our fields
  form.parse(req, async function (err, fields, files) {
    const resume = files.resume?.[0];
    let uploadedResume = "";

    try {
      if (err) {
        return res.status(400).json({
          error: "Error reading form."
        });
      }
      const profile = {
        id: req.user.id,
        name: fields.fullName?.[0],
        email: fields.email?.[0],
        skills: fields.skills?.[0],
        location: fields.location?.[0],
        preference_work: fields.workPreference?.[0],
        hours_work: fields.workHours?.[0],
        contract: fields.contractType?.[0]
      };

      const requiredFields = [
        "name", "email", "skills", "location",
        "preference_work", "hours_work", "contract"
      ];

      for (const field of requiredFields) {
        if (typeof profile[field] !== "string") {
          return res.status(400).json({
            error: "Fill the form."
          });
        }

        profile[field] = profile[field].trim();

        if (profile[field] === "" || profile[field].length > 100) {
          return res.status(400).json({
            error: "Ensure there's less than 100 chars ."
          });
        }
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
        return res.status(400).json({
          error: "Invalid email format."
        });
      }
      const time = ["any", "full-time", "part-time"];
      const preferences = ["any", "on-site", "hybrid", "remote"];
      const contracts = [
        "any", "permanent", "contract", "temporary", "internship"
      ];

      if (
        !preferences.includes(profile.preference_work) ||
        !time.includes(profile.hours_work) ||
        !contracts.includes(profile.contract)
      ) {
        return res.status(400).json({
          error: "Select valid preferences."
        });
      }
      const previousUserFormData = await supabase
        .from("career_profiles")
        .select("resume_name, resume_path")
        .eq("id", req.user.id)
        .maybeSingle();

      if (previousUserFormData.error) {
        throw previousUserFormData.error;   // database lookup failed
      }

      if (resume) {
        const extension = resume.originalFilename
          .split(".").pop().toLowerCase();

        if (!["pdf", "doc", "docx"].includes(extension)) {
          return res.status(400).json({
            error: "Only PDF and Word please."
          });
        }


 //amers code
 const fileBuffer = fs.readFileSync(resume.filepath);

        const fileName =
          req.user.id + "/" + Date.now() + "." + extension;

        const { data, error } = await supabase.storage
          .from("resumes")
          .upload(fileName, fileBuffer, {
            contentType: resume.mimetype
          });

        if (error) {
          throw error;
        }

        uploadedResume = data.path;
        profile.resume_name = resume.originalFilename;
        profile.resume_path = data.path;
//amers code






      } else if (previousUserFormData.data && previousUserFormData.data.resume_path) {
        profile.resume_name = previousUserFormData.data.resume_name;
        profile.resume_path = previousUserFormData.data.resume_path;
      } else {
        return res.status(400).json({ error: "Please select a résumé." });
      }

      profile.updated_at = new Date().toISOString();

      const saved = await supabase
        .from("career_profiles")
        .upsert(profile)
        .select()
        .single();

      if (saved.error) {
        throw saved.error;
      }

      uploadedResume = "";

      res.json({
        message: "Profile saved successfully!",
        profile: saved.data
      });

    } catch (error) {
      console.error(error);

      if (uploadedResume !== "") {
        await supabase.storage.from("resumes").remove([uploadedResume]);
      }

      res.status(500).json({ error: "Unable to save your profile." });

    } finally {
      if (resume) {
        try {
          fs.unlinkSync(resume.filepath);
        } catch (error) {
          console.error("Unable to remove temporary file:", error);
        }
      }
    }
  });
});

module.exports = router;