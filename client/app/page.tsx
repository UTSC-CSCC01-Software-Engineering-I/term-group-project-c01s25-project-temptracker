"use client";
import React, { useState } from 'react';
import "@/styles/Home.css";
import dynamic from "next/dynamic";
const LazyMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const sampleLocations = [
  { id: 1, name: "Location A", temperature: "22°C" },
  { id: 2, name: "Location B", temperature: "19°C" },
  { id: 3, name: "Location C", temperature: "25°C" },
];

export default function Home() {
  const [searchLatitude, setSearchLatitude] = useState<number | null>(null);
  const [searchLongitude, setSearchLongitude] = useState<number | null>(null);
  const [centerLatitude, setCenterLatitude] = useState<number | null>(null);
  const [centerLongitude, setCenterLongitude] = useState<number | null>(null);

  const handleLatitude = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
        setSearchLatitude(val)
    }

  const handleLongitude = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
      setSearchLongitude(val)
  }

  const searchCoords = () => {
    setCenterLatitude(searchLatitude);
    setCenterLongitude(searchLongitude);
    console.log(`Searching for coordinates: ${searchLatitude}, ${searchLongitude}`);
  }

  return (
    <>
      <main className="main-container w-full">
        <div className='w-full flex flex-col items-center justify-center mt-4 mb-1'>
            <div className=' h-12 flex items-center justify-space-between px-12 gap-3 text-card-blue'>
              <div className='flex items-center gap-1'>
                  <label className='text-lg text-foreground'>Latitude</label>
                  <input id='latitude' name='latitude' type='number' step="0.000001" className='border focus:outline-none border-gray-300 bg-white rounded-sm max-w-md w-full text-black' onChange={handleLatitude} />
              </div>
              <div className='flex items-center gap-1'>
                <label className='text-lg text-foreground'>Longitude</label>
                <input id='longitude' name='longitude' type='number' step="0.000001" className='border focus:outline-none border-gray-300 bg-white rounded-sm max-w-md w-full text-black' onChange={handleLongitude} />
              </div>

              <button className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors cursor-pointer' onClick={searchCoords}>Search</button>
            </div>
            <div className="map-placeholder">
              <LazyMap centerLatitude={centerLatitude} centerLongitude={centerLongitude}/>
            </div>
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
