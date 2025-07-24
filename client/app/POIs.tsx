"use client";

import { useEffect, useState } from "react";
import { getClosestPOIs } from "@/lib/services/POIsService";

const locations = [
  { id: 1, name: "Location A", temperature: "22°C" },
  { id: 2, name: "Location B", temperature: "19°C" },
  { id: 3, name: "Location C", temperature: "25°C" },
];

export default function POIs() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [closestNames, setClosestNames] = useState("");

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
        setClosestNames(results);
      },
      (err) => {
        setError(err.message);
      }
    );
  }, []);

  return (
    <section className="locations-section">
      <h2 className="m-0">Points of Interest</h2>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {userLocation && (
        <p className="m-4">
          Latitude: {userLocation.latitude.toFixed(4)}, Longitude:{" "}
          {userLocation.longitude.toFixed(4)}
        </p>
      )}

      <textarea
        className="m-4 p-2 w-full h-40 border rounded"
        value={JSON.stringify(closestNames, null, 2)}
        readOnly
      />

      <div className="locations-list">
        {locations.map(({ id, name, temperature }) => (
          <div key={id} className="location-card">
            <span>{name}</span>
            <span>{temperature}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
