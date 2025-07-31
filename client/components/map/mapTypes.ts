export type MapProps = {
  centerLatitude: number | null;
  centerLongitude: number | null;
  timeRange: "week" | "today";
};

export type TemperaturePoint = [number, number, number]; // [lat, lng, temperature]
export type TimeTemperaturePoint = [number, number, number, string]; // [lat, lng, temperature, time]
