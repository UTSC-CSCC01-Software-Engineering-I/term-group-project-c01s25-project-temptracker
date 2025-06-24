// change these later
const stats = [
  { label: "Total Water Bodies Covered", value: "30+" },
  { label: "Total Data Points Collected", value: "10,000+" },
  { label: "Confidence-Interval Verified User Data Submissions", value: "✓" },
  { label: "Cross-Checked Sites to Gather Archival Data", value: "10+" },
];

export default function About() {
  return (
    <main className="max-w-7xl mx-auto px-6 text-gray-900 dark:text-gray-100">
      <header className="mb-16 text-center max-w-3xl mx-auto motion-safe:animate-fadeIn">
        <h1 className="text-5xl font-extrabold mb-4">GLOW - Temperature Tracker</h1>
        <p className="text-xl leading-relaxed text-muted">
          Great Lakes Observation of Water Temperatures — your window into the
          dynamic thermal landscape of North America's freshwater giants.
        </p>
      </header>

      <section className="flex flex-col md:flex-row md:items-center md:gap-16 mb-20 max-w-5xl mx-auto motion-safe:animate-fadeIn">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <div className="bg-dark-blue rounded-lg h-64 md:h-80 w-full overflow-hidden shadow-lg">
            <img
              src="/great-lake.png"
              alt="Great Lakes"
              className="w-full h-full object-cover rounded-lg scale-100 hover:scale-105 transition-transform duration-500 ease-in-out"
            />
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

      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-20 motion-safe:animate-fadeIn">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col items-center transform hover:-translate-y-1 motion-safe:transition-all motion-safe:duration-300"
          >
            <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
              {value}
            </p>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 text-center">
              {label}
            </p>
          </div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto mb-20 motion-safe:animate-fadeIn">
        <h2 className="text-3xl font-semibold mb-10 text-center">
          GLOW Features
        </h2>
        <div className="grid gap-12 md:grid-cols-3">
          {[
            {
              icon: "🌡️",
              title: "Real-Time Data",
              desc: "Access data submitted by user readings to stay informed about local temperatures.",
            },
            {
              icon: "📊",
              title: "Compare Archives",
              desc: "Look through numerous ancestral data to compare current temperatures with historical records.",
            },
            {
              icon: "🌍",
              title: "Community Impact",
              desc: "Encourages the community to contribute with their own readings, chart their user submissions, and make a positive impact on local water bodies.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className="mb-5 py-4 text-blue-600 dark:text-blue-400 text-6xl">
                {icon}
              </div>
              <h3 className="text-xl text-nav-blue font-semibold mb-2">
                {title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
