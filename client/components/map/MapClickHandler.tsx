import { useMapEvents } from "react-leaflet";
import React from "react";
import { getTemperatureReading, lakeClicked } from "@/lib/services/getTemperatureReadingService";

interface ClickedPoint {
  latitude: number | null;
  longitude: number | null;
  nearestPoint: {
    latitude: number;
    longitude: number;
    temperature: number;
  } | null;
}

interface MapClickHandlerProps {
  timeRange: string;
  today: Date;
  date: Date;
  currentHour: number;
  setClickedPoint: (point: ClickedPoint) => void;
  setClickedLake: (lake: string | null) => void;
}


const findNearestTemperaturePoint = async (
    // calls a backend service to find the nearest temperature point to a given lat and long on a specific date
    clickLat: number,
    clickLng: number,
    date: string,
    hour: string
  ) => {
    const data = {
      coord: [clickLat, clickLng],
      date: date,
      hour: hour,
    };
    let nearest = null;
    const result = await getTemperatureReading(data);
    if (result.data) {
      const temp: number = result.data.temp;
      const lat: number = result.data.lat;
      const lng: number = result.data.lng;
      nearest = {
        latitude: lat,
        longitude: lng,
        temperature: temp,
      };
    }

    // console.log("Nearest point:", nearest);

    return nearest;
  };

export const MapClickHandler: React.FC<MapClickHandlerProps> = ({timeRange, today, date, currentHour, setClickedPoint, setClickedLake}) => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        if (
          typeof lat !== "number" ||
          typeof lng !== "number" ||
          isNaN(lat) ||
          isNaN(lng)
        ) {
          console.warn("Invalid coordinates:", { lat, lng });
          return;
        }
        console.log("Map clicked at:", lat, lng);
        let nearestPoint;
        let clickedOnLake;
        const [nearestPointResult, lakeClickResult] = await Promise.all([
          timeRange === 'week' 
            ? findNearestTemperaturePoint(
                lat,
                lng,
                `${date.getFullYear()}${(date.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`,
                "12"
              )
            : findNearestTemperaturePoint(
                lat,
                lng,
                `${today.getFullYear()}${(today.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`,
                currentHour.toString().padStart(2, "0")
              ),
          
          timeRange === 'week'
            ? lakeClicked({
                coord: [lat, lng],
                date: `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`,
                hour: '12'
              })
            : lakeClicked({
                coord: [lat, lng],
                date: `${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`,
                hour: currentHour.toString().padStart(2, '0')
              })
        ]);
        nearestPoint = nearestPointResult
        clickedOnLake = lakeClickResult
    
        if (nearestPoint) {
          console.log("set clicked point");
          console.log(nearestPoint);
          setClickedPoint({
            latitude: lat,
            longitude: lng,
            nearestPoint: nearestPoint,
          });
        } else {
          setClickedPoint({
            latitude: null,
            longitude: null,
            nearestPoint: null,
          });
        }

        if (clickedOnLake.lake && clickedOnLake.lake) {
          console.log('user clicked on:', clickedOnLake.lake)
          setClickedLake(clickedOnLake.lake)
        } else {
          console.log('no lake clicked')
          setClickedLake(null)
        }
      },
    });
    return null;
  };