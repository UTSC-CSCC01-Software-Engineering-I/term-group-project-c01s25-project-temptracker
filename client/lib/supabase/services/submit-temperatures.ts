import { createClient } from "../client";

const supabase = createClient();
export interface TemperatureSubmission {
  temperature: number;
  temperatureUnit: "C" | "F";
  latitude: number;
  longitude: number;
  date: Date;
  notes?: string;
}

export async function submitTemperature(data: TemperatureSubmission) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Login to submit a temperature reading.");
  }

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
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error submitting temperature:", error);
    throw error;
  }
  return result;
}

export async function submitTemperatures(data: TemperatureSubmission[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Login to submit temperature readings.");
  }

  const { data: result, error } = await supabase.from("temperatures").insert(
    data.map((item) => ({
      temperature:
        item.temperatureUnit === "F"
          ? ((item.temperature - 32) * 5) / 9
          : item.temperature,
      latitude: item.latitude,
      longitude: item.longitude,
      measured_on: item.date.toISOString(),
      notes: item.notes,
      user_id: user.id,
    }))
  );

  if (error) {
    console.error("Error submitting temperatures:", error);
    throw error;
  }
  return result;
}
