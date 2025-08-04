import axios from "axios";
import { getCurrentUser, getAccessToken } from "../authSession";
import { awardBadges } from "./badgeAwardService";

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
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();

  if (!user) {
    throw new Error("Login to submit a temperature reading.");
  }

  if (!accessToken) {
    throw new Error("No access token found.");
  }

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/temperatures/single`,
    { ...data, user_id: user.id },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  console.log("Temperature submission response:", res.data);

  // update streak and uploads after submission
  await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/streak`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/submissions`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  await awardBadges(user.id);
}

export async function submitTemperatures(data: TemperatureSubmission[]) {
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();

  if (!user) {
    throw new Error("Login to submit temperature readings.");
  }

  if (!accessToken) {
    throw new Error("No access token found.");
  }

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/temperatures/csv`,
    { formData: data, userId: user.id },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  console.log("Temperature submission response:", res.data);

  // update streak and uploads after submission
  await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/streak`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/submissions`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  await awardBadges(user.id);
}
