const supabase = require("../models/supabase-client");

async function getAllUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  getAllUsers,
};
