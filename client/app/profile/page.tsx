"use client";

import { createClient } from "../../lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient();

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
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
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.user_metadata?.username || "User"}
      </h1>

      {/* Profile Card with blue header */}
      <div className="rounded-lg shadow-md overflow-hidden mb-14">
        <div className="bg-nav-blue h-8"></div>
        <div className="flex items-center bg-white p-6 space-x-6">
          <img
            src={"profile.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold">
              {user?.user_metadata?.username || "Username"}
            </h2>
            <p className="text-gray-600">
              {user?.email || "email@example.com"}
            </p>
            <p className="text-sm text-gray-500">Signed in with {provider}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-3">My Submissions</h2>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-nav-blue text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Temp (°C)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Location (lat, long)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {submissions.map(
              ({ id, date, temperature, latitude, longitude, notes }) => (
                <tr key={id}>
                  <td className="px-6 py-4 whitespace-nowrap">{date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{temperature}</td>
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
    </div>
  );
}
