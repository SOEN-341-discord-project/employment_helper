const express = require("express");
const supabase = require("../config/supabase"); //same supabase file the resumes route uses

const router = express.Router();

// GET /api/jobs
// can also be GET /api/jobs?keyword=web&location=montreal&category=Software
router.get("/", async (req, res) => {

    // stuff the user typed in the search bar (can be empty)
    const keyword = req.query.keyword;
    const location = req.query.location;
    const category = req.query.category;

    // start with every job, newest first
    let query = supabase
        .from("jobs")
        .select("*")
        // Closed postings stay in application history but leave the search results.
        .eq("is_active", true)
        .order("posted_at", { ascending: false });

    // only add a filter if the user actually typed something for it
    if (keyword) {
        // commas and brackets break the supabase or() text so we take them out
        const cleanKeyword = keyword.replace(/[,()%]/g, " ").trim();

        if (cleanKeyword) {
            // ilike is not case sensitive, % means "anything before/after"
            query = query.or(
                `title.ilike.%${cleanKeyword}%,company.ilike.%${cleanKeyword}%,description.ilike.%${cleanKeyword}%`
            );
        }
    }

    if (location) {
        query = query.ilike("location", `%${location}%`);
    }

    if (category) {
        query = query.eq("category", category);
    }

    // run the query
    const { data, error } = await query;

    if (error) {
        console.error("Supabase jobs error:", error);
        return res.status(500).json({ error: "Could not load jobs." });
    }

    res.status(200).json(data);
});

module.exports = router;
