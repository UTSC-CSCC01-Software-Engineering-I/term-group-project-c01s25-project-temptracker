import type { TemperaturePoint } from "./mapTypes";

export const toFarenheit = (temp: any) => {
  if (typeof temp === "number") {
    return temp * 1.8 + 32;
  }
};

//COLOR VISUALIAZATION
export const pointInPolygon = (point: number[], polygon: number[][]) => {
  const x = point[0]; //lng
  const y = point[1]; //lat
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

export const distance = (
  point1: [number, number],
  point2: [number, number]
) => {
  const lat1 = point1[1];
  const lng1 = point1[0];
  const lat2 = point2[0];
  const lng2 = point2[1];
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
};



