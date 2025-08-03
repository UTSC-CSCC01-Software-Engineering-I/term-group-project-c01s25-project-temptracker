import React, { useRef } from "react";
import { createWeekMarks, createTodayMarks } from "./dateUtils";
import Slider from "@mui/material/Slider";

interface SliderLayerProps {
  currentWeekday: number;
  timeRange: string;
  today: Date;
  currentHour: number;
  weekSliderChange: (event: Event, value: number) => void;
  hourSliderChange: (event: Event, value: number) => void;
}

export const SliderLayer: React.FC<SliderLayerProps> = ({ 
  currentWeekday, 
  timeRange, 
  today, 
  currentHour,
  weekSliderChange,
  hourSliderChange
}) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const weekTime = new Date(
      Date.now() - (7 - currentWeekday) * 24 * 60 * 60 * 1000
    );

    if (timeRange === "week") {
      const marks = createWeekMarks();
      // console.log("week marks", marks);
      return (
        <div
          ref={sliderRef}
          className="slider-container"
          style={{
            pointerEvents: "auto",
            zIndex: 1000,
          }}
        >
          <h2
            className="slider-title"
            style={{
              color: "white",
              textAlign: "center",
              marginBottom: "15px",
            }}
          >
            {`${weekTime.toLocaleString("en-US", {
              month: "long",
            })} ${weekTime.getDate()} ${weekTime.getFullYear()}`}
          </h2>
          <Slider
            onChange={weekSliderChange}
            value={currentWeekday}
            aria-label="Temperature"
            step={null}
            marks={marks}
            min={1}
            max={7}
            sx={{
              "& .MuiSlider-markLabel": {
                fontSize: "16px",
                color: "#fff",
                fontWeight: 600,
              },
              "& .MuiSlider-track": {
                backgroundColor: "#1976d2",
                height: 8,
                border: "none",
              },
              "& .MuiSlider-rail": {
                backgroundColor: "#e0e0e0",
                height: 8,
              },
              "& .MuiSlider-thumb": {
                "&:hover": {
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.4)",
                },
              },
            }}
          />
        </div>
      );
    } else if (timeRange === "today") {
      const marks = createTodayMarks();
      return (
        <div
          ref={sliderRef}
          className="slider-container"
          style={{
            pointerEvents: "auto",
            zIndex: 1000,
          }}
        >
          <h2
            className="slider-title"
            style={{
              color: "white",
              textAlign: "center",
              marginBottom: "15px",
            }}
          >
            {`${today.toLocaleString("en-US", {
              month: "long",
            })} ${today.getDate()} ${today.getFullYear()}`}
          </h2>
          <Slider
            onChange={hourSliderChange}
            value={currentHour / 4 + 1}
            aria-label="Temperature"
            step={null}
            marks={marks}
            min={1}
            max={6}
            sx={{
              "& .MuiSlider-markLabel": {
                fontSize: "16px",
                color: "#fff",
                fontWeight: 600,
              },
              "& .MuiSlider-track": {
                backgroundColor: "#1976d2",
                height: 8,
                border: "none",
              },
              "& .MuiSlider-rail": {
                backgroundColor: "#e0e0e0",
                height: 8,
              },
              "& .MuiSlider-thumb": {
                "&:hover": {
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.4)",
                },
              },
            }}
          />
        </div>
      );
    }
    return null;
  };