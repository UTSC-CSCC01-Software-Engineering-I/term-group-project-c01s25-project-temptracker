import React, { useEffect, useState } from "react";
import { getClosestVerifiedTemps, getAverageClosestTemperature, TemperaturePoint } from "@/lib/services/tempByCoordinatesService";

type TrendsModalProps = {
  latitude: number | null;
  longitude: number | null;
  onClose: () => void;
};

const TrendsModal: React.FC<TrendsModalProps> = ({ latitude, longitude, onClose }) => {
  const [closestTemps, setClosestTemps] = useState<TemperaturePoint[] | null>(null);
  const [avgTemp, setAvgTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setLoading(true);
      setError(null);

      // fetch both asynchronously
      Promise.all([
        getClosestVerifiedTemps(latitude, longitude, 5, "30 days"),
        getAverageClosestTemperature(latitude, longitude),
      ])
        .then(([temps, avg]) => {
          setClosestTemps(temps);
          setAvgTemp(avg);
        })
        .catch((err) => {
          setError("Failed to load trend data");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [latitude, longitude]);

  return (
    <div
      className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-[1100]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md p-6 max-w-lg w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4">Trend Analysis</h2>

        {loading && <p>Loading trend data...</p>}

        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            {latitude !== null && longitude !== null ? (
              <div>
                <p>
                  Showing trends for coordinates:
                  <br />
                  <strong>Latitude:</strong> {latitude.toFixed(4)}
                  <strong>Longitude:</strong> {longitude.toFixed(4)}
                </p>

                <p className="mt-4 font-semibold">Average Temperature (last 30 days):</p>
                <p>{avgTemp !== null ? `${avgTemp.toFixed(2)} °C` : "No data"}</p>

                <p className="mt-4 font-semibold">Closest Verified Temperatures:</p>
                {closestTemps && closestTemps.length > 0 ? (
                  <ul className="list-disc list-inside max-h-40 overflow-auto">
                    {closestTemps.map((temp) => (
                      <li key={temp.temp_id}>
                        {temp.temperature} °C — measured on {new Date(temp.measured_on).toLocaleDateString()} — {temp.distance_km.toFixed(2)} km away
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No nearby temperature points found.</p>
                )}
              </div>
            ) : (
              <p>No coordinates selected.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrendsModal;
