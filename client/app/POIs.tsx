"use client";

import { useEffect, useState } from "react";
import { getClosestPOIs } from "@/lib/services/POIsService";
import { getAverageClosestTemperature } from "@/lib/services/tempByCoordinateService"; // adjust path

type POI = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  lake: string;
  distance: number;
};

export default function POIs() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [closestPOIs, setClosestPOIs] = useState<POI[]>([]);
  const [avgTemps, setAvgTemps] = useState<Record<number, number | null>>({});

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLocation({ latitude: lat, longitude: lon });

        const results = await getClosestPOIs(lat, lon);
        // @ts-ignore
        setClosestPOIs(results);

        const tempsMap: Record<number, number | null> = {};
        for (const poi of results) {
          const avgTemp = await getAverageClosestTemperature(poi.latitude, poi.longitude);
          tempsMap[poi.id] = avgTemp;
        }
        setAvgTemps(tempsMap);
      },
      (err) => {
        setError(err.message);
      }
    );
  }, []);

  return (
    <section className="locations-section">
      <h2 className="m-0">Points of Interest</h2>
      <p>Popular water spots near you</p>

      {error && (
        <p className="text-red-500 mt-2">
          Error: {error}
          <br />
          Please try enabling your location or refresh your browser to view POIs
        </p>
      )}

      <div className="locations-list mt-6">
        {closestPOIs.map(({ id, name, distance }) => (
          <div key={id} className="location-card">
            <span>{name}</span>
            <span>{distance.toFixed(2)} km away</span>
            <span>
              {avgTemps[id] !== undefined
                ? `${avgTemps[id]?.toFixed(2)}°`
                : "..."}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
