"use client";

import UploadPhotoModal from "./UploadPhotoModal";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { onUpload } from "@/lib/services/photoUploadService";
import { useUser } from "@/app/context";
import { toast } from "sonner";
import {
  getPhotos,
  TimeRange,
  Location,
} from "@/lib/services/photoRetrievalService";

const LOCATIONS: Location[] = [
  "All",
  "Toronto",
  "Chicago",
  "New York",
  "Lake Erie",
  "Lake Ontario",
];

const TIME_RANGES: TimeRange[] = ["Last 72 hours", "Last Month", "All Time"];

export default function CommunityPage() {
  const { user } = useUser();

  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<Location>("All");
  const [timeRange, setTimeRange] = useState<TimeRange>("Last 72 hours");

  useEffect(() => {
    async function loadPhotos() {
      try {
        const result = await getPhotos({ location, timeRange });
        const urls = result.map((p) => p.url);
        setPhotos(urls);
      } catch (e) {
        toast.error("Failed to load photos.");
      }
    }

    loadPhotos();
  }, [location, timeRange]);

  async function handleUpload(data: {
    file: File;
    location: Location;
    title: string;
    caption: string;
  }) {
    if (!user?.id) {
      toast.error("You must be logged in to upload a photo");
      return;
    }
    await onUpload({ ...data, userId: user.id });
  }

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
        GLOW Photo Gallery
      </h2>

      <div className="flex justify-center px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end max-w-xl w-full">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Time Range</label>
            <select
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
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
              onChange={(e) => setLocation(e.target.value as Location)}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          {/* @ts-ignore */}
          <UploadPhotoModal onUpload={handleUpload} />
        </div>
      </div>

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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
