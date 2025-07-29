"use client";

import Image from "next/image";
import type { Photo } from "@/lib/services/photoRetrievalService";
import { Button } from "@/components/shadcn/button";
import { useState } from "react";
import { useUser } from "@/app/context";
import { likePhoto, unlikePhoto } from "@/lib/services/photoLikeService";

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
}

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const [liked, setLiked] = useState(photo.likedByCurrentUser ?? false);
  console.log(liked);
  const [likeCount, setLikeCount] = useState(photo.likes);
  const { user } = useUser();

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
          <div className="my-2 text-xs text-gray-600 flex gap-8 items-center">
            <div>
              <strong>ID:</strong> {photo.id}
            </div>
            <div>
              <strong>Lake:</strong> {photo.location}
            </div>
          </div>
          <div className="relative">
            <Button
              onClick={async () => {
                if (!user) return;

                setLiked((prev) => !prev);
                setLikeCount((count) => count + (liked ? -1 : 1));

                try {
                  if (!liked) {
                    await likePhoto(photo.id, user.id);
                  } else {
                    await unlikePhoto(photo.id, user.id);
                  }
                } catch (err) {
                  // rollback UI if the request fails
                  setLiked((prev) => !prev);
                  setLikeCount((count) => count + (liked ? 1 : -1));
                }
              }}
              className={`flex items-center gap-2 absolute bottom-0 right-0 mb-2 mr-2 shadow-lg transition-colors ${
                liked ? "bg-pink-600 hover:bg-pink-700" : ""
              }`}
            >
              <span className="text-white font-medium">
                {likeCount} {likeCount === 1 ? "Like" : "Likes"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
