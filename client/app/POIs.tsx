"use client";

import { useEffect, useState } from "react";
import { getClosestPOIs, POI } from "@/lib/services/POIsService";
import { getAverageClosestTemperature } from "@/lib/services/tempByCoordinatesService";
import { useUnits } from "@/app/unitsContext";
import { toFarenheit } from "@/components/map/mapUtils";

export default function POIs() {
  const { unit } = useUnits();

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [closestPOIs, setClosestPOIs] = useState<POI[]>([]);
  const [avgTemps, setAvgTemps] = useState<Record<number, number | null>>({});

  useEffect(() => {
    const fallbackLocation = { latitude: 43.70011, longitude: -79.4163 }; // Toronto

    const loadPOIs = async (lat: number, lon: number) => {
      setUserLocation({ latitude: lat, longitude: lon });

      const results = await getClosestPOIs(lat, lon);
      // @ts-ignore
      setClosestPOIs(results);

      const tempsMap: Record<number, number | null> = {};
      for (const poi of results) {
        const avgTemp = await getAverageClosestTemperature(
          poi.latitude,
          poi.longitude
        );
        tempsMap[poi.id] = avgTemp;
      }
      setAvgTemps(tempsMap);
    };

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      loadPOIs(fallbackLocation.latitude, fallbackLocation.longitude);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadPOIs(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setError(err.message + " — using default location");
        loadPOIs(fallbackLocation.latitude, fallbackLocation.longitude);
      }
    );
  }, []);


  return (
    <section className="locations-section">
      <h2 className="mb-2">Points of Interest</h2>
      <p>
        Popular nearby Great Lakes attractions with their water temperatures!
      </p>
      <p className="text-sm italic mb-8">
        Note that due to the proximity of data, places may have similar
        temperatures
      </p>

      <div className="locations-list mt-6">
        {closestPOIs.map(({ id, name, distance }) => (
          <div
            key={id}
            className="location-card flex justify-between items-center text-left"
            style={{ gap: "1rem" }}
          >
            <div>
              <div>{name}</div>
              <div className="text-sm text-gray-500 text-left">
                {distance.toFixed(2)} km away
              </div>
            </div>
            <div className="text-lg font-semibold">
              {avgTemps[id] !== undefined && avgTemps[id] !== null
                ? unit === "Celsius"
                  ? `${avgTemps[id].toFixed(2)}°C`
                  : `${toFarenheit(avgTemps[id]).toFixed(2)}°F`
                : "..."}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
