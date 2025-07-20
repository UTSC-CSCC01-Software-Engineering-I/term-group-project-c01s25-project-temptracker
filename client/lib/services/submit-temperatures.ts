import { createClient } from "../supabase/client";
import axios from "axios";
<<<<<<< HEAD:client/lib/services/submit-temperatures.ts
import { updateStreak } from "./streakService";
=======
import { updateStreak, updateUploads } from "./streakService";
import { awardBadges } from "./badgeAwardService";
>>>>>>> d92a80b681f88eaa9217c1c3f7a1c36252d026bb:client/lib/services/submitTemperatures.ts

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

  // currently, we record streaks by consecutive uploads
  await updateStreak(user.id);
<<<<<<< HEAD:client/lib/services/submit-temperatures.ts
=======
  await updateUploads(user.id);

  await awardBadges(user.id);
>>>>>>> d92a80b681f88eaa9217c1c3f7a1c36252d026bb:client/lib/services/submitTemperatures.ts
}

export async function submitTemperatures(data: TemperatureSubmission[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user) {
    throw new Error("Login to submit temperature readings.");
  }

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/temperatures/csv`,
    { formData: data, userId: user.id },
    {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    }
  );

  console.log("Temperature submission response:", res.data);

  // currently, we record streaks by consecutive uploads
  await updateStreak(user.id);
  await updateUploads(user.id);

  await awardBadges(user.id);
}
