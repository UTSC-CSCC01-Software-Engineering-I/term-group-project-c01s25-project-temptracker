import axios from "axios";

export type POI = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  lake: string;
  distance: number;
};

// Create an Axios instance with the base URL from environment
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export async function getClosestPOIs(lat: number, lon: number): Promise<POI[]> {
  const res = await api.get<POI[]>("/poi/closest", {
    params: { lat, lon },
  });
  return res.data;
}
