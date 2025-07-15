import { createClient } from "../client";
import axios from "axios";

const supabase = createClient();
export interface TemperatureSubmission {
  temperature: number;
  temperatureUnit: "C" | "F";
  latitude: number;
  longitude: number;
  date: Date;
  time: string;
  notes?: string;
}

export async function submitTemperature(data: TemperatureSubmission) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user) {
    throw new Error("Login to submit a temperature reading.");
  }

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/temperatures/single`,
    { ...data, user_id: user.id },
    {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    }
  );

  console.log("Temperature submission response:", res.data);
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
