import { ChartLine } from "lucide-react";

interface ProfileStatsProps {
  stats?: {
    upload_count: number;
    curr_streak: number;
    max_streak: number;
    total_readings: number;
    avg_temp: number | null;
  };
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  if (!stats) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <ChartLine className="w-6 h-6" />
          Statistics
        </h2>
        <p className="text-gray-500">No statistics available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <ChartLine className="w-6 h-6" />
        Statistics
      </h2>
      <div className="bg-white shadow-md rounded-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-nav-blue">
            {stats.upload_count}
          </p>
          <p className="text-sm text-gray-600">Total Uploads</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {stats.curr_streak}
          </p>
          <p className="text-sm text-gray-600">Current Streak</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">
            {stats.max_streak}
          </p>
          <p className="text-sm text-gray-600">Best Streak</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">
            {stats.avg_temp ? `${stats.avg_temp.toFixed(1)}°C` : "N/A"}
          </p>
          <p className="text-sm text-gray-600">Avg Temp</p>
        </div>
      </div>
    </div>
  );
}
