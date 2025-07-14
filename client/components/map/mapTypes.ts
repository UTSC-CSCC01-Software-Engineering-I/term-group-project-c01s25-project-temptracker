export type MapProps = {
  centerLatitude: number | null;
  centerLongitude: number | null;
  timeRange: "all" | "week" | "month";
};

export type TemperaturePoint = [number, number, number]; // [lat, lng, temperature]
export type TimeTemperaturePoint = [number, number, number, string]; // [lat, lng, temperature, time]
