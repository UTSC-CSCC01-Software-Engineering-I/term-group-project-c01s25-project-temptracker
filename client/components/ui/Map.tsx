"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "../../lib/supabase/client";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Marker, Popup, GeoJSON } from "react-leaflet";
import L, { Icon } from "leaflet";
import { getUserLocation } from "./GeoLocation";
import MapLegend from "./MapLegend";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import geoJsonTest from "../../data/earth-lakes-2km5-test.geo.json";
import Slider from "@mui/material/Slider";
import "../../styles/MapSlider.css";

import { GeoJsonObject } from "geojson";
import { string } from "zod/v4";
import { cookies } from "next/headers";
const supabase = createClient();

type MapProps = {
  centerLatitude: number | null;
  centerLongitude: number | null;
  timeRange: "all" | "week" | "month";
};
type TemperaturePoint = [number, number, number]; // [lat, lng, temperature]
type TimeTemperaturePoint = [number, number, number, string]; // [lat, lng, temperature, time]

const Map = (props: MapProps) => {
  const [userLocation, setUserLocation] = useState(() => {
    const userLocationData = localStorage.getItem("USER_LOCATION");
    return userLocationData
      ? JSON.parse(userLocationData)
      : { latitude: null, longitude: null };
  });

  const gTest = geoJsonTest as GeoJsonObject;

  const [tempVisible, setTempVisible] = useState(true);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [polygons, setPolygons] = useState<any[]>([]);
  const [gridsGenerated, setGridsGenerated] = useState(false);

  //Slider
  const [weekDataBucket, setWeekDataBucket] = useState<any[]>([]);
  const [monthDataBucket, setMonthDataBucket] = useState<any[]>([]);
  const [currentWeekday, setCurrentWeekday] = useState(7);
  const [currentMonthDate, setCurrentMonthDate] = useState(30);

  //click nearest point
  const [allBucketRaw, setAllBucketRaw] = useState<any[]>([]);
  const [weekBucketRaw, setWeekBucketRaw] = useState<any[]>([]);
  const [montthBucketRaw, setMonthBucketRaw] = useState<any[]>([]);
  const [unit, setUnit] = useState("Celsius");

  const generateGrids = () => {
    let grids = [];
    for (let i = 0; i < polygons.length; i++) {
      if (polygons[i].containsPoint) {
        const grid = generateGridInPolygon(polygons[i].coordinates, 0.1);
        grids.push({ grid: grid, polygon: polygons[i] });
      }
    }
    return grids;
  };

  const [tempData, setTempData] = useState<TemperaturePoint[]>(() => {
    const localData = localStorage.getItem("TEMP_DATA");
    return localData ? JSON.parse(localData) : [];
  });

  const [interpolatedTempData, setInterpolatedTempData] = useState<
    TemperaturePoint[]
  >(() => {
    const localInterData = localStorage.getItem("INTERPOLATED_TEMP_DATA");
    return localInterData ? JSON.parse(localInterData) : [];
  });

  const [rawTempData, setRawTempData] = useState(() => {
    const localRawData = localStorage.getItem("RAW_TEMP_DATA");
    return localRawData ? JSON.parse(localRawData) : [];
  });

  const [geoGrids, setGeoGrids] = useState(() => {
    const localGeoGrids = localStorage.getItem("GRID_DATA");
    return localGeoGrids ? JSON.parse(localGeoGrids) : [];
  });

  const [clickedPoint, setClickedPoint] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    nearestPoint: null as {
      latitude: number;
      longitude: number;
      temperature: number;
      distance: number;
      intensity: number;
    } | null,
  });

  const [mapCoords, setMapCoords] = useState(() => {
    if (props.centerLatitude != null && props.centerLongitude != null) {
      return {
        latitude: props.centerLatitude,
        longitude: props.centerLongitude,
      };
    } else {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
    }
  });

  // console.log('geo data',geoJson)
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        setGeoData(gTest);
        //geoJson is ordered [long, lat]
        const coordList = geoJsonTest.geometries[0].coordinates;
        const x = coordList.map((coord: any) => {
          let containspoint = false;
          for (let i = 0; i < tempData.length; i++) {
            const point = tempData[i];
            if (pointInPolygon([point[1], point[0]], coord[0])) {
              containspoint = true;
              break;
            }
          }
          return {
            coordinates: coord[0],
            containsPoint: containspoint,
          };
        });
        setPolygons(x);

        // const grids = generateGrids(); // This will now work with populated polygons
        // setGeoGrids(grids);
      } catch (error) {
        console.error("Error loading geo data:", error);
      }
    };

    loadGeoJSON();
  }, []);

  useEffect(() => {
    if (polygons.length > 0) {
      console.log("Generating grids from polygons...");
      const grids = generateGrids();
      setGeoGrids(grids);
    }
  }, [polygons]);

  useEffect(() => {
    localStorage.setItem("USER_LOCATION", JSON.stringify(userLocation));
  }, [userLocation]);

  useEffect(() => {
    localStorage.setItem("TEMP_DATA", JSON.stringify(tempData));
  }, [tempData]);

  useEffect(() => {
    localStorage.setItem(
      "INTERPOLATED_TEMP_DATA",
      JSON.stringify(interpolatedTempData)
    );
  }, [interpolatedTempData]);

  useEffect(() => {
    localStorage.setItem("RAW_TEMP_DATA", JSON.stringify(rawTempData));
  }, [rawTempData]);

  useEffect(() => {
    localStorage.setItem("GRID_DATA", JSON.stringify(geoGrids));
  }, [geoGrids]);

  useEffect(() => {
    const fetchUserLocation = async () => {
      const pos = await getUserLocation();
      setUserLocation(pos);
    };
    fetchUserLocation();
  }, []);

  const customIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [38, 38],
    iconAnchor: [12, 31],
    popupAnchor: [0, -41],
  });

  const tempConverter = (temp: number) => {
    //celcius
    if (temp <= 0) {
      return 0.0;
    } else if (temp <= 6.7) {
      return 0.2; //blue
    } else if (temp <= 10.55) {
      return 0.4; //green
    } else if (temp <= 15.6) {
      return 0.6; //yellow
    } else if (temp <= 19.5) {
      return 0.8; //orange
    } else if (temp <= 23.3) {
      return 0.9; //red
    } else {
      return 1.0; // dark red
    }
  };

  const toFarenheit = (temp: any) => {
    if (typeof temp === "number") {
      return temp * 1.8 + 32;
    }
  };

  const createWeekMarks = () => {
    const date = new Date(Date.now());
    let marks;
    const day = date.getDay();
    switch (day) {
      case 1:
        marks = [
          { value: 1, label: "Tue" },
          { value: 2, label: "Wed" },
          { value: 3, label: "Thu" },
          { value: 4, label: "Fri" },
          { value: 5, label: "Sat" },
          { value: 6, label: "Sun" },
          { value: 7, label: "Mon" },
        ];
        break;
      case 2:
        marks = [
          { value: 1, label: "Wed" },
          { value: 2, label: "Thu" },
          { value: 3, label: "Fri" },
          { value: 4, label: "Sat" },
          { value: 5, label: "Sun" },
          { value: 6, label: "Mon" },
          { value: 7, label: "Tue" },
        ];
        break;
      case 3:
        marks = [
          { value: 1, label: "Thu" },
          { value: 2, label: "Fri" },
          { value: 3, label: "Sat" },
          { value: 4, label: "Sun" },
          { value: 5, label: "Mon" },
          { value: 6, label: "Tue" },
          { value: 7, label: "Wed" },
        ];
        break;
      case 4:
        marks = [
          { value: 1, label: "Fri" },
          { value: 2, label: "Sat" },
          { value: 3, label: "Sun" },
          { value: 4, label: "Mon" },
          { value: 5, label: "Tue" },
          { value: 6, label: "Wed" },
          { value: 7, label: "Thu" },
        ];
        break;
      case 5:
        marks = [
          { value: 1, label: "Sat" },
          { value: 2, label: "Sun" },
          { value: 3, label: "Mon" },
          { value: 4, label: "Tue" },
          { value: 5, label: "Wed" },
          { value: 6, label: "Thu" },
          { value: 7, label: "Fri" },
        ];
        break;
      case 6:
        marks = [
          { value: 1, label: "Sun" },
          { value: 2, label: "Mon" },
          { value: 3, label: "Tue" },
          { value: 4, label: "Wed" },
          { value: 5, label: "Thu" },
          { value: 6, label: "Fri" },
          { value: 7, label: "Sat" },
        ];
        break;
      case 0:
        marks = [
          { value: 1, label: "Mon" },
          { value: 2, label: "Tue" },
          { value: 3, label: "Wed" },
          { value: 4, label: "Thu" },
          { value: 5, label: "Fri" },
          { value: 6, label: "Sat" },
          { value: 7, label: "Sun" },
        ];
        break;
    }
    return marks;
  };

  const createMonthMarks = () => {
    const days31 = [1, 3, 5, 7, 8, 10, 12];
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const currentDate = new Date(Date.now());
    const days30 = [4, 6, 9, 11];
    const days28 = [2];
    let daysFromThisMonth = [];
    for (let i = currentDate.getDate(); i > 0; i--) {
      daysFromThisMonth.push(i);
    }
    daysFromThisMonth.sort((a, b) => a - b);

    const daysRemaining = 30 - daysFromThisMonth.length;
    const previousMonth = fromDate.getMonth();

    //add remaining days based on which is the previous month
    let daysFromPrevMonth = [];
    if (days31.indexOf(previousMonth) > -1) {
      for (let i = 31; i > 31 - daysRemaining; i--) {
        daysFromPrevMonth.push(i);
      }
    } else if (days30.indexOf(previousMonth) > -1) {
      for (let i = 30; i > 30 - daysRemaining; i--) {
        daysFromPrevMonth.push(i);
      }
    } else {
      for (let i = 28; i > 28 - daysRemaining; i--) {
        daysFromPrevMonth.push(i);
      }
    }
    daysFromPrevMonth.sort((a, b) => a - b);

    const labels = [...daysFromPrevMonth, ...daysFromThisMonth].map((label) => {
      return label.toString();
    });

    //create marks

    const marks = labels.map((label, index) => {
      return { value: index + 1, label: label };
    });
    return marks;
  };

  const getNext7Days = () => {
    const dates = [];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
    }

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i + 1);

      // Format to YYYY-MM-DD
      const formattedDate = currentDate.toISOString().split("T")[0];
      dates.push(formattedDate);
    }

    const dict: { [key: string]: any } = {};
    for (let j = 0; j < dates.length; j++) {
      dict[dates[j]] = [];
    }

    console.log("week dict", dict);
    return dict;
  };

  const getNext30Days = () => {
    const dates = [];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Check if the date is valid
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
    }

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i + 1);

      // Format to YYYY-MM-DD
      const formattedDate = currentDate.toISOString().split("T")[0];
      dates.push(formattedDate);
    }

    const dict: { [key: string]: any } = {};
    for (let j = 0; j < dates.length; j++) {
      dict[dates[j]] = [];
    }

    console.log("month dict", dict);
    return dict;
  };

  //TODO - debug - case when less than 7 days of data
  const bucketWeek = (data: TimeTemperaturePoint[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      // Return array of 30 empty arrays instead of empty array
      return Array(7).fill([]);
    }
    console.log("sample data", data[0]);

    const wdict: { [key: string]: any } = getNext7Days();
    console.log("generated week dict", wdict);
    for (let i = 0; i < data.length; i++) {
      const day = data[i][3].slice(0, 10);
      console.log("day", day);
      if (day in wdict) {
        wdict[day].push(data[i]);
      }
      // else {
      //   wdict[day] = [data[i]]
      // }
    }

    var keys = Object.keys(wdict);
    keys.sort();
    let wArray = [];
    for (let i = 0; i < keys.length; i++) {
      wArray.push(wdict[keys[i]]);
    }

    return wArray;
  };
  //TODO - debug - case when less than 30 days of data
  const bucketMonth = (data: TimeTemperaturePoint[]) => {
    //July 3rd
    if (!data || !Array.isArray(data) || data.length === 0) {
      // Return array of 30 empty arrays instead of empty array
      return Array(30).fill([]);
    }
    const mdict: { [key: string]: any } = getNext30Days();
    for (let i = 0; i < data.length; i++) {
      const day = data[i][3].slice(0, 10);
      if (day in mdict) {
        mdict[day].push(data[i]);
      }
      // else {
      //   mdict[day] = [data[i]]
      // }
    }

    //turn dict into array and sort
    var keys = Object.keys(mdict);
    keys.sort();
    let mArray = [];
    for (let i = 0; i < keys.length; i++) {
      mArray.push(mdict[keys[i]]);
    }
    return mArray;
  };

  /////////////////////
  const getData = async (timeRange: "all" | "week" | "month") => {
    let fromDate: string | null = null;

    if (props.timeRange === "week") {
      fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (props.timeRange === "month") {
      fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    const query = supabase
      .from("temperatures")
      .select("latitude, longitude, temperature, measured_on");

    if (fromDate) {
      query.gte("measured_on", fromDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    console.log("Filtered data:", data);

    const heatData = data.map((point) => [
      point.latitude,
      point.longitude,
      point.temperature,
      // point.measured_on
    ]);

    const rawData = data.map((point) => [
      point.latitude,
      point.longitude,
      point.temperature,
      point.measured_on,
    ]);

    setRawTempData(rawData as TimeTemperaturePoint[]);
    setTempData(heatData as TemperaturePoint[]);
  };

  useEffect(() => {
    if (props.timeRange) {
      getData(props.timeRange);
    }
  }, [props.timeRange]);

  const weekSliderChange = (_event: Event, value: number) => {
    // const newValue = Array.isArray(value) ? value[0] : value;
    console.log("changed slider to", value);
    setCurrentWeekday(value);
  };

  const monthSliderChange = (_event: Event, value: number) => {
    // const newValue = Array.isArray(value) ? value[0] : value;
    console.log("changed slider to", value);
    setCurrentMonthDate(value);
  };

  // Updated SliderLayer component:
  const SliderLayer = () => {
    const sliderRef = useRef<HTMLDivElement>(null);

    // Prevent map interactions on slider container
    // useEffect(() => {
    //   const sliderElement = sliderRef.current;
    //   if (sliderElement) {
    //     const preventMapInteraction = (e: Event) => {
    //       e.stopPropagation();
    //     };

    //     // Add event listeners to prevent map interactions
    //     sliderElement.addEventListener('mousedown', preventMapInteraction);
    //     sliderElement.addEventListener('mousemove', preventMapInteraction);
    //     sliderElement.addEventListener('mouseup', preventMapInteraction);
    //     sliderElement.addEventListener('click', preventMapInteraction);
    //     sliderElement.addEventListener('wheel', preventMapInteraction);
    //     sliderElement.addEventListener('touchstart', preventMapInteraction);
    //     sliderElement.addEventListener('touchmove', preventMapInteraction);
    //     sliderElement.addEventListener('touchend', preventMapInteraction);

    //     return () => {
    //       sliderElement.removeEventListener('mousedown', preventMapInteraction);
    //       sliderElement.removeEventListener('mousemove', preventMapInteraction);
    //       sliderElement.removeEventListener('mouseup', preventMapInteraction);
    //       sliderElement.removeEventListener('click', preventMapInteraction);
    //       sliderElement.removeEventListener('wheel', preventMapInteraction);
    //       sliderElement.removeEventListener('touchstart', preventMapInteraction);
    //       sliderElement.removeEventListener('touchmove', preventMapInteraction);
    //       sliderElement.removeEventListener('touchend', preventMapInteraction);
    //     };
    //   }
    // }, []);

    const monthTime = new Date(
      Date.now() - (30 - currentMonthDate) * 24 * 60 * 60 * 1000
    );
    const weekTime = new Date(
      Date.now() - (7 - currentWeekday) * 24 * 60 * 60 * 1000
    );

    if (props.timeRange === "week") {
      const marks = createWeekMarks();
      console.log("week marks", marks);
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
    } else if (props.timeRange === "month") {
      const marks = createMonthMarks();
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
            {`${monthTime.toLocaleString("en-US", {
              month: "long",
            })} ${monthTime.getDate()} ${monthTime.getFullYear()}`}
          </h2>
          <Slider
            onChange={monthSliderChange}
            value={currentMonthDate}
            aria-label="Temperature"
            step={null}
            marks={marks}
            min={1}
            max={marks.length}
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

  const HeatmapLayer = ({
    data,
  }: {
    data: Array<[number, number, number]>;
  }) => {
    const map = useMap();

    useEffect(() => {
      if (!map || !data || data.length === 0) return;

      const validData = data.filter((point) => {
        const [lat, lng, intensity] = point;

        // Check if coordinates are valid numbers
        if (
          typeof lat !== "number" ||
          typeof lng !== "number" ||
          typeof intensity !== "number" ||
          isNaN(lat) ||
          isNaN(lng) ||
          isNaN(intensity)
        ) {
          console.warn("Invalid coordinates or intensity:", {
            lat,
            lng,
            intensity,
          });
          return false;
        }
        return true;
      });
      if (validData.length > 0) {
        const addHeatmap = () => {
          // console.log('valid data', validData)

          const heatLayer = (L as any).heatLayer(validData, {
            radius: 20,
            blur: 12,
            maxZoom: 6,
            max: 1.0,
            minOpacity: 0.5,
            gradient: {
              0.0: "#350273",
              0.2: "blue",
              0.4: "lime",
              0.6: "#FCED21",
              0.8: "#FF8001",
              0.9: "#E4080A",
              1.0: "#A40203",
            },
          });

          heatLayer.addTo(map);
          return heatLayer;
        };

        let heatLayer: any;

        if (map.getContainer()) {
          heatLayer = addHeatmap();
        } else {
          map.whenReady(() => {
            heatLayer = addHeatmap();
          });
        }

        return () => {
          if (heatLayer && map.hasLayer(heatLayer)) {
            map.removeLayer(heatLayer);
          }
        };
      }
    }, [map, data]);

    return null;
  };

  const findNearestTemperaturePoint = (
    clickLat: number,
    clickLng: number,
    timeRange: string,
    maxDistance: number = 0.5
  ) => {
    let nearest = null;
    let minDistance = Infinity;

    if (timeRange == "week") {
      weekBucketRaw[currentWeekday - 1].forEach(
        (point: [number, number, number]) => {
          const distance = Math.sqrt(
            Math.pow(point[0] - clickLat, 2) + Math.pow(point[1] - clickLng, 2)
          );
          if (distance < minDistance && distance <= 2 * maxDistance) {
            minDistance = distance;
            nearest = {
              temperature: point[2],
              latitude: point[0],
              longitude: point[1],
              distance: distance,
            };
          }
        }
      );
      console.log("Nearest point:", nearest);
    } else if (timeRange == "month") {
      montthBucketRaw[currentMonthDate - 1].forEach(
        (point: [number, number, number]) => {
          const distance = Math.sqrt(
            Math.pow(point[0] - clickLat, 2) + Math.pow(point[1] - clickLng, 2)
          );
          if (distance < minDistance && distance <= 2 * maxDistance) {
            minDistance = distance;
            nearest = {
              temperature: point[2],
              latitude: point[0],
              longitude: point[1],
              distance: distance,
            };
          }
        }
      );
      console.log("Nearest point:", nearest);
    } else {
      allBucketRaw.forEach((point: [number, number, number]) => {
        const distance = Math.sqrt(
          Math.pow(point[0] - clickLat, 2) + Math.pow(point[1] - clickLng, 2)
        );
        if (distance < minDistance && distance <= maxDistance) {
          minDistance = distance;
          nearest = {
            temperature: point[2],
            latitude: point[0],
            longitude: point[1],
            distance: distance,
          };
        }
      });
      console.log("Nearest point:", nearest);
    }

    // rawTempData.forEach((point: [number, number, number]) => {
    //   const distance = Math.sqrt(
    //     Math.pow(point[0] - clickLat, 2) + Math.pow(point[1] - clickLng, 2)
    //   );
    //   if (distance < minDistance && distance <= maxDistance) {
    //     minDistance = distance;
    //     nearest = {
    //       temperature: point[2],
    //       latitude: point[0],
    //       longitude: point[1],
    //       distance: distance,
    //     };
    //   }
    // });
    // console.log("Nearest point:", nearest);
    return nearest;
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        if (
          typeof lat !== "number" ||
          typeof lng !== "number" ||
          isNaN(lat) ||
          isNaN(lng)
        ) {
          console.warn("Invalid coordinates:", { lat, lng });
          return;
        }
        console.log("Map clicked at:", lat, lng);

        const nearestPoint = findNearestTemperaturePoint(
          lat,
          lng,
          props.timeRange
        );

        if (nearestPoint) {
          setClickedPoint({
            latitude: lat,
            longitude: lng,
            nearestPoint: nearestPoint,
          });
        } else {
          setClickedPoint({
            latitude: null,
            longitude: null,
            nearestPoint: null,
          });
        }
      },
    });
    return null;
  };

  //COLOR VISUALIAZATION
  const pointInPolygon = (point: number[], polygon: number[][]) => {
    const x = point[0]; //lng
    const y = point[1]; //lat
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  };

  const generateGridInPolygon = (polygon: any, gridSize = 0.1) => {
    const coords = polygon;

    // Find bounding box
    const lats = coords.map((coord: [number, number]) => coord[1]);
    const lngs = coords.map((coord: [number, number]) => coord[0]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const gridPoints: [number, number][] = [];

    // Generate grid points
    for (let lat = minLat; lat <= maxLat; lat += gridSize) {
      for (let lng = minLng; lng <= maxLng; lng += gridSize) {
        if (pointInPolygon([lng, lat], coords)) {
          gridPoints.push([lng, lat]);
        }
      }
    }

    return gridPoints;
  };

  const distance = (point1: [number, number], point2: [number, number]) => {
    const lat1 = point1[1];
    const lng1 = point1[0];
    const lat2 = point2[0];
    const lng2 = point2[1];
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
  };

  const interpolation = (polygon: any, tempPoints: any, point: any) => {
    let polygonPoints = [];
    const power = 2;
    for (let i = 0; i < tempPoints.length; i++) {
      const tempPoint = [tempPoints[i][1], tempPoints[i][0], tempPoints[i][2]]; // [lng, lat, temp]
      if (pointInPolygon([tempPoint[0], tempPoint[1]], polygon)) {
        polygonPoints.push(tempPoint);
      }
    }

    let weightedSum = 0;
    let weightSum = 0;

    for (let i = 0; i < polygonPoints.length; i++) {
      const dist = distance(point, [polygonPoints[i][0], polygonPoints[i][1]]);

      if (dist === 0) {
        const newPoint: TemperaturePoint = [
          point[1],
          point[0],
          polygonPoints[i][2],
        ];
        return newPoint;
      }

      const weight = 1 / Math.pow(dist, power);
      weightedSum += polygonPoints[i][2] * weight;
      weightSum += weight;
    }

    const interpolatedTemp = weightedSum / weightSum;

    // Return [latitude, longitude, converted_temp]
    const newPoint: TemperaturePoint = [point[1], point[0], interpolatedTemp];
    return newPoint;
  };

  //set the grids
  useEffect(() => {
    if (polygons.length > 0 && tempData.length > 0) {
      console.log("Generating grids...");

      if (props.timeRange == "week") {
        let weeklyPoints = [];
        let weeklyPointsRaw = [];
        const weekData = bucketWeek(rawTempData);
        console.log("week data", weekData);

        if (!weekData || !Array.isArray(weekData) || weekData.length < 7) {
          console.warn("weekData is invalid or insufficient:", weekData);
          setWeekDataBucket(Array(7).fill([]));
          return;
        }

        for (let k = 0; k < weekData.length; k++) {
          let allNewPoints: TemperaturePoint[] = [];
          //remove time from the data
          if (weekData[k].length == 0 || !Array.isArray(weekData[k])) {
            weeklyPoints.push([]); // Push empty array for this day
            continue;
          }

          const weekDataWithoutTime = weekData[k].map((d: any) => {
            return [d[0], d[1], d[2]];
          });

          for (let i = 0; i < geoGrids.length; i++) {
            for (let j = 0; j < geoGrids[i]["grid"].length; j++) {
              const point = geoGrids[i]["grid"][j];
              const tempPoint = interpolation(
                geoGrids[i]["polygon"].coordinates,
                [...weekDataWithoutTime, ...allNewPoints],
                point
              );
              allNewPoints.push(tempPoint);
            }
          }
          //TODO - account for including the existing specific week data
          const combine = [...weekDataWithoutTime, ...allNewPoints].map(
            (point) => {
              return [point[0], point[1], tempConverter(point[2])];
            }
          );
          const combineRaw = [...weekDataWithoutTime, ...allNewPoints];
          weeklyPoints.push(combine);
          weeklyPointsRaw.push(combineRaw);
        }
        //set state
        setWeekDataBucket(weeklyPoints);
        setWeekBucketRaw(weeklyPointsRaw);
      } else if (props.timeRange == "month") {
        let monthlyPoints = [];
        let monthlyPointsRaw = [];
        const monthData = bucketMonth(rawTempData);

        if (!monthData || !Array.isArray(monthData) || monthData.length < 30) {
          console.warn("weekData is invalid or insufficient:", monthData);
          setWeekDataBucket(Array(30).fill([]));
          return;
        }

        for (let k = 0; k < monthData.length; k++) {
          let allNewPoints: TemperaturePoint[] = [];

          if (monthData[k].length == 0 || !Array.isArray(monthData[k])) {
            monthlyPoints.push([]); // Push empty array for this day
            continue;
          }
          //remove time from the data
          const monthDataWithoutTime = monthData[k].map((d: any) => {
            return [d[0], d[1], d[2]];
          });
          for (let i = 0; i < geoGrids.length; i++) {
            for (let j = 0; j < geoGrids[i]["grid"].length; j++) {
              const point = geoGrids[i]["grid"][j];
              const tempPoint = interpolation(
                geoGrids[i]["polygon"].coordinates,
                [...monthDataWithoutTime, ...allNewPoints],
                point
              );
              allNewPoints.push(tempPoint);
            }
          }
          //TODO - account for including the existing specific month data
          const combine = [...monthDataWithoutTime, ...allNewPoints].map(
            (point) => {
              return [point[0], point[1], tempConverter(point[2])];
            }
          );
          const combineRaw = [...monthDataWithoutTime, ...allNewPoints];
          monthlyPoints.push(combine);
          monthlyPointsRaw.push(combineRaw);
        }
        //set State
        setMonthDataBucket(monthlyPoints);
        setMonthBucketRaw(monthlyPointsRaw);
        // console.log('MONTH BUCKET AFTER INTERPOLATION', monthlyPoints)
      } else {
        let allNewPoints: TemperaturePoint[] = [];

        for (let i = 0; i < geoGrids.length; i++) {
          for (let j = 0; j < geoGrids[i]["grid"].length; j++) {
            const point = geoGrids[i]["grid"][j];
            const tempPoint = interpolation(
              geoGrids[i]["polygon"].coordinates,
              [...tempData, ...allNewPoints],
              point
            );
            allNewPoints.push(tempPoint);
          }
        }

        if (allNewPoints.length > 0) {
          // console.log('new interpolated', allNewPoints)
          const join: TemperaturePoint[] = [...tempData, ...allNewPoints].map(
            (point) => {
              // console.log('Temperature before conversion:', point[2]); // Add this line
              return [point[0], point[1], tempConverter(point[2])];
            }
          );
          const joinRaw: TemperaturePoint[] = [...tempData, ...allNewPoints];

          setInterpolatedTempData(join);
          setAllBucketRaw(joinRaw);
        }
      }
    }
  }, [polygons, tempData, gridsGenerated, props.timeRange]);

  //RENDER
  // console.log('Total temp data points', interpolatedTempData.length)
  // console.log('weekbucket', weekDataBucket)
  console.log("monthBucket after interpolation", monthDataBucket);
  if (
    mapCoords.latitude &&
    mapCoords.longitude &&
    geoGrids.length > 0 &&
    !loading
  ) {
    return (
      <MapContainer
        key={`${mapCoords.latitude},${mapCoords.longitude}`}
        center={[mapCoords.latitude, mapCoords.longitude]}
        zoom={13}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapClickHandler />
        {tempVisible &&
          props.timeRange == "all" &&
          interpolatedTempData.length > 0 && (
            <HeatmapLayer data={interpolatedTempData} />
          )}
        {tempVisible &&
          props.timeRange == "week" &&
          weekDataBucket.length > 0 &&
          weekDataBucket[currentWeekday - 1].length > 0 && (
            <HeatmapLayer data={weekDataBucket[currentWeekday - 1]} />
          )}
        {tempVisible &&
          props.timeRange == "month" &&
          monthDataBucket.length > 0 &&
          monthDataBucket[currentMonthDate - 1].length > 0 && (
            <HeatmapLayer data={monthDataBucket[currentMonthDate - 1]} />
          )}

        {tempVisible && (
          <GeoJSON
            data={gTest}
            style={{
              color: "#00ff00",
              weight: 0.8,
              fillOpacity: 0,
            }}
          />
        )}
        {/* <Marker position={[40.115211, 47.739075]} icon={customIcon}/> */}
        {clickedPoint.latitude && clickedPoint.longitude && (
          <Marker
            position={[clickedPoint.latitude, clickedPoint.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div>
                <strong>Temperature:</strong>{" "}
                {unit == "Celsius"
                  ? `${clickedPoint.nearestPoint?.temperature} °C`
                  : `${toFarenheit(clickedPoint.nearestPoint?.temperature)} °F`}
                <br />
              </div>
            </Popup>
          </Marker>
        )}

        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <div className="md:max-w-165px max-w-135px flex flex-col items-center justify-center gap-2 mb-2">
            <div
              onClick={() => {
                if (unit == "Celsius") {
                  setUnit("Farenheit");
                } else {
                  setUnit("Celsius");
                }
              }}
              className="w-full text-center bg-[#FFFFFFE6] hover:bg-[#FFFFFFCC] shadow text-[#333] md:text-base text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
            >
              {unit == "Celsius" ? "Toggle Units: °C" : "Toggle Units: °F"}
            </div>
            <button
              className="w-full text-center bg-[#FFFFFFE6] hover:bg-[#FFFFFFCC] shadow text-[#333] md:text-base text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
              onClick={() => setTempVisible(!tempVisible)}
            >
              Toggle Temperature
            </button>
          </div>
          {tempVisible && <MapLegend />}
        </div>

        <div
          style={{
            position: "absolute",
            zIndex: 1000,
            pointerEvents: "auto",
            bottom: "0px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "auto",
          }}
        >
          <SliderLayer />
        </div>
      </MapContainer>
    );
  } else {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
};

export default Map;
