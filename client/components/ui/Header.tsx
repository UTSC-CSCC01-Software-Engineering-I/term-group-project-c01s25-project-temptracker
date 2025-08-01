"use client";

import Link from "next/link";
import { useState } from "react";
import ProfileDropdown from "./ProfileDropdown";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "Upload" },
    { href: "/community", label: "Community" },
    { href: "/users", label: "Users" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="w-full bg-nav-blue border-b border-dark-blue sticky top-0 z-50">
      <div className="pt-1.25 pb-1 lg:py-1 sm:py-2 md:py-3 lg:px-12 px-4 flex items-center justify-between w-full">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-md transition hover:opacity-75 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMobileMenuOpen((o) => !o)}
        >
          <svg
            className="h-6 w-6 text-gray-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
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

        <div className="pr-2">
          <Link href="/">
            <img
              src="/glow.png"
              alt="GLOW Logo"
              className="h-10 md:h-12 w-auto"
            />
          </Link>
        </div>

        {/* Desktop nav */}
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

        <ProfileDropdown />
      </div>

      {/* Mobile nav menu */}
      {isMobileMenuOpen && (
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
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
