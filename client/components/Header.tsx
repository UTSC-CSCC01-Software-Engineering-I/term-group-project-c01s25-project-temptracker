"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/archive", label: "Archive" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-nav-blue border-b border-dark-blue sticky top-0 z-50">
      <div className="pt-1.25 pb-0.75 sm:py-2 md:py-3 lg:px-12 px-4 flex items-center justify-between w-full">
        <button
          className="md:hidden p-2 rounded-md transition hover:opacity-75 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          aria-label="Toggle navigation menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="h-6 w-6 text-gray-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        <h1 className="text-2xl px-3 italic font-bold text-gray-900 tracking-wide select-none">
          GLOW - Temp Tracker
        </h1>

        {/* desktop nav links */}
        <nav
          className="hidden md:flex flex-grow justify-end md:mr-8 lg:mr-18"
          aria-label="Primary Navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-dark-blue hover:text-gray-800 transition font-medium whitespace-nowrap md:px-3 lg:px-4 text-lg"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* profile - replace with an actual icon*/}
        <Link
          href="/login"
          className="p-1.75 mr-0.75 rounded-full bg-gray-200 hover:bg-gray-300 border border-gray-600 transition ml-auto md:ml-0"
          aria-label="Profile or login"
        >
          <Image
            src="/profile.png"
            alt="Profile"
            width={20}
            height={20}
            className="h-6 w-6"
          />
        </Link>
      </div>

      {/* mobile nav menu*/}
      {isOpen && (
        <nav
          className="flex md:hidden overflow-x-auto justify-center px-1 pb-1 no-scrollbar"
          aria-label="Mobile Navigation"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-dark-blue hover:text-gray-800 transition font-medium whitespace-nowrap flex-shrink-0 px-3"
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
