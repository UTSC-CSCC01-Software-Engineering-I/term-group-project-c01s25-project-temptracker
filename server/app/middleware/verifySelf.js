const supabase = require("../models/supabase-client");

const verifySelfAccess = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Compare authenticated user ID with requested user ID
  const requestedUserId = req.params.id;
  if (user.id !== requestedUserId) {
    return res.status(403).json({ error: "Access denied" });
  }

  req.user = user;
  next();
};

module.exports = { verifySelfAccess };
