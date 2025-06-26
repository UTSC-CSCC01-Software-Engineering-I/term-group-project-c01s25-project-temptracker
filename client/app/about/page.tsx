"use client";

import { useEffect, useState } from "react";

const stats = [
  { label: "Total Water Bodies Covered", value: "30+", icon: "🌊" },
  { label: "Total Data Points Collected", value: "10,000+", icon: "📊" },
  {
    label: "Confidence-Interval Verified User Data Submissions",
    value: "✓",
    icon: "✅",
  },
  {
    label: "Cross-Checked Sites to Gather Archival Data",
    value: "10+",
    icon: "🔍",
  },
];

const features = [
  {
    icon: "🌡️",
    title: "Real-Time Data",
    desc: "Access data submitted by user readings to stay informed about local temperatures.",
    gradient: "from-blue-500/40 to-cyan-500/40",
  },
  {
    icon: "📊",
    title: "Compare Archives",
    desc: "Look through numerous ancestral data to compare current temperatures with historical records.",
    gradient: "from-purple-500/40 to-pink-500/40",
  },
  {
    icon: "🌍",
    title: "Community Impact",
    desc: "Encourages the community to contribute with their own readings, chart their user submissions, and make a positive impact on local water bodies.",
    gradient: "from-green-500/40 to-emerald-500/40",
  },
];

export default function About() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-6 text-gray-900 dark:text-gray-100">
      <header className="mb-16 text-center max-w-3xl mx-auto transition-all duration-1000 group">
        <h1
          className="text-5xl font-extrabold mb-4 bg-[length:200%_200%] text-dark-blue bg-clip-text relative inline-block 
    after:block after:h-1.5 after:bg-nav-blue after:w-0 group-hover:after:w-full 
  after:transition-all after:duration-500 after:mt-2"
        >
          GLOW - Temperature Tracker
        </h1>
        <p className="text-xl leading-relaxed text-muted ">
          Great Lakes Observation of Water Temperatures — your window into the
          dynamic thermal landscape of North America's freshwater giants.
        </p>
      </header>

      <section
        className={`flex flex-col md:flex-row md:items-center md:gap-16 mb-20 max-w-5xl mx-auto transition-all duration-1000 delay-300 ${
          isVisible ? "animate-fade-in-up" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="md:w-1/2 mb-10 md:mb-0">
          <div className="group relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-dark-blue rounded-lg h-64 md:h-80 w-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
              <img
                src="/great-lake.png"
                alt="Great Lakes"
                className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-500 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl font-semibold mb-6">Our Intuition</h2>
          <p className="text-lg leading-relaxed text-muted">
            Beach goers, boaters, fishermen, recreationalists and residents
            alike rely on the water provided by the Great Lakes and surrounding
            waterways. With overall changes to climate and large variability in
            day-to-day temperatures, GLOW provides users with up-to-date,
            reliable and accessible water temperature data. With our navigation
            tools, interface and sourced data, use GLOW to be informed of the
            water in your area.
          </p>
        </div>
      </section>

      <section
        className={`max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-20 transition-all duration-1000 delay-500 ${
          isVisible ? "animate-scale-in" : "opacity-0 scale-95"
        }`}
      >
        {stats.map(({ label, value, icon }, index) => (
          <div
            key={label}
            className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 p-8 flex flex-col items-center transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 ${
              isVisible ? "animate-scale-in" : "opacity-0"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div
                className="text-4xl mb-4 animate-floating"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {icon}
              </div>
              <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                {value}
              </p>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 text-center">
                {label}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section
        className={`max-w-5xl mx-auto mb-20 transition-all duration-1000 delay-700 ${
          isVisible ? "animate-fade-in-up" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-center mb-10 mt-2">
          <h2 className="text-3xl font-semibold">Platform Features</h2>
        </div>
        <div className="grid gap-12 md:grid-cols-3">
          {features.map(({ icon, title, desc, gradient }, index) => (
            <div
              key={title}
              className={`group relative bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 text-center border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 ${
                isVisible ? "animate-scale-in" : "opacity-0 scale-95"
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div
                className={`absolute -inset-px bg-gradient-to-r ${gradient} rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>
              <div className="relative">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 mt-2 rounded-2xl bg-gradient-to-r ${gradient} mb-5 text-6xl text-white group-hover:scale-110 transition-transform duration-300`}
                >
                  {icon}
                </div>
                <h3 className="text-xl text-nav-blue font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
