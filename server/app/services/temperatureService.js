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
    throw new Error(`Failed to submit temperatures: ${e.message}`);
  }
}

async function submitTemperatures(data) {
  try {
    return { message: "Temperatures submitted successfully", data: data };
  } catch (e) {
    throw new Error(`Failed to submit temperatures: ${e.message}`);
  }
}

module.exports = {
  submitTemperature,
  submitTemperatures,
};
