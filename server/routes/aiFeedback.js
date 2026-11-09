const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { PDFParse } = require("pdf-parse");
const axios = require("axios");

// Check if the user is logged in
router.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "You are not logged in." });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid login." });
    }

    req.user = data.user;
    next();

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error." });
  }
});


// Get the user's resume for AI feedback
router.post("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("career_profiles")
      .select("resume_name, resume_path")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || !data.resume_path) {
      return res.status(404).json({
        error: "No resume found. Please upload a resume first."
      });
    }
    
    // Download the resume from Supabase
    const { data: resumeFile, error: downloadError } = await supabase.storage
    .from("resumes")
    .download(data.resume_path);

    if (downloadError) {
    throw downloadError;
    }


    // Convert the downloaded resume to a buffer
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());

    // Read the text from the PDF
    const parser = new PDFParse({ data: resumeBuffer });
    const pdfData = await parser.getText();
    await parser.destroy();

    const resumeText = pdfData.text;

    // Ask Gemini to give feedback on the resume
    const prompt = `
    Review this resume and give simple feedback.

    Give:
    1. Three strengths
    2. Three things that could be improved
    3. Three specific recommendations

    Resume:
    ${resumeText}
    `;

    const geminiResponse = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
    {
        contents: [
        {
            parts: [
            { text: prompt }
            ]
        }
        ]
    },
    {
        headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY,
        "Content-Type": "application/json"
        }
    }
    );

    const feedback =
    geminiResponse.data.candidates[0].content.parts[0].text;

        res.json({
    message: "AI feedback generated successfully.",
    resumeName: data.resume_name,
    feedback: feedback
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Unable to analyze resume." });
  }
});

module.exports = router;