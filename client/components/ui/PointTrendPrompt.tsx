import React from "react";

// we pass in the fxn to render the trends
const PointTrendPrompt = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="z-[1000] bg-white p-3 shadow-md rounded-lg cursor-pointer"
    >
      <div className="text-center md:text-sm text-[#333] text-xs font-semibold">
        Analyze Selection
      </div>
    </div>
  );
};

export default PointTrendPrompt;
