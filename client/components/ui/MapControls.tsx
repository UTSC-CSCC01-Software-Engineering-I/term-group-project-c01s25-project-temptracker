import React from "react";
import MapLegend from "./MapLegend";
import PointTrendPrompt from "./PointTrendPrompt";

type Props = {
  unit: "Celsius" | "Farenheit";
  setUnit: (u: "Celsius" | "Farenheit") => void;
  tempVisible: boolean;
  setTempVisible: (v: boolean) => void;
  clickedPoint: { latitude: number; longitude: number } | null;
  onTrendPromptClick: () => void;
};

const MapControls = ({
  unit,
  setUnit,
  tempVisible,
  setTempVisible,
  clickedPoint,
  onTrendPromptClick,
}: Props) => {
  return (
    <div className="absolute top-2 right-2 z-[1000] pointer-events-auto flex flex-col gap-1">
      <div
        onClick={() => setUnit(unit === "Celsius" ? "Farenheit" : "Celsius")}
        className="w-full text-center bg-[#FFFFFFE6] hover:bg-[#FFFFFFCC] shadow text-[#333] md:text-base text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
      >
        {unit === "Celsius" ? "Units: °C" : "Units: °F"}
      </div>

      <button
        className="w-full text-center bg-[#FFFFFFE6] hover:bg-[#FFFFFFCC] shadow text-[#333] md:text-base text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
        onClick={() => setTempVisible(!tempVisible)}
      >
        Toggle Map
      </button>

      {tempVisible && <MapLegend />}

      {clickedPoint?.latitude && clickedPoint?.longitude && (
        <PointTrendPrompt onClick={onTrendPromptClick} />
      )}
    </div>
  );
};

export default MapControls;
