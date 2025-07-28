"use client";

import { format, parseISO } from "date-fns";
import { useUser } from "@/app/context";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminEmailForm from "@/components/ui/emailForm";

const supabase = createClient();
const ITEMS_PER_PAGE = 20;

export default function Profile() {
  const { user, profile } = useUser();
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filteredDate, setFilteredDate] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const provider = user?.app_metadata?.provider || "email";

  const userSince = user?.email_confirmed_at
    ? format(new Date(user.email_confirmed_at), "MMMM d, yyyy")
    : "Unknown";

  const uniqueDates = [
    "All",
    ...Array.from(
      new Set(submissions.map((s) => format(new Date(s.measured_on), "yyyy-MM-dd")))
    ),
  ];

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.id || !profile?.role) return;

      const query =
        profile.role === "admin"
          ? supabase.from("temperatures").select("*").order("measured_on", { ascending: false })
          : supabase
            .from("temperatures")
            .select("*")
            .eq("user_id", user.id)
            .order("measured_on", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching submissions:", error);
      } else {
        setSubmissions(data);
      }
    };

    fetchSubmissions();
  }, [user?.id, profile?.role]);

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

  const handleToggleVerified = async (id: number, current: boolean) => {
    const { error } = await supabase
      .from("temperatures")
      .update({ is_verified: !current })
      .eq("id", id);

    if (error) {
      console.error("Error toggling verified:", error);
    } else {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, is_verified: !current } : s
        )
      );
    }
  };

  const filteredSubmissions =
    filteredDate === "All"
      ? submissions
      : submissions.filter(
        (s) => format(new Date(s.measured_on), "yyyy-MM-dd") === filteredDate
      );

  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.user_metadata?.username || "Admin"}
      </h1>

      {/* User Info */}
      <div className="rounded-lg shadow-md overflow-hidden mb-14 lg:mb-20">
        <div className="bg-nav-blue h-8 flex items-center justify-end px-4">
          <span className="text-xs font-medium text-white px-2 py-1 rounded capitalize">
            {profile?.role} Account
          </span>
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
            <p className="text-gray-600">{user?.email || "email@example.com"}</p>
            <p className="text-sm text-gray-500 mt-1">Signed in with {provider}</p>
            <p className="text-sm text-gray-500">User since {userSince}</p>
          </div>
        </div>
      </div>

      {/* Top Controls */}
      {profile?.role === "admin" && (
        <div className="mb-8">
  <h2 className="text-2xl font-semibold mb-4 text-left">Send Email to Users</h2>
  <AdminEmailForm />
</div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold">My Submissions</h2>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filteredDate === "All" ? "" : filteredDate}
              onChange={(e) => {
                setFilteredDate(e.target.value || "All");
                setCurrentPage(1);
              }}
              className="border border-gray-300 px-2 py-1 rounded"
            />
            {filteredDate !== "All" && (
              <button
                onClick={() => {
                  setFilteredDate("All");
                  setCurrentPage(1);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
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

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto lg:mb-20">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-nav-blue text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Temp ({useFahrenheit ? "°F" : "°C"})</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Location (lat, long)</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Notes</th>
              {profile?.role === "admin" && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Verified</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {paginatedSubmissions.map(
              ({ id, measured_on, temperature, latitude, longitude, notes, is_verified }) => (
                <tr key={id} className="hover:bg-blue-100 transition-colors">
                  <td className="px-6 py-4">{format(parseISO(measured_on), "yyyy-MM-dd")}</td>
                  <td className="px-6 py-4">
                    {useFahrenheit ? ((temperature * 9) / 5 + 32).toFixed(1) : temperature.toFixed(1)}
                  </td>
                  <td className="px-6 py-4">{latitude.toFixed(2)}, {longitude.toFixed(2)}</td>
                  <td className="px-6 py-4">{notes}</td>
                  {profile?.role === "admin" && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleVerified(id, is_verified)}
                        className={`px-3 py-1 text-sm rounded ${is_verified ? "bg-red-500" : "bg-green-500"
                          } text-white hover:opacity-90`}
                      >
                        {is_verified ? "Unverify" : "Verify"}
                      </button>
                    </td>
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
