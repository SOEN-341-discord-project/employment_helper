const express = require("express");
const formidable = require("formidable");

const router = express.Router();

router.post("/upload", (req, res) => {

    const form = formidable.formidable({
        maxFileSize: 5 * 1024 * 1024 // I restricted the file size to 5mb per upload.
    });

    form.parse(req, (err, fields, files) => {

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

        res.status(200).json({
            message: "Resume received successfully",
            fileName: resume.originalFilename
        });
    });
});

module.exports = router;