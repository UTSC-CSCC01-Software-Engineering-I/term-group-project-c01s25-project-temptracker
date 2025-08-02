"use client";

import Link from "next/link";
import { Github, Mail, FileText, Waves } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-nav-blue">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">GLOW</h3>
            </div>
            <p className="text-white/90 text-sm leading-relaxed max-w-xs">
              Great Lakes Observation of Water Temperatures — building a
              community to upload, track, and monitor local water temps across
              the Great Lakes region.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/about"
                className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
              >
                <span className="w-1 h-1 bg-white/40 rounded-full group-hover:bg-white transition-colors"></span>
                About Project
              </Link>
              <Link
                href="/upload"
                className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
              >
                <span className="w-1 h-1 bg-white/40 rounded-full group-hover:bg-white transition-colors"></span>
                Upload Data
              </Link>
              <Link
                href="/profile"
                className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
              >
                <span className="w-1 h-1 bg-white/40 rounded-full group-hover:bg-white transition-colors"></span>
                My Profile
              </Link>
            </nav>
          </div>

          {/* Contact & Resources */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
              Resources
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/contact"
                className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
              >
                <Mail className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                Contact Us
              </Link>
              <Link
                href="https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01s25-project-temptracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
              >
                <Github className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                GitHub Repository
              </Link>
              <Link
                href="/docs"
                className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
              >
                <FileText className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                Documentation
              </Link>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20"></div>

        {/* Bottom Section */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/70 text-xs text-center md:text-left">
            &copy; 2025 GLOW Project — Made in collaboration with{" "}
            <span className="text-white/90 font-medium">
              University of Toronto Scarborough
            </span>
          </div>

          <span className="text-white/90 text-xs">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
