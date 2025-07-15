const supabase = require("../models/supabase-client");

const requireAdmin = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "User not authenticated" });

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || profile?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

module.exports = { requireAdmin };
