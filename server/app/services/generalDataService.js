const supabase = require("../models/supabaseClient");

async function getBadges() {
  try {
    const { data } = await supabase.from("badges").select("*");

    console.log("Fetched badges:", data);

    return data || [];
  } catch (e) {
    console.error("Error fetching badges:", e);
    throw e;
  }
}

module.exports = {
  getBadges,
};
