import React from "react";

const PointTrendPrompt = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="z-[1000] bg-white p-3 shadow-md rounded-lg">
      <div className="text-center md:text-sm text-[#333] text-xs cursor-pointer font-semibold">
        Analyze Selection
      </div>
    </div>
  );
};

export default PointTrendPrompt;
