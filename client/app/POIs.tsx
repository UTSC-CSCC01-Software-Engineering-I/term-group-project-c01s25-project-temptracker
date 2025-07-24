"use client";

import { useEffect, useState } from "react";
import { getClosestPOIs } from "@/lib/services/POIsService";

type POI = {
  id: number;
  Name: string;
  Latitude: number;
  Longitude: number;
  Lake: string;
  distance: number;
};

export default function POIs() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [closestPOIs, setClosestPOIs] = useState<POI[]>([]);

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

      {error && <p className="text-red-500 mt-2">Error: {error}
        <br></br>Please try enabling your location or refresh your browser to view POIs</p>}

      {/* {userLocation && (
        <p className="m-4">
          Latitude: {userLocation.latitude.toFixed(4)}, Longitude:{" "}
          {userLocation.longitude.toFixed(4)}
        </p>
      )} */}

      <div className="locations-list mt-6">
        {closestPOIs.map(({ id, Name, distance }) => (
          <div key={id} className="location-card">
            <span>{Name}</span>
            <span>{distance.toFixed(2)} km away</span>
          </div>
        ))}
      </div>
    </section>
  );
}
