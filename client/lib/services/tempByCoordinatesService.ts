import axios from "axios";

export type TemperaturePoint = {
  temp_id: number;
  temp_latitude: number;
  temp_longitude: number;
  temperature: number;
  measured_on: string;
  distance_km: number;
};

const API_BASE = "/api/tempByCoordinates";

export async function getClosestVerifiedTemps(
  lat: number,
  lon: number,
  limit: number,
  interval: string
): Promise<TemperaturePoint[]> {
  const res = await axios.get(`${API_BASE}/closest`, {
    params: { lat, lon, limit, interval },
  });
  return res.data;
}

export async function getAverageClosestTemperature(
  lat: number,
  lon: number,
  limit = 2,
  interval = "30 days"
): Promise<number | null> {
  const res = await axios.get(`${API_BASE}/average`, {
    params: { lat, lon, limit, interval },
  });
  return res.data.average;
}
