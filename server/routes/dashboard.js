const express = require("express");
const supabase = require("../config/supabase");
const { requireUser } = require("../middleware/account");
const { countByStatus, countByWeek, summarize } = require("../Dashboardstats");

const router = express.Router();

router.use(requireUser);

router.get("/", async function (req, res) {
    try {
        const { data, error } = await supabase
            .from("applications")
            .select("id, status, created_at, jobs(title, company, location, is_active)")
            .eq("applicant_id", req.user.id)
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        res.json({
            summary: summarize(data),
            byStatus: countByStatus(data),
            byWeek: countByWeek(data),
            history: data
        });
    }
    catch (error) {
        console.error("Dashboard failed during loading error: ", error);
        res.status(500).json({ error: "Dashboard couldn't be loaded, please try again" });
    }
});

module.exports = router;