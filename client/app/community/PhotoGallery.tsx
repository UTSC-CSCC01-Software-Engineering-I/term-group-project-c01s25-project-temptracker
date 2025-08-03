"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import UploadPhotoModal from "./UploadPhotoModal";
import PhotoModal from "./PhotoModal";
import { onUpload } from "@/lib/supabase/api/photo_gallery/photoUploadService";
import { useUser } from "@/app/context";
import {
  getPhotos,
  TimeRange,
  Location,
} from "@/lib/supabase/api/photo_gallery/photoRetrievalService";
import type { Photo } from "@/lib/supabase/api/photo_gallery/photoRetrievalService";

const LOCATIONS: Location[] = [
  "All",
  "Lake Ontario",
  "Lake Erie",
  "Lake Michigan",
  "Lake Superior",
  "Lake Huron",
];

const TIME_RANGES: TimeRange[] = ["Last 72 hours", "Last Month", "All Time"];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function PhotoGallery() {
  const { user, profile } = useUser();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [location, setLocation] = useState<Location>("All");
  const [timeRange, setTimeRange] = useState<TimeRange>("Last 72 hours");
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  function handleLikeChange(id: number, liked: boolean, likes: number) {
    setPhotos((photos) =>
      photos.map((p) =>
        p.id === id ? { ...p, likedByCurrentUser: liked, likes } : p
      )
    );
    // also update selectedPhoto if it’s the current one:
    setSelectedPhoto((photo) =>
      photo && photo.id === id
        ? { ...photo, likedByCurrentUser: liked, likes }
        : photo
    );
  }

  useEffect(() => {
    async function loadPhotos() {
      setLoading(true);
      // we need to wait a bit to get the user context (its also technically async)
      try {
        await sleep(200); // wait 200ms
        const result = await getPhotos({
          location,
          timeRange,
          userId: user?.id,
        });
        setPhotos(result);
      } catch {
        toast.error("Failed to load photos.");
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    }

    loadPhotos();
  }, [location, timeRange, user]);

  async function handleUpload(data: {
    file: File;
    location: Location;
    title: string;
    caption: string;
  }) {
    if (!user?.id || !profile) {
      toast.error("You must be logged in to upload a photo");
      return;
    }
    await onUpload({ ...data, role: profile.role, userId: user.id });
  }

  return (
    <>
      <div className="flex justify-center px-4">
        <div className="flex flex-wrap gap-4 items-end justify-center max-w-xl w-full">
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

          {/* Only show upload modal if user is signed in, otherwise render a placeholder to keep grid layout */}
          {/* @ts-ignore */}
          {user ? <UploadPhotoModal onUpload={handleUpload} /> : <div />}

          {selectedPhoto && (
            <PhotoModal
              photo={selectedPhoto}
              onClose={() => setSelectedPhoto(null)}
              onLikeChange={handleLikeChange}
            />
          )}
        </div>
      </div>

      <div className="my-6">
        {loading ? (
          <p className="text-center text-gray-500 mb-8">Loading photos...</p>
        ) : photos.length === 0 ? (
          <p className="text-center text-gray-500 mb-8">
            Sorry, we couldn't find any photos:(
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className="relative w-full h-40 rounded-xl overflow-hidden shadow-md hover:scale-[1.02] transition flex flex-col cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative flex-grow">
                  <Image
                    src={photo.url}
                    alt={photo.title || `Photo ${i + 1}`}
                    fill
                    className="object-cover rounded-t-xl"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="bg-nav-blue bg-opacity-0 px-2 py-1 rounded-b-xl flex justify-between items-center select-none">
                  <p className="text-sm font-semibold text-white truncate">
                    {photo.title}
                  </p>
                  <p className="text-xs text-gray-200">❤️ {photo.likes}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onLikeChange={handleLikeChange}
        />
      )}
    </>
  );
}
