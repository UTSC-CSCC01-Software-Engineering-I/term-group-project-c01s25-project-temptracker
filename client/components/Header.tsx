"use client";

import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/archive", label: "Archive" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  return (
    <header className="w-full bg-navblue border-b border-darkblue sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-2 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-evenly w-full md:w-auto ">
          <h1 className="text-2xl italic font-bold text-gray-900 tracking-wide select-none my-1 md:mb-0">
            GLOW - Temp Tracker
          </h1>
          <button
            className="ml-2 rounded-full bg-gray-700 hover:bg-gray-200 p-1 transition"
            aria-label="Profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            ></svg>
          </button>
        </div>
        <nav
          aria-label="Primary Navigation"
          className="flex justify-center pt-1 space-x-8 overflow-x-auto no-scrollbar max-w-full"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex-shrink-0 text-darkblue hover:text-gray-800 transition font-medium whitespace-nowrap"
              tabIndex={0}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
