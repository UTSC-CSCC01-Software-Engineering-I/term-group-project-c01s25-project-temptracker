"use client";

import "@/styles/Home.css";
import Map from '../components/Map'; // Assuming you have a Map component

const sampleLocations = [
  { id: 1, name: "Location A", temperature: "22°C" },
  { id: 2, name: "Location B", temperature: "19°C" },
  { id: 3, name: "Location C", temperature: "25°C" },
];

export default function Home() {
  return (
    <>
      <main className="main-container">
        <div className="map-placeholder">
          <Map />
        </div>

        <section className="locations-section">
          <h2>Points of Interest</h2>
          <div className="locations-list">
            {sampleLocations.map(({ id, name, temperature }) => (
              <div key={id} className="location-card">
                <span>{name}</span>
                <span>{temperature}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
