"use client";
import React, { useState } from "react";
import "@/styles/Home.css";
import dynamic from "next/dynamic";
const LazyMap = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import POIs from "./POIs";

export default function Home() {
  const [searchLatitude, setSearchLatitude] = useState<number | null>(null);
  const [searchLongitude, setSearchLongitude] = useState<number | null>(null);
  const [centerLatitude, setCenterLatitude] = useState<number | null>(null);
  const [centerLongitude, setCenterLongitude] = useState<number | null>(null);

  const [timeRange, setTimeRange] = useState<"week" | "month">("week");

  const handleLatitude = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSearchLatitude(val);
  };

  const handleLongitude = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSearchLongitude(val);
  };

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
    <div className="main-container w-full max-w-[1800px] mx-auto md:mt-4">
      <div className="flex flex-col md:flex-row items-center justify-space-between md:px-12 gap-3">
        <div className="flex md:items-center gap-1 flex-col md:flex-row">
          <Label htmlFor="latitude" className="text-lg">
            Latitude
          </Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            name="latitude"
            value={searchLatitude ?? ""}
            onChange={handleLatitude}
          />
        </div>
        <div className="flex md:items-center gap-1 flex-col md:flex-row">
          <Label htmlFor="longitude" className="text-lg">
            Longitude
          </Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            name="longitude"
            value={searchLongitude ?? ""}
            onChange={handleLongitude}
          />
        </div>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors cursor-pointer w-full md:w-fit"
          onClick={searchCoords}
        >
          Search
        </button>
        
        <div className="space-y-4"> 
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors cursor-pointer w-full md:w-fit"
            onClick={getCurrentLocation}
          >
            Use My Location
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="timeRange">Time Range</Label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border rounded px-3 py-1"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>
      <div className="map-placeholder">
        <LazyMap
          centerLatitude={centerLatitude}
          centerLongitude={centerLongitude}
          timeRange={timeRange}
        />
      </div>
      <POIs />
    </div>
  );
}
