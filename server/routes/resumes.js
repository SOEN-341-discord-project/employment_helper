const express = require("express");
const formidable = require("formidable");
const fs = require("fs"); //We are basically telling formadibale to remporary place the uploaded file into our server

const supabase = require("../config/supabase");

const router = express.Router();

router.post("/upload", (req, res) => {

    const form = formidable.formidable({
        maxFileSize: 5 * 1024 * 1024
    });

    form.parse(req, async (err, fields, files) => {

        if (err) {
            return res.status(400).json({
                message: "Error uploading file"
            });
        }

        const resume = files.resume?.[0];

        if (!resume) {
            return res.status(400).json({
                message: "No resume provided"
            });
        }

        try {

            const fileBuffer = fs.readFileSync(resume.filepath); //We are first tellling it where to store this temporary file then we are telling it to read its actualy content into  memory.

            const fileName = `${Date.now()}-${resume.originalFilename}`; //In this way, it is technically impossible to have the same exact file name.

            const { data, error } = await supabase.storage
                .from("resumes")
                .upload(fileName, fileBuffer, {
                    contentType: resume.mimetype
                });

            if (error) {
                return res.status(500).json({
                    message: "Failed to save resume",
                    error: error.message
                });
            }

            return res.status(200).json({
                message: "Resume uploaded successfully",
                fileName: resume.originalFilename,
                path: data.path
            });

        } catch (error) {

            return res.status(500).json({
                message: "Server error",
                error: error.message
            });

        }
    });
});

module.exports = router;