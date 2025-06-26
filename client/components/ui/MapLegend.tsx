import React from 'react';
import '../../styles/MapLegend.css'; // Assuming you have a CSS file for styling the legend


const MapLegend = () => {
  const legendItems = [
    { color: '#A40203', label: `29°C / 85°F`, tempRange: '29' },
    { color: '#E4080A', label: `23.3°C / 74°F`, tempRange: '23.3' },
    { color: '#FF8001', label: `19.5°C / 67°F`, tempRange: '19.5-23.3' },
    { color: '#FCED21', label: `15.6°C / 60°F`, tempRange: '15.6-19.5' },
    { color: 'lime', label: `10.6°C / 51°F`, tempRange: '10.6-15.6' },
    { color: 'blue', label: `6.7°C / 44°F`, tempRange: '6.7-10.6' },
    { color: '#350273', label: `0°C / 32°F`, tempRange: '0-6.7' },
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