import axios from "axios";

export type POI = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  lake: string;
  distance: number;
};

export async function getClosestPOIs(lat: number, lon: number): Promise<POI[]> {
  const res = await axios.get<POI[]>("/api/poi/closest", {
    params: { lat, lon },
  });
  return res.data;
}
