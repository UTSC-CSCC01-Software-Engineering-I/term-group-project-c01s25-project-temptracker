"use client";

import { format } from "date-fns";
import { useUser } from "@/app/context";
import { useState } from "react";
import { useUserSubmissions } from "@/hooks/useUserSubmissions";
import Image from "next/image";
import ProfileStats from "./ProfileStats";

export default function Profile() {
  const { user, profile } = useUser();
  const { submissions, loading } = useUserSubmissions(user?.id);
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const provider = user?.app_metadata?.provider || "email";
  const userSince = user?.email_confirmed_at
    ? format(new Date(user.email_confirmed_at), "MMMM d, yyyy")
    : "Unknown";

  const handleExportCSV = () => {
    const headers = ["Date", "Temperature", "Latitude", "Longitude", "Notes"];
    const rows = submissions.map((s) => [
      s.measured_on,
      useFahrenheit ? (s.temperature * 9) / 5 + 32 : s.temperature,
      s.latitude,
      s.longitude,
      s.notes,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(String).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "submissions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleUnits = () => setUseFahrenheit((prev) => !prev);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.user_metadata?.username || "User"}
      </h1>

      <div className="rounded-lg shadow-md overflow-hidden">
        <div className="bg-nav-blue h-8 flex items-center justify-end px-4">
          <span className="text-xs font-medium text-white px-2 py-1 rounded">
            {profile?.role === "admin" ? "Admin " : "Personal "} Account
          </span>
        </div>

        <div className="flex items-center bg-white p-6 space-x-6">
          <Image
            src={"/profile.png"}
            alt="Profile"
            height={80}
            width={80}
            className="rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold text-dark-blue text-left">
              {user?.user_metadata?.username || "Username"}
            </h2>
            <p className="text-gray-600">
              {user?.email || "email@example.com"}
            </p>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Signed in with <span className="capitalize">{provider}</span>
              </p>
              <p className="text-sm text-gray-500">User since {userSince}</p>
            </div>
          </div>
        </div>
      </div>

      <ProfileStats />

      <div className="hidden sm:flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold">My Submissions</h2>
        <div className="flex gap-4">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-nav-blue text-white text-sm rounded hover:opacity-90"
          >
            Export CSV
          </button>
          <button
            onClick={toggleUnits}
            className="px-4 py-2 border border-nav-blue text-nav-blue rounded text-sm hover:bg-nav-blue hover:text-white transition"
          >
            {useFahrenheit ? "Show °C" : "Show °F"}
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-3 sm:hidden">My Submissions</h2>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto lg:mb-20">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-nav-blue text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Temp ({useFahrenheit ? "°F" : "°C"})
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Location (lat, long)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {(loading && (
              <tr>
                <td className="p-4">Loading...</td>
              </tr>
            )) ||
              submissions.map(
                ({
                  id,
                  measured_on,
                  temperature,
                  latitude,
                  longitude,
                  notes,
                }) => (
                  <tr
                    key={id}
                    className="hover:bg-blue-100 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {measured_on
                        ? format(new Date(measured_on), "yyyy-MM-dd")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {useFahrenheit
                        ? ((temperature * 9) / 5 + 32).toFixed(1)
                        : temperature.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {latitude.toFixed(2)}, {longitude.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{notes}</td>
                  </tr>
                )
              )}
          </tbody>
        </table>
      </div>

      <div className="flex sm:hidden justify-center gap-4 mt-2">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-nav-blue text-white text-sm rounded hover:opacity-90"
        >
          Export CSV
        </button>
        <button
          onClick={toggleUnits}
          className="px-4 py-2 border border-nav-blue text-nav-blue text-sm rounded hover:bg-nav-blue hover:text-white transition"
        >
          {useFahrenheit ? "Show °C" : "Show °F"}
        </button>
      </div>
    </div>
  );
}
