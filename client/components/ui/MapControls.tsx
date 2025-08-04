import React, { useState } from "react";
import MapLegend from "./MapLegend";
import PointTrendPrompt from "./PointTrendPrompt";

type Props = {
  unit: "Celsius" | "Farenheit";
  setUnit: (u: "Celsius" | "Farenheit") => void;
  tempVisible: boolean;
  setTempVisible: (v: boolean) => void;
  heatVisible: boolean;
  setHeatVisible: (v: boolean) => void;
  clickedPoint: { latitude: number; longitude: number } | null;
  lakeClicked: string | null;
  onTrendPromptClick: () => void;
};

const MapControls = ({
  unit,
  setUnit,
  tempVisible,
  setTempVisible,
  heatVisible,
  setHeatVisible,
  clickedPoint,
  lakeClicked,
  onTrendPromptClick,
}: Props) => {
  const [showControls, setShowControls] = useState(true);

  if (!showControls) {
    // only show button to reveal controls
    return (
      <div className="absolute top-2 right-2 z-[1000] pointer-events-auto">
        <button
          className="w-full text-center bg-[#FFFFFFE6] hover:bg-[#FFFFFFCC] shadow text-[#333] md:text-base text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
          onClick={() => setShowControls(true)}
        >
          Show Panel
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-2 right-2 z-[1000] pointer-events-auto flex flex-col gap-1">
      {/* Hide controls button */}
      <button
        className="w-full text-center bg-[#FFFFFFE6] hover:bg-[#FFFFFFCC] shadow text-[#333] md:text-base text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
        onClick={() => setShowControls(false)}
      >
        Hide Panel
      </button>

      <div
        onClick={() => setUnit(unit === "Celsius" ? "Farenheit" : "Celsius")}
        className="w-full text-center bg-[#FFFFFFE6] hover:bg-[#FFFFFFCC] shadow text-[#333] md:text-base text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
      >
        {unit === "Celsius" ? "Units: °C" : "Units: °F"}
      </div>

      <button
        className="w-full text-center bg-[#FFFFFFE6] hover:bg-[#FFFFFFCC] shadow text-[#333] md:text-base text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
        onClick={() => {
          if (heatVisible) {
            setHeatVisible(false);
          } else if (!heatVisible) {
            setTempVisible(false);
            setHeatVisible(true);
          }
        }}
      >
        {`Activity: ${heatVisible ? "On" : "Off"}`}
      </button>

      <button
        className="w-full text-center bg-[#FFFFFFE6] hover:bg-[#FFFFFFCC] shadow text-[#333] md:text-base text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
        onClick={() => {
          if (tempVisible) {
            setTempVisible(false);
          } else if (!tempVisible) {
            setHeatVisible(false);
            setTempVisible(true);
          }
        }}
      >
        {`Heat: ${tempVisible ? "On" : "Off"}`}
      </button>

      {tempVisible && <MapLegend />}

      {clickedPoint?.latitude && clickedPoint?.longitude && lakeClicked && (
        <PointTrendPrompt onClick={onTrendPromptClick} />
      )}
    </div>
  );
};

export default MapControls;
