import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TempChartProps = {
  title: string;
  data: { date: string; temperature: number }[];
  loading: boolean;
  error: string | null;
  noDataMessage: string;
};

const TempChart: React.FC<TempChartProps> = ({
  title,
  data,
  loading,
  error,
  noDataMessage,
}) => {
  if (loading) {
    return <p className="text-center text-gray-500 mb-4">Loading trend data...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 mb-4">{error}</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">{noDataMessage}</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <div className="w-full h-40 md:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
    </div>
  );
};

export default TempChart;
