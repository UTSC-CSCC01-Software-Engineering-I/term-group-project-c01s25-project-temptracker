"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-nav-blue text-white border-t border-dark-blue">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-left text-sm max-w-md">
          <h3 className="font-semibold mb-1">GLOW</h3>
          <p className="text-white leading-snug">
            Great Lakes Observation of Water Temperatures — building a community to upload, track, and monitor local water temps.
          </p>
        </div>

        {/* not implemented yet */}
        <nav className="flex space-x-6 text-sm font-medium"> 
          <Link href="/" className="hover:text-gray-100 transition">
            Contact
          </Link>
          <Link href="#" className="hover:text-gray-100 transition">
            GitHub
          </Link>
          <Link href="#" className="hover:text-gray-100 transition">
            Docs
          </Link>
        </nav>
      </div>

      <div className="border-t border-dark-blue mt-1">
        <div className="max-w-7xl mx-auto px-6 py-3 text-xs text-gray-800 text-center">
          &copy; 2025 — Made in collaboration with University of Toronto
        </div>
      </div>
    </footer>
  );
}
