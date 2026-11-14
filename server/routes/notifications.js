const express= require("express");
const supabase = require("../config/supabase");
const { requireUser, isValidId } = require("../middleware/account");

const router=express.Router();

// Every notification route requires a verified login.
router.use(requireUser);

router.get("/", async function (req, res) {
  try {
    const currentTime = new Date().toISOString();
    const { data, error } = await supabase
        .from("notifications")
        .select("id, type, message, job_id, application_id, is_read, created_at, available_at")
        .eq("recipient_id", req.user.id)
        .lte("available_at", currentTime)
        .order("available_at", { ascending: false });

        if (error) { 
            throw error;
         }

         res.json(data);
    } catch (error) {
        console.error("Notification loading failed:", error);
        res.status(500).json({ error: "Unable to load notifications."});
    }
});

// PATCH /api/notifications/:id/read: mark one notification as read.
router.patch("/:id/read", async function (req, res) {
  const notificationId = req.params.id;

  if (!isValidId(notificationId)) {
    return res.status(400).json({ error: "Invalid notification ID." });
  }

  try {
    const currentTime = new Date().toISOString();

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("recipient_id", req.user.id)
      .lte("available_at", currentTime)
      .select("id, is_read")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.json(data);
  } catch (error) {
    console.error("Notification update failed:", error);
    res.status(500).json({ error: "Unable to update notification." });
  }
});

module.exports = router;
