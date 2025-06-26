"use client";

import { createClient } from "../../lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { set } from "date-fns";
import { useEffect, useState } from "react";

const supabase = createClient();

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [useFahrenheit, setUseFahrenheit] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    setRole("admin"); // add logic later

    return () => listener?.subscription.unsubscribe();
  }, []);

  const provider = user?.app_metadata?.provider || "email";

  const submissions = [
    {
      id: 1,
      date: "2025-06-25",
      temperature: 22.5,
      latitude: 43.7,
      longitude: -79.4,
      notes: "Sunny day",
    },
    {
      id: 2,
      date: "2025-06-24",
      temperature: 18.3,
      latitude: 43.8,
      longitude: -79.3,
      notes: "Cloudy",
    },
    {
      id: 3,
      date: "2025-06-23",
      temperature: 20.1,
      latitude: 43.6,
      longitude: -79.5,
      notes: "Mild breeze",
    },
    {
      id: 4,
      date: "2025-06-22",
      temperature: 25.0,
      latitude: 43.9,
      longitude: -79.2,
      notes: "Hot and humid",
    },
    {
      id: 5,
      date: "2025-06-21",
      temperature: 16.4,
      latitude: 43.65,
      longitude: -79.45,
      notes: "Light rain",
    },
  ];

  // download as csv
  const handleExportCSV = () => {
    const headers = ["Date", "Temperature", "Latitude", "Longitude", "Notes"];
    const rows = submissions.map((s) => [
      s.date,
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

      <div className="rounded-lg shadow-md overflow-hidden mb-14 lg:mb-20">
        <div className="bg-nav-blue h-8 flex items-center justify-end px-4">
          {role === "admin" && (
            <span className="text-xs font-medium text-white px-2 py-1 rounded">
              Admin Account
            </span>
          )}
        </div>

        <div className="flex items-center bg-white p-6 space-x-6">
          <img
            src={"profile.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold text-dark-blue">
              {user?.user_metadata?.username || "Username"}
            </h2>
            <p className="text-gray-600">
              {user?.email || "email@example.com"}
            </p>
            <p className="text-sm text-gray-500">Signed in with {provider}</p>
          </div>
        </div>
      </div>

      {/* on desktop, the buttons are on the top */}
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
            {submissions.map(
              ({ id, date, temperature, latitude, longitude, notes }) => (
                <tr
                  key={id}
                  className="hover:bg-blue-100 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{date}</td>
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

      {/* on mobile, buttons are on the bottom */}
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
