"use client";

import Image from "next/image";
import type { Photo } from "@/lib/services/photoRetrievalService";

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
}

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  return (
    <div
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md shadow-lg max-w-2xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-96 bg-gray-300">
          <Image
            src={photo.url}
            alt={photo.title || "Photo"}
            fill
            style={{ objectFit: "contain" }}
            priority
          />
          <button
            className="absolute top-4 right-6 text-gray-700 text-4xl font-bold hover:opacity-80 transition cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="px-3 py-2 text-gray-900 text-sm">
          <h2 className="text-lg p-0 font-semibold truncate">
            {photo.title || "Untitled"}
          </h2>
          <p className="italic underline">
            {photo.caption || "No caption available"}
          </p>
          <div className="mt-2 text-xs text-gray-600 flex gap-8">
            <div>
              <strong>Likes:</strong> {photo.likes}
            </div>
            <div>
              <strong>ID:</strong> {photo.id}
            </div>
            {/* <div>
              <strong>User:</strong> {photo.user_id}
            </div> */}
            <div>
              <strong>Lake:</strong> {photo.location}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
