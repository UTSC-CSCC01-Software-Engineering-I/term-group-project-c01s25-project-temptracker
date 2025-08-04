"use client";
import React from "react";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Button } from "@/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { HiMagnifyingGlass, HiArrowPath } from "react-icons/hi2";

type ControlsProps = {
  searchLatitude: number | null;
  searchLongitude: number | null;
  timeRange: "week" | "today";
  setSearchLatitude: (val: number | null) => void;
  setSearchLongitude: (val: number | null) => void;
  setCenterLatitude: (val: number | null) => void;
  setCenterLongitude: (val: number | null) => void;
  setTimeRange: (val: "week" | "today") => void;
};

export default function Controls({
  searchLatitude,
  searchLongitude,
  timeRange,
  setSearchLatitude,
  setSearchLongitude,
  setCenterLatitude,
  setCenterLongitude,
  setTimeRange,
}: ControlsProps) {
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
    <div className="bg-white shadow-md rounded-lg max-w-[1000px] p-4 flex flex-col sm:flex-row items-center gap-4 flex-nowrap">
      {/* Lat/Long label + inputs */}
      <div className="w-full sm:w-auto">
        <Label
          htmlFor="latitude"
          className="font-semibold text-gray-700 block mb-2"
        >
          Latitude / Longitude
        </Label>
        <div className="flex gap-2">
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            placeholder="Enter lat"
            value={searchLatitude ?? ""}
            onChange={handleLatitude}
            className="sm:w-[130px]"
            aria-label="Latitude"
          />
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            placeholder="Enter long"
            value={searchLongitude ?? ""}
            onChange={handleLongitude}
            className="sm:w-[130px]"
            aria-label="Longitude"
          />
        </div>
      </div>

      {/* Vertical divider on desktop */}
      <div className="hidden sm:block border-l border-gray-300 h-10 mx-4 self-center" />

      {/* Buttons */}
      <div className="flex gap-3 w-full sm:w-auto flex-nowrap justify-center sm:justify-start">
        <Button
          variant="default"
          onClick={searchCoords}
          className="flex items-center gap-1 px-4 py-2 rounded-full whitespace-nowrap justify-center min-w-[110px]"
          aria-label="Search coordinates"
        >
          <HiMagnifyingGlass className="w-5 h-5" />
          Search
        </Button>

        <Button
          variant="outline"
          onClick={getCurrentLocation}
          className="flex items-center gap-1 px-2 py-2 rounded-full whitespace-nowrap justify-center min-w-[110px]"
          aria-label="Reset coordinates"
        >
          <HiArrowPath className="w-5 h-5" />
          Current Location
        </Button>
      </div>

      {/* Vertical divider on desktop */}
      <div className="hidden sm:block border-l border-gray-300 h-10 mx-4 self-center" />

      {/* Time Range Select */}
      <div className="flex items-center gap-2 w-full sm:w-auto min-w-[140px] justify-center sm:justify-start">
        <Label
          htmlFor="timeRange"
          className="whitespace-nowrap font-semibold text-gray-700"
        >
          Time Range
        </Label>
        <Select
          value={timeRange}
          onValueChange={(val) => setTimeRange(val as "week" | "today")}
        >
          <SelectTrigger
            id="timeRange"
            className="w-full sm:w-[140px] rounded-full py-1 px-3"
          >
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="today">Today</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
