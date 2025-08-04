import React, { useEffect, useState } from "react";
import {
  getClosestVerifiedTemps,
  getAverageClosestTemperature,
  TemperaturePoint,
} from "@/lib/services/tempByCoordinatesService";
import {
  getChartData,
  ChartPoint,
} from "@/lib/services/getTemperatureReadingService";
import TempChart from "./TempChart";
import { lakeCodeConvert } from "../map/mapUtils";

type TrendsModalProps = {
  latitude: number | null;
  longitude: number | null;
  lake: string | null;
  onClose: () => void;
};

const TrendsModal: React.FC<TrendsModalProps> = ({
  latitude,
  longitude,
  lake,
  onClose,
}) => {
  const [closestTemps, setClosestTemps] = useState<TemperaturePoint[] | null>(
    null
  );
  const [lakeTemps, setLakeTemps] = useState<ChartPoint[] | null>(null);
  const [lakeName, setLakeName] = useState<string | null>(null);
  const [avgTemp, setAvgTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"local" | "lake">("local");

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setLoading(true);
      setError(null);
      Promise.all([
        getClosestVerifiedTemps(latitude, longitude, 10, "30 days"),
        getAverageClosestTemperature(latitude, longitude),
        getChartData(lake),
      ])
        .then(([temps, avg, lake_points]) => {
          setClosestTemps(temps);
          setAvgTemp(avg);
          setLakeTemps(lake_points.data);
          if (lake_points.data) {
            setLakeName(lake);
          }
        })
        .catch((error) => {
          console.error("Error in modal: ", error);
          setError("Failed to load trend data");
        })
        .finally(() => setLoading(false));
    }
  }, [latitude, longitude, lake]);

  const chartData = closestTemps
    ? [...closestTemps]
        .sort(
          (a, b) =>
            new Date(a.measured_on).getTime() - new Date(b.measured_on).getTime()
        )
        .map((temp) => ({
          date: new Date(temp.measured_on).toLocaleDateString(),
          temperature: temp.temperature,
        }))
    : [];

  const latestTemp =
    closestTemps && closestTemps.length > 0
      ? closestTemps.reduce((a, b) =>
          new Date(a.measured_on) > new Date(b.measured_on) ? a : b
        ).temperature
      : null;

  const tempDiff =
    avgTemp !== null && latestTemp !== null
      ? (latestTemp - avgTemp).toFixed(2)
      : null;

  return (
    <div
      className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-[1100]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md p-4 md:p-8 max-w-md md:max-w-2xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              className={`px-4 py-1.5 text-sm md:text-base rounded-full font-medium transition-colors ${
                view === "local"
                  ? "bg-nav-blue text-white"
                  : "text-gray-700 hover:text-black"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setView("local");
              }}
            >
              Selected Location
            </button>
            <button
              className={`px-4 py-1.5 text-sm md:text-base rounded-full font-medium transition-colors ${
                view === "lake"
                  ? "bg-nav-blue text-white"
                  : "text-gray-700 hover:text-black"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setView("lake");
              }}
            >
              Great Lake
            </button>
          </div>
        </div>

        {view === "local" && (
          <>
            <div className="flex flex-wrap md:flex-nowrap gap-2 mb-4 justify-center">
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium select-none whitespace-nowrap">
                Avg Temp (30d):{" "}
                {avgTemp !== null ? `${avgTemp.toFixed(2)} °C` : "No data"}
              </div>
              {tempDiff !== null && (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium select-none whitespace-nowrap ${
                    parseFloat(tempDiff) > 0
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {parseFloat(tempDiff) > 0
                    ? `${tempDiff}°C warmer than avg`
                    : `${Math.abs(parseFloat(tempDiff))}°C colder than avg`}
                </div>
              )}
            </div>
            <TempChart
              title="Selected Location Trends"
              data={chartData}
              loading={loading}
              error={error}
              noDataMessage="Please select a location within a lake boundary to view the trends."
            />
          </>
        )}

        {view === "lake" && (
          <TempChart
            title={`${lakeCodeConvert(lakeName ?? "")} Trends`}
            data={lakeTemps ?? []}
            loading={loading}
            error={error}
            noDataMessage="Temperature data could nto be found. Please select a point within a Great Lake to see trends."
          />
        )}
      </div>
    </div>
  );
};

export default TrendsModal;
