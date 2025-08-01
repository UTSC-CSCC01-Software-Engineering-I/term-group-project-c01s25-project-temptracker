import { Thermometer } from "lucide-react";
import { format } from "date-fns";

interface ProfileActivityProps {
  recentUploads?: Array<{
    id: string;
    temperature: number;
    latitude: number;
    longitude: number;
    measured_on: string;
  }>;
}

export default function ProfileActivity({
  recentUploads,
}: ProfileActivityProps) {
  if (!recentUploads || recentUploads.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Thermometer className="w-6 h-6" />
          Recent Temperature Submissions
        </h2>
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <p className="text-gray-500">No recent submissions to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Thermometer className="w-6 h-6" />
        Recent Temperature Submissions
      </h2>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-nav-blue text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Temperature (°C)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Latitude
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Longitude
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {recentUploads.map((upload) => (
              <tr
                key={upload.id}
                className="hover:bg-blue-100 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(upload.measured_on), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {upload.temperature.toFixed(1)}°C
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {upload.latitude}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {upload.longitude}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {recentUploads.length >= 5 && (
          <div className="px-6 py-3 bg-gray-50 text-center">
            <p className="text-sm text-gray-500">
              Showing last {recentUploads.length} submissions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
