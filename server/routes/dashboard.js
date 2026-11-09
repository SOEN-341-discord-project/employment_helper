const express = require ("express");
const supabase = require("../config/supabase");
const {requireUser} = require("../middleware/account");
const {countByStatus, countByWeek, summarize} = require("../Dashboardstats");

const router = express.Router();

router.get("/", async function (req, res) {
    try {
        const {data, error} = await supabase
            .from("applications")
            .select("id, status, created_at")
            .eq("applicant_id", req.user.id);

        if (error) {
            throw error;
        }

        res.json({
            summary: summarize(data),
            byStatus: countByStatus(data),
            byWeek: countByWeek(data)
        });
    }
    catch (error) {
        console.error("Dashboard failed during loading errror: ", error);
        res.status(500).json({ error: "Dashboard couldn't be loaded, please try again"});
    }
});

module.exports = router;