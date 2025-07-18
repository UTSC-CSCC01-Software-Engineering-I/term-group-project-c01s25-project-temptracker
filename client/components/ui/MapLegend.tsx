import React from 'react';
import '../../styles/MapLegend.css'; // Assuming you have a CSS file for styling the legend


const MapLegend = () => {
  const legendItems = [
    { color: '#8B0000', label: `30°C / 86°F` },
    { color: '#FF4500', label: `25.7°C / 78.3°F` },
    { color: '#FFA500', label: `21.4°C / 70.5°F` },
    { color: '#ADFF2F', label: `17.1°C / 62.8°F` },
    { color: '#00FA9A', label: `12.9°C / 55.2°F` },
    { color: '#00CED1', label: `8.6°C / 47.5°F` },
    { color: '#0000FF', label: `4.3°C / 39.7°F` },
    { color: '#8B00FF', label: `0°C / 32°F` },
  ];

  return (
    <div className='legend'>
      <div className='legend-title'>
        Water Temp
      </div>
      <div className='flex flex-row items-center gap-4 h-full justify-center'>
        <div className='temp-gradient'>

        </div>

        <div className='legend-items'>
        {legendItems.map((item, index) => (
          <div key={index} className='legend-item'>
            {/* <div 
              className='legend-color-box'
              style={{ backgroundColor: item.color }}
            ></div> */}
            <span className='legend-label'>{item.label}</span>
          </div>
        ))}
      </div>
      </div>
      
    </div>
  );
};

export default MapLegend;