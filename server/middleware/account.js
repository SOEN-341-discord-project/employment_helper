const supabase = require("../config/supabase");

// Middleware runs before a route. This checks who is logged in.
async function requireUser(req, res, next) {
  try {
    // Accept both the project's existing raw token and "Bearer token".
    const header = req.headers.authorization || "";
    const token = header.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(401).json({ error: "Please log in first." });
    }

    // Supabase verifies the token. Never trust a user ID sent by the browser.
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Your login expired. Please log in again." });
    }

    req.user = data.user; // Make the verified user available to later routes.
    res.set("Cache-Control", "no-store"); // Do not cache private account data.
    next();
  } catch (error) {
    console.error("Account check failed:", error);
    res.status(500).json({ error: "Unable to check your account. Try again." });
  }
}

// Only accounts added to the recruiters table may manage job postings.
async function requireRecruiter(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("recruiters")
      .select("user_id")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) { throw error; }
    if (!data) {
      return res.status(403).json({ error: "This page is for recruiter accounts." });
    }
    next();
  } catch (error) {
    console.error("Recruiter check failed:", error);
    res.status(500).json({ error: "Unable to check recruiter access. Check the database setup." });
  }
}

// Our database uses positive whole numbers for job and application IDs.
function isValidId(value) {
  if (typeof value !== "string" && typeof value !== "number") { return false; }
  return /^[1-9][0-9]*$/.test(String(value));
}

module.exports = { requireUser, requireRecruiter, isValidId };
