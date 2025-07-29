"use client";

import UploadPhotoModal from "./UploadPhoto"; // adjust the path as needed
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const LOCATIONS = [
  "All",
  "Toronto",
  "Chicago",
  "New York",
  "Lake Erie",
  "Lake Ontario",
];
const TIME_RANGES = ["Last 72 hours", "Last Month", "All Time"];

export default function CommunityPage() {
  const [photos, setPhotos] = useState<string[]>([
    "/sample1.jpg",
    "/sample2.jpg",
    "/sample3.jpg",
    "/sample4.jpg",
    "/sample5.jpg",
  ]);

  const [location, setLocation] = useState("All");
  const [timeRange, setTimeRange] = useState("Last 72 hours");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...urls, ...prev]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 space-y-10">
      <h1 className="text-4xl font-bold text-dark-blue">
        Welcome to the Community (WIP)
      </h1>
      <p>
        Mark your place in the community by earning badges, contributing to the
        global leaderboard and uploading pictures of your Great Lakes
        adventures!
      </p>

      <Link
        href="/community/stats"
        className="block bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-gray-200 p-5 hover:bg-white/90 transition"
      >
        <div className="text-dark-blue font-semibold text-lg mb-1 flex items-center gap-2">
          🏆 View Leaderboard
        </div>
        <p className="text-sm text-gray-600">
          See top contributors and badges earned
        </p>
      </Link>
      <h2 className="text-3xl font-bold mt-16 text-dark-blue">
        {" "}
        GLOW Photo Gallery
      </h2>

      <div className="flex justify-center px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end max-w-xl w-full">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Time Range</label>
            <select
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {TIME_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Location</label>
            <select
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <UploadPhotoModal
            onUpload={({ file }) => {
              const url = URL.createObjectURL(file);
              setPhotos((prev) => [url, ...prev]);
            }}
          />
        </div>
      </div>

      {/* grid of photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((src, i) => (
          <div
            key={i}
            className="relative w-full h-40 rounded-xl overflow-hidden shadow-md hover:scale-[1.02] transition"
          >
            <Image
              src={src}
              alt={`Photo ${i + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
