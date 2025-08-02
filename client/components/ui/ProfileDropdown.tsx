"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/app/context";
import { UserRound, Settings, LogOut, Shield, Sun, Moon } from "lucide-react";

type LinkItem = { href: string; label: string };

export default function ProfileDropdown() {
  const { user, profile, logout } = useUser();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/"; // need to do it manually as router.refresh() doesn't trigger a full reload
  };
  useEffect(() => {
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
    setOpen(false);
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

  const universalLinks: LinkItem[] = [{ href: "/settings", label: "Settings" }];

  // if user is not logged in show login link instead of dropdown
  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 px-4 py-2 font-medium"
      >
        <UserRound className="w-4 h-4" />
        Login
      </Link>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        type="button"
        className="flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden ring-2 ring-white/30">
          {profile?.profile_picture_url ? (
            <Image
              src={profile.profile_picture_url}
              alt="Profile picture"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserRound className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {user && (
          <div className="hidden sm:flex flex-col items-start min-w-0">
            <span className="text-sm font-medium text-dark-blue max-w-24 truncate lg:max-w-none">
              {profile?.username || "User"}
            </span>
            {profile?.role === "admin" && (
              <span className="text-xs text-dark-blue/70">Administrator</span>
            )}
          </div>
        )}

        <svg
          className={`w-4 h-4 text-dark-blue transition-transform duration-200 ${
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
        className={`absolute right-0 w-64 rounded-xl rounded-t-none bg-nav-blue/85 backdrop-blur-lg shadow-xl ring-1 ring-nav-blue z-50 origin-top-right transform transition-all duration-200 ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        {/* User info header */}
        {user && (
          <div className="px-4 pt-3 pb-0 ">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dark-blue truncate">
                  {profile?.username || "User"}
                </p>
                <p className="text-xs text-dark-blue/70 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="py-2">
          {/* Navigation Links */}
          <div className="space-y-1 px-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-dark-blue rounded-lg hover:bg-white/20 hover:text-dark-blue transition-colors duration-150"
              onClick={() => setOpen(false)}
            >
              <UserRound className="w-4 h-4" />
              Profile
            </Link>

            {universalLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-dark-blue rounded-lg hover:bg-white/20 hover:text-dark-blue transition-colors duration-150"
                onClick={() => setOpen(false)}
              >
                <Settings className="w-4 h-4" />
                {label}
              </Link>
            ))}

            {/* Admin-only link */}
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-dark-blue rounded-lg hover:bg-white/20 hover:text-dark-blue transition-colors duration-150"
                onClick={() => setOpen(false)}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-dark-blue rounded-lg hover:bg-white/20 hover:text-dark-blue transition-colors duration-150 cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          {/* Bottom divider */}
          <div className="my-2 border-t border-dark-blue/20"></div>

          {/* Logout at bottom */}
          <div className="px-2">
            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-dark-blue rounded-lg hover:bg-white/20 hover:text-dark-blue transition-colors duration-150"
              type="button"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
