"use client";

import Link from "next/link";
import PhotoGallery from "./PhotoGallery";

export default function CommunityPage() {
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

      <Link
        href="/users"
        className="block bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-gray-200 p-5 hover:bg-white/90 transition"
      >
        <div className="text-dark-blue font-semibold text-lg mb-1 flex items-center gap-2">
          👥 Browse Community Members
        </div>
        <p className="text-sm text-gray-600">
          Discover other GLOW contributors and view their profiles
        </p>
      </Link>

      <h2 className="text-3xl font-bold mt-16 text-dark-blue">
        GLOW Photo Gallery
      </h2>
      <p className="px-8">
        The photo gallery is a developmental feature allowing users to submit
        shots of their greatest lake adventures. Note that due to file sizes, we
        only permit users uploading a photo every week. Have fun exploring
        others&apos; adventures, and sign-up to upload your own!
      </p>
      <PhotoGallery />
    </div>
  );
}
