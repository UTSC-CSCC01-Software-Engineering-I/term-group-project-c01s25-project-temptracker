import React, { useEffect, useState } from "react";
import {
  getClosestVerifiedTemps,
  getAverageClosestTemperature,
  TemperaturePoint,
} from "@/lib/services/tempByCoordinatesService";
import {
  getChartData,
  ChartPoint
} from "@/lib/services/getTemperatureReadingService"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { lakeCodeConvert } from "../map/graphUtils";

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
  const [lakeTemps, setLakeTemps] = useState<ChartPoint[] | null>(null)
  const [lakeName, setLakeName] = useState<string | null>(null)
  const [avgTemp, setAvgTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState< "local" | "lake">("local")

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setLoading(true);
      setError(null);
      console.log('Lake passing to service: ',lake)
      Promise.all([
        getClosestVerifiedTemps(latitude, longitude, 10, "30 days"),
        getAverageClosestTemperature(latitude, longitude),
        getChartData(lake),
      ])
        .then(([temps, avg, lake_points]) => {
          setClosestTemps(temps);
          setAvgTemp(avg);
          setLakeTemps(lake_points.data)
          if (lake_points.data) {
            setLakeName(lake)
          }
        })
        .catch((error) => {
          console.error('Error in modal: ', error)
          setError("Failed to load trend data");
        })
        .finally(() => setLoading(false));
  
    }
    
  }, [latitude, longitude, lake]);



  const chartData = closestTemps
    ? [...closestTemps]
        .sort(
          (a, b) =>
            new Date(a.measured_on).getTime() -
            new Date(b.measured_on).getTime()
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
  console.log('trend data:', chartData)
  console.log('lake chart data:', lakeTemps)
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
        <div className="flex items-center justify-center w-full gap-0.5">
          <button className="bg-white rounded-md p-4 md:p-8 font-semibold text-xl text-gray-600 hover:text-gray-900"
        onClick={(e) => {
          e.stopPropagation()
          setView("local")
          }}>
          Local
          </button>
          <button className="bg-white rounded-md p-4 md:p-8 font-semibold text-xl text-gray-600 hover:text-gray-900"
        onClick={(e) => {
          e.stopPropagation()
          setView("lake")
          }}>
          Lake
          </button>
        </div>
{/*--------------------------------------------------------------------------------------------*/}
        {view == "local" && (<div className="flex items-center justify-center flex-col">
        <h2 className="text-lg font-semibold mb-1">Selected Location Trends</h2>
        <p className="text-sm text-gray-500 mb-4">
          Coordinates: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
        </p>

        {loading && (
          <p className="text-center text-gray-500 mb-4">
            Loading trend data...
          </p>
        )}
        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        {!loading && !error && (
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

            {chartData.length > 0 ? (
              <div className="w-full h-40 md:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#ccc" }}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      unit="°C"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#ccc" }}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(value: any) => [`${value} °C`, "Temp"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No temperature data available.
              </p>
            )}
          </>
        )}
      </div>)}

      {view == "lake" && (<div className="flex items-center justify-center flex-col">
        {!lakeName || lakeTemps == null && (
          <p className="text-center text-gray-500">
                No temperature data available.
              </p>
        )}

        {loading && (
          <p className="text-center text-gray-500 mb-4">
            Loading lake data...
          </p>
        )}
        {/* {error && <p className="text-center text-red-600 mb-4">{error}</p>} */}

        {!loading && !error && lakeName != null && (
          <>
            {/* <div className="flex flex-wrap md:flex-nowrap gap-2 mb-4 justify-center">
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
            </div> */}
            <h2 className="text-lg font-semibold mb-1">{lakeCodeConvert(lakeName)} Trends</h2>
            {lakeTemps !== null && lakeTemps.length > 0 ? (
              <div className="w-full h-40 md:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lakeTemps}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#ccc" }}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      unit="°C"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#ccc" }}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(value: any) => [`${value} °C`, "Temp"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No temperature data available.
              </p>
            )}
          </>
        )}
      </div>)}
      </div>
      {/*--------------------------------------------------------------------------------------- */}
    </div>
  );
};

export default TrendsModal;
