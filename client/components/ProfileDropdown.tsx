"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

export default function ProfileDropdown({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect initial theme
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
    setOpen(false); // close dropdown after toggling
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // links
  const universalLinks = [{ href: "/settings", label: "Settings" }];

  const authLinks = user
    ? [{ label: "Logout", action: onLogout }]
    : [{ href: "/login", label: "Login/Register" }];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        type="button"
        className="flex items-center md:gap-x-2 gap-x-0.5 cursor-pointer justify-center p-1.5 rounded-full transition border-2 border-black focus:outline-none focus:ring-1 focus:ring-nav-blue focus:ring-offset-0"
      >
        <Image
          src="/profile.png"
          alt="Profile"
          width={22}
          height={22}
          className="rounded-full shadow-md"
        />
        <svg
          className={`w-4 h-4 text-black transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`absolute right-0 mt-3 w-56 rounded-xl bg-white bg-opacity-80 backdrop-blur-md shadow-2xl ring-1 ring-dark-blue ring-opacity-50 z-50 origin-top-right transform transition-all duration-300 ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="py-2 flex flex-col">
          {authLinks.map((link) =>
            "href" in link ? (
              <Link
                key={link.label}
                href={link.href}
                className="block px-5 py-1.5 text-gray-800 font-semibold rounded-lg hover:bg-main-blue hover:text-dark-blue transition"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={() => {
                  link.action();
                  setOpen(false);
                }}
                className="w-full text-left px-5 py-1.5 text-gray-800 font-semibold rounded-lg hover:bg-main-blue hover:text-dark-blue transition"
                type="button"
              >
                {link.label}
              </button>
            )
          )}

          {universalLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="block px-5 py-1.5 text-gray-800 font-semibold rounded-lg hover:bg-main-blue hover:text-dark-blue transition"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}

          {/* Theme toggle link at bottom */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full text-left px-5 py-1.5 text-gray-800 font-semibold rounded-lg hover:bg-main-blue hover:text-dark-blue transition"
          >
            Change Theme
          </button>
        </div>
      </div>
    </div>
  );
}
