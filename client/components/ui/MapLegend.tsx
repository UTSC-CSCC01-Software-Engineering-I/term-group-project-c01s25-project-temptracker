import React from 'react';
import '../../styles/MapLegend.css'; // Assuming you have a CSS file for styling the legend
interface LegendProps {
  minTemp: number;
  maxTemp: number;
  unit?: string;
}

const MapLegend = () => {
  const legendItems = [
    { color: '#A40203', label: `>23.3°C / >74°F`, tempRange: '>23.3' },
    { color: '#E4080A', label: `19.5-23.3°C / 67-74°F`, tempRange: '19.5-23.3' },
    { color: '#FF8001', label: `15.6-19.5°C / 60-67°F`, tempRange: '15.6-19.5' },
    { color: '#FCED21', label: `10.6-15.6°C / 51-60°F`, tempRange: '10.6-15.6' },
    { color: 'lime', label: `6.7-10.6°C / 44-51°F`, tempRange: '6.7-10.6' },
    { color: 'blue', label: `0-6.7°C / 32-44°F`, tempRange: '0-6.7' },
    { color: '#350273', label: `<0°C / <32°F`, tempRange: '<0' },
  ];

  return (
    <div className='legend'>
      <div className='legend-title'>
        Temperature
      </div>
      <div className='legend-items'>
        {legendItems.map((item, index) => (
          <div key={index} className='legend-item'>
            <div 
              className='legend-color-box'
              style={{ backgroundColor: item.color }}
            ></div>
            <span className='legend-label'>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;