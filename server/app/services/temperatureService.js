const supabase = require("../models/supabase-client");

async function submitTemperature(formData) {
  try {
    const [hours, minutes] = formData?.time.split(":");
    const timestamp = new Date(formData?.date);
    timestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const formattedData = {
      temperature:
        formData.temperatureUnit === "F"
          ? ((formData.temperature - 32) * 5) / 9
          : formData.temperature,
      latitude: formData.latitude,
      longitude: formData.longitude,
      measured_on: timestamp.toISOString(),
      notes: formData.notes,
      user_id: formData.user_id,
    };

    const { data } = await supabase
      .from("temperatures")
      .insert(formattedData)
      .select()
      .single();

    return {
      message: "Temperature submitted successfully",
      data: data,
    };
  } catch (e) {
    console.error("submitTemperatures error:", e);
    throw e;
  }
}

async function submitTemperatures(csvData) {
  try {
    const { data } = await supabase.from("temperatures").insert(
      csvData.formData.map((item) => ({
        temperature:
          item.temperatureUnit === "F"
            ? ((item.temperature - 32) * 5) / 9
            : item.temperature,
        latitude: item.latitude,
        longitude: item.longitude,
        measured_on: item.date,
        notes: item.notes,
        user_id: csvData.userId,
        is_verified: true, // Temperature submitted via CSV exclusively by admins are verified
      }))
    );

    return { message: "Temperature CSV submitted successfully", data: data };
  } catch (e) {
    console.error("submitTemperatures error:", e);
    throw e;
  }
}

module.exports = {
  submitTemperature,
  submitTemperatures,
};
