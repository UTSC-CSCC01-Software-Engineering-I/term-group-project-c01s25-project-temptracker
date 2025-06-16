import { createClient } from "../client";

export interface TemperatureSubmission {
  temperature: number;
  temperatureUnit: "C" | "F";
  latitude: number;
  longitude: number;
  date: Date;
  notes?: string;
}

export async function submitTemperature(data: TemperatureSubmission) {
  const supabase = createClient();

  // Uncomment this block after implementing authentication

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // if (!user) {
  //   throw new Error("Login to submit a temperature reading.");
  // }

  const { data: result, error } = await supabase
    .from("temperatures")
    .insert({
      temperature:
        data.temperatureUnit === "F"
          ? ((data.temperature - 32) * 5) / 9
          : data.temperature,
      latitude: data.latitude,
      longitude: data.longitude,
      measured_on: data.date.toISOString(),
      notes: data.notes,
      user_id: "e013a350-51d9-468a-a104-ef1168eaec01", // Change this to user.id after implementing authentication
    })
    .select()
    .single();

  if (error) {
    console.error("Error submitting temperature:", error);
    throw error;
  }
  return result;
}
