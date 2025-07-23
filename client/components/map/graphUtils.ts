import type { TemperaturePoint } from "./mapTypes";


export const tempConverter = (temp: number) => {
  //celcius
  if (temp <= 0) {
    return 0.0;
  } else if (temp <= 6.7) {
    return 0.2; //blue
  } else if (temp <= 10.55) {
    return 0.4; //green
  } else if (temp <= 15.6) {
    return 0.6; //yellow
  } else if (temp <= 19.5) {
    return 0.8; //orange
  } else if (temp <= 23.3) {
    return 0.9; //red
  } else {
    return 1.0; // dark red
  }
};

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

export const generateGridInPolygon = (polygon: any, gridSize = 0.1) => {
  const coords = polygon;

  // Find bounding box
  const lats = coords.map((coord: [number, number]) => coord[1]);
  const lngs = coords.map((coord: [number, number]) => coord[0]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const gridPoints: [number, number][] = [];

  // Generate grid points
  for (let lat = minLat; lat <= maxLat; lat += gridSize) {
    for (let lng = minLng; lng <= maxLng; lng += gridSize) {
      if (pointInPolygon([lng, lat], coords)) {
        gridPoints.push([lng, lat]);
      }
    }
  }

  return gridPoints;
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

export const interpolation = (polygon: any, tempPoints: any, point: any) => {
  let polygonPoints = [];
  const power = 2;
  for (let i = 0; i < tempPoints.length; i++) {
    const tempPoint = [tempPoints[i][1], tempPoints[i][0], tempPoints[i][2]]; // [lng, lat, temp]
    if (pointInPolygon([tempPoint[0], tempPoint[1]], polygon)) {
      polygonPoints.push(tempPoint);
    }
  }

  let weightedSum = 0;
  let weightSum = 0;

  for (let i = 0; i < polygonPoints.length; i++) {
    const dist = distance(point, [polygonPoints[i][0], polygonPoints[i][1]]);

    if (dist === 0) {
      const newPoint: TemperaturePoint = [
        point[1],
        point[0],
        polygonPoints[i][2],
      ];
      return newPoint;
    }

    const weight = 1 / Math.pow(dist, power);
    weightedSum += polygonPoints[i][2] * weight;
    weightSum += weight;
  }

  const interpolatedTemp = weightedSum / weightSum;

  // Return [latitude, longitude, converted_temp]
  const newPoint: TemperaturePoint = [point[1], point[0], interpolatedTemp];
  return newPoint;
};



