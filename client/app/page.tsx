"use client";
import React, { useState } from "react";
import "@/styles/Home.css";
import dynamic from "next/dynamic";
const LazyMap = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
import POIs from "./POIs";
import Controls from "./TopControls";
import { UnitsProvider } from "./unitsContext";

export default function Home() {
  const [searchLatitude, setSearchLatitude] = useState<number | null>(null);
  const [searchLongitude, setSearchLongitude] = useState<number | null>(null);
  const [centerLatitude, setCenterLatitude] = useState<number | null>(null);
  const [centerLongitude, setCenterLongitude] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "today">("today");

  const searchCoords = () => {
    setCenterLatitude(searchLatitude);
    setCenterLongitude(searchLongitude);
    console.log(
      `Searching for coordinates: ${searchLatitude}, ${searchLongitude}`
    );
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setSearchLatitude(lat);
        setSearchLongitude(lng);
        setCenterLatitude(lat);
        setCenterLongitude(lng);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location.");
      }
    );
  };

  return (
    <UnitsProvider>
      <div className="main-container w-full max-w-[1800px] mx-auto md:mt-4">
        <Controls
          searchLatitude={searchLatitude}
          searchLongitude={searchLongitude}
          setSearchLatitude={setSearchLatitude}
          setSearchLongitude={setSearchLongitude}
          setCenterLatitude={setCenterLatitude}
          setCenterLongitude={setCenterLongitude}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />

        <div className="map-placeholder">
          <LazyMap
            key={
              centerLatitude != null && centerLongitude != null
                ? `${centerLatitude}-${centerLongitude}`
                : "null"
            }
            centerLatitude={centerLatitude}
            centerLongitude={centerLongitude}
            timeRange={timeRange}
          />
        </div>
        <POIs />
      </div>
    </UnitsProvider>
  );
}
