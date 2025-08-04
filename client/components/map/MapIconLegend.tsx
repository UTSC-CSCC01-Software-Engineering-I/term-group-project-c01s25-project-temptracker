import React, { useState } from "react";
import poiIcon from "../../public/poi_icon.png"
import userIcon from "../../public/circle.png"

type IconDataType = {
    [key: string]: {
        src: string;
        alt: string;
        title: string;
    };
};

const IconLegend = () => {
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Sample data - replace with your actual icons and descriptions
    const iconData: IconDataType = {
        "1": {    
            src: "/poi_icon.png",
            alt: "POI",
            title: "Point of Interest",
            },
        "2": {
            src: "/circle.png",
            alt: "User upload",
            title: "User upload",
        }
    }

    const handleMouseEnter = (iconId: string, event: React.MouseEvent<HTMLDivElement>) => {
        setHoveredIcon(iconId);
        const rect = event.currentTarget.getBoundingClientRect();
        setMousePosition({
        x: rect.right + 16, // 16px gap from the icon
        y: rect.top
        });
    };

    const handleMouseLeave = () => {
        setHoveredIcon(null);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (hoveredIcon) {
        const rect = event.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: rect.right + 16,
            y: rect.top
        });
        }
    };

    return (
        <div className="relative">
        <div className="flex flex-col justify-center items-center gap-3 w-7 md:w-10 h-auto bg-[#FFFFFFE6] hover:bg-[#FFFFFFCC] shadow rounded-lg px-2 py-2">
            {Object.entries(iconData).map(([key, data]) => {
                return (
                    <div style={{ cursor: 'poiner' }}
                    onMouseEnter={(e) => handleMouseEnter(key, e)}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    key={key}>
                        <div className="flex items-center justify-center rounded-lg w-3 md:w-6 h-3 md:h-6">
                            <img className="w-full h-full object-contain" src={data.src} alt={data.alt}></img>
                        </div>

                    </div>
                )
            })

            }

        </div>

        {hoveredIcon && (
            <div className="fixed flex items-center justify-center bg-white text-black p-1 md:p-2 rounded-lg shadow-xl border border-gray-700 max-w-xs z-50 pointer-events-none"
                style={{
                    left: `${mousePosition.x}px`,
                    top: `${mousePosition.y}px`,
                    transform: 'translateY(-25%)'
                }}>
                    <p>{iconData[hoveredIcon.toString()].title}</p>

            </div>
        )}

        </div>

        
    )
}

export default IconLegend