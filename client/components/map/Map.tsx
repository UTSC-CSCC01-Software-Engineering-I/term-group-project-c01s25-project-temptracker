"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "../../lib/supabase/client";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Marker, Popup, GeoJSON } from "react-leaflet";
import L, { Icon } from "leaflet";
import { getUserLocation } from "./GeoLocation";
import MapLegend from "../ui/MapLegend";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";

import Slider from "@mui/material/Slider";
import "../../styles/MapSlider.css";

import {
  getNext7Days,
  getNext30Days,
  bucketWeek,
  bucketMonth,
  createWeekMarks,
  createMonthMarks,
} from "./dateUtils";

import {
  tempConverter,
  toFarenheit,
  pointInPolygon,
  generateGridInPolygon,
  distance,
  interpolation,
} from "./graphUtils";

import type {
  MapProps,
  TemperaturePoint,
  TimeTemperaturePoint,
} from "./mapTypes";

import { GeoJsonObject } from "geojson";
import { file, string } from "zod/v4";
import { cookies } from "next/headers";
import { get } from "axios";
import { set } from "date-fns";

const supabase = createClient(); // need to move this elsewhere

const Map = (props: MapProps) => {
  const [userLocation, setUserLocation] = useState(() => {
    const userLocationData = localStorage.getItem("USER_LOCATION");
    return userLocationData
      ? JSON.parse(userLocationData)
      : { latitude: null, longitude: null };
  });


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

  //Contour buckets
  const [loofsContours, setLoofsContours] = useState(null);
  const [leofsContours, setLeofsContours] = useState(null);
  const [lsofsContours, setLsofsContours] = useState(null);
  const [lmhofsContours, setLmhofsContours] = useState(null);

  //Points buckets
  const [loofsPoints, setLoofsPoints] = useState(null);
  const [leofsPoints, setLeofsPoints] = useState(null);
  const [lsofsPoints, setLsofsPoints] = useState(null);
  const [lmhofsPoints, setLmhofsPoints] = useState(null);

  const [date, setDate] = useState(() => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth(); // Months are 0-indexed
    const day = new Date().getDate();
    const today = new Date(year, month, day);
    return today
  })


  const [unit, setUnit] = useState("Celsius");

  // const generateGrids = () => {
  //   let grids = [];
  //   for (let i = 0; i < polygons.length; i++) {
  //     if (polygons[i].containsPoint) {
  //       const grid = generateGridInPolygon(polygons[i].coordinates, 0.5);
  //       grids.push({ grid: grid, polygon: polygons[i] });
  //     }
  //   }
  //   return grids;
  // };

  // const [tempData, setTempData] = useState<TemperaturePoint[]>(() => {
  //   const localData = localStorage.getItem("TEMP_DATA");
  //   return localData ? JSON.parse(localData) : [];
  // });

  // const [interpolatedTempData, setInterpolatedTempData] = useState<
  //   TemperaturePoint[]
  // >(() => {
  //   const localInterData = localStorage.getItem("INTERPOLATED_TEMP_DATA");
  //   return localInterData ? JSON.parse(localInterData) : [];
  // });

  // const [rawTempData, setRawTempData] = useState(() => {
  //   const localRawData = localStorage.getItem("RAW_TEMP_DATA");
  //   return localRawData ? JSON.parse(localRawData) : [];
  // });

  // const [geoGrids, setGeoGrids] = useState(() => {
  //   const localGeoGrids = localStorage.getItem("GRID_DATA");
  //   return localGeoGrids ? JSON.parse(localGeoGrids) : [];
  // });

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

  useEffect(() => {
    const dateStr = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    console.log("Current date string:", dateStr);
    setLoofsContours(null)
    setLeofsContours(null)  
    setLsofsContours(null)
    setLmhofsContours(null)
    const getLoofsBucketData = async () => {
      try {
        const filePath = `${dateStr}/loofs_${dateStr}.geo.json`
        console.log('fetching:', filePath)
        const { data, error } = await supabase.storage
        .from('geojson')
        .download(filePath);
        if (error) {
          console.error('Error downloading loofs geojson:', error);
          return;
        } else if (data != null) {
          const text = await data.text()
          const jsonData = JSON.parse(text)
          setLoofsContours(jsonData);
        }
      } catch (error) {
        console.error('Error fetching bucket data:', error);
      }
    }
    const getLmhofsBucketData = async () => {
      try {
        const filePath = `${dateStr}/lmhofs_${dateStr}.geo.json`
        console.log('fetching:', filePath)
        const { data, error } = await supabase.storage
        .from('geojson')
        .download(filePath);
        if (error) {
          console.error('Error downloading lmhofs geojson:', error);
          return;
        } else if (data != null) {
          const text = await data.text()
          const jsonData = JSON.parse(text)
          setLmhofsContours(jsonData);
        }
      } catch (error) {
        console.error('Error fetching bucket data:', error);
      }
    }

    const getLeofsBucketData = async () => {
      try {
        const filePath = `${dateStr}/leofs_${dateStr}.geo.json`
        console.log('fetching:', filePath)
        const { data, error } = await supabase.storage
        .from('geojson')
        .download(filePath);
        if (error) {
          console.error('Error downloading leofs geojson:', error);
          return;
        } else if (data != null) {
          const text = await data.text()
          const jsonData = JSON.parse(text)
          setLeofsContours(jsonData);
        }
      } catch (error) {
        console.error('Error fetching bucket data:', error);
      }
    }

    const getLsofsBucketData = async () => {
      try {
        const filePath = `${dateStr}/lsofs_${dateStr}.geo.json`
        console.log('fetching:', filePath)
        const { data, error } = await supabase.storage
        .from('geojson')
        .download(filePath);
        if (error) {
          console.error('Error downloading lsofs geojson:', error);
          return;
        } else if (data != null) {
          const text = await data.text()
          const jsonData = JSON.parse(text)
          setLsofsContours(jsonData);
        }
      } catch (error) {
        console.error('Error fetching bucket data:', error);
      }
    }

    getLoofsBucketData();
    getLmhofsBucketData();
    getLeofsBucketData();
    getLsofsBucketData();
  },[date])

  // console.log('geo data',geoJson)
  // console.log(tempData, "temp data points loaded");
  
  // IMPORTANT
  // Uncomment below when you run: Can be unstable
  
  // useEffect(() => {
  //   const loadGeoJSON = async () => {
  //     try {
  //       setGeoData(gTest);
  //       //geoJson is ordered [long, lat]
  //       const coordList = geoJsonTest.geometries[0].coordinates;
  //       const x = coordList
  //         .slice(0, 1000)
  //         .map((coord: any, index: number) => {
  //           if (!coord || !Array.isArray(coord[0])) return null;

  //           let containspoint = false;
  //           for (let i = 0; i < Math.min(tempData.length, 500); i++) {
  //             const point = tempData[i];
  //             if (
  //               Array.isArray(point) &&
  //               point.length >= 2 &&
  //               typeof point[0] === "number" &&
  //               typeof point[1] === "number" &&
  //               pointInPolygon([point[1], point[0]], coord[0])
  //             ) {
  //               containspoint = true;
  //               break;
  //             }
  //           }

  //           return {
  //             coordinates: coord[0],
  //             containsPoint: containspoint,
  //           };
  //         })
  //         .filter(Boolean);

  //       setPolygons(x);

  //       // const grids = generateGrids(); // This will now work with populated polygons
  //       // setGeoGrids(grids);
  //     } catch (error) {
  //       console.error("Error loading geo data:", error);
  //     }
  //   };

  //   loadGeoJSON();
  // }, []);

  // useEffect(() => {
  //   if (polygons.length > 0) {
  //     console.log("Generating grids from polygons...");
  //     const grids = generateGrids();
  //     setGeoGrids(grids);
  //   }
  // }, [polygons]);

  useEffect(() => {
    localStorage.setItem("USER_LOCATION", JSON.stringify(userLocation));
  }, [userLocation]);

  // useEffect(() => {
  //   localStorage.setItem("TEMP_DATA", JSON.stringify(tempData));
  // }, [tempData]);

  // useEffect(() => {
  //   localStorage.setItem(
  //     "INTERPOLATED_TEMP_DATA",
  //     JSON.stringify(interpolatedTempData)
  //   );
  // }, [interpolatedTempData]);

  // useEffect(() => {
  //   localStorage.setItem("RAW_TEMP_DATA", JSON.stringify(rawTempData));
  // }, [rawTempData]);

  // useEffect(() => {
  //   localStorage.setItem("GRID_DATA", JSON.stringify(geoGrids));
  // }, [geoGrids]);

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

  // utility functions

  /////////////////////
  const getData = async (timeRange: "all" | "week" | "month") => {
    let fromDate: string | null = null;

    if (props.timeRange === "week") {
      fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (props.timeRange === "month") {
      fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // need to change this
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
    const newDate = new Date()
    const currentDate = new Date()
    newDate.setDate(currentDate.getDate() - (7-value))
    console.log('old date', date)
    console.log('new date', newDate)
    setDate(newDate)
  };

  const monthSliderChange = (_event: Event, value: number) => {
    // const newValue = Array.isArray(value) ? value[0] : value;
    console.log("changed slider to", value);
    setCurrentMonthDate(value);
  };

  // Updated SliderLayer component:
  const SliderLayer = () => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const monthTime = new Date(
      Date.now() - (30 - currentMonthDate) * 24 * 60 * 60 * 1000
    );
    const weekTime = new Date(
      Date.now() - (7 - currentWeekday) * 24 * 60 * 60 * 1000
    );

    if (props.timeRange === "week") {
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

  // const findNearestTemperaturePoint = (
  //   clickLat: number,
  //   clickLng: number,
  //   timeRange: string,
  //   maxDistance: number = 0.5
  // ) => {
  //   let nearest = null;
  //   let minDistance = Infinity;

  //   if (timeRange == "week") {
  //     weekBucketRaw[currentWeekday - 1].forEach(
  //       (point: [number, number, number]) => {
  //         const distance = Math.sqrt(
  //           Math.pow(point[0] - clickLat, 2) + Math.pow(point[1] - clickLng, 2)
  //         );
  //         if (distance < minDistance && distance <= 2 * maxDistance) {
  //           minDistance = distance;
  //           nearest = {
  //             temperature: point[2],
  //             latitude: point[0],
  //             longitude: point[1],
  //             distance: distance,
  //           };
  //         }
  //       }
  //     );
  //     console.log("Nearest point:", nearest);
  //   } else if (timeRange == "month") {
  //     montthBucketRaw[currentMonthDate - 1].forEach(
  //       (point: [number, number, number]) => {
  //         const distance = Math.sqrt(
  //           Math.pow(point[0] - clickLat, 2) + Math.pow(point[1] - clickLng, 2)
  //         );
  //         if (distance < minDistance && distance <= 2 * maxDistance) {
  //           minDistance = distance;
  //           nearest = {
  //             temperature: point[2],
  //             latitude: point[0],
  //             longitude: point[1],
  //             distance: distance,
  //           };
  //         }
  //       }
  //     );
  //     console.log("Nearest point:", nearest);
  //   } else {
  //     allBucketRaw.forEach((point: [number, number, number]) => {
  //       const distance = Math.sqrt(
  //         Math.pow(point[0] - clickLat, 2) + Math.pow(point[1] - clickLng, 2)
  //       );
  //       if (distance < minDistance && distance <= maxDistance) {
  //         minDistance = distance;
  //         nearest = {
  //           temperature: point[2],
  //           latitude: point[0],
  //           longitude: point[1],
  //           distance: distance,
  //         };
  //       }
  //     });
  //     console.log("Nearest point:", nearest);
  //   }


  //   return nearest;
  // };

  // const MapClickHandler = () => {
  //   useMapEvents({
  //     click: (e) => {
  //       const { lat, lng } = e.latlng;
  //       if (
  //         typeof lat !== "number" ||
  //         typeof lng !== "number" ||
  //         isNaN(lat) ||
  //         isNaN(lng)
  //       ) {
  //         console.warn("Invalid coordinates:", { lat, lng });
  //         return;
  //       }
  //       console.log("Map clicked at:", lat, lng);

  //       const nearestPoint = findNearestTemperaturePoint(
  //         lat,
  //         lng,
  //         props.timeRange
  //       );

  //       if (nearestPoint) {
  //         setClickedPoint({
  //           latitude: lat,
  //           longitude: lng,
  //           nearestPoint: nearestPoint,
  //         });
  //       } else {
  //         setClickedPoint({
  //           latitude: null,
  //           longitude: null,
  //           nearestPoint: null,
  //         });
  //       }
  //     },
  //   });
  //   return null;
  // };

  //set the grids
  // useEffect(() => {
  //   if (polygons.length > 0 && tempData.length > 0) {
  //     console.log("Generating grids...");

  //     if (props.timeRange == "week") {
  //       let weeklyPoints = [];
  //       let weeklyPointsRaw = [];
  //       const weekData = bucketWeek(rawTempData);
  //       console.log("week data", weekData);

  //       if (!weekData || !Array.isArray(weekData) || weekData.length < 7) {
  //         console.warn("weekData is invalid or insufficient:", weekData);
  //         setWeekDataBucket(Array(7).fill([]));
  //         return;
  //       }

  //       for (let k = 0; k < weekData.length; k++) {
  //         let allNewPoints: TemperaturePoint[] = [];
  //         //remove time from the data
  //         if (weekData[k].length == 0 || !Array.isArray(weekData[k])) {
  //           weeklyPoints.push([]); // Push empty array for this day
  //           continue;
  //         }

  //         const weekDataWithoutTime = weekData[k].map((d: any) => {
  //           return [d[0], d[1], d[2]];
  //         });

  //         for (let i = 0; i < geoGrids.length; i++) {
  //           for (let j = 0; j < geoGrids[i]["grid"].length; j++) {
  //             const point = geoGrids[i]["grid"][j];
  //             const tempPoint = interpolation(
  //               geoGrids[i]["polygon"].coordinates,
  //               [...weekDataWithoutTime, ...allNewPoints],
  //               point
  //             );
  //             allNewPoints.push(tempPoint);
  //           }
  //         }
  //         //TODO - account for including the existing specific week data
  //         const combine = [...weekDataWithoutTime, ...allNewPoints].map(
  //           (point) => {
  //             return [point[0], point[1], tempConverter(point[2])];
  //           }
  //         );
  //         const combineRaw = [...weekDataWithoutTime, ...allNewPoints];
  //         weeklyPoints.push(combine);
  //         weeklyPointsRaw.push(combineRaw);
  //       }
  //       //set state
  //       setWeekDataBucket(weeklyPoints);
  //       setWeekBucketRaw(weeklyPointsRaw);
  //     } else if (props.timeRange == "month") {
  //       let monthlyPoints = [];
  //       let monthlyPointsRaw = [];
  //       const monthData = bucketMonth(rawTempData);

  //       if (!monthData || !Array.isArray(monthData) || monthData.length < 30) {
  //         console.warn("weekData is invalid or insufficient:", monthData);
  //         setWeekDataBucket(Array(30).fill([]));
  //         return;
  //       }

  //       for (let k = 0; k < monthData.length; k++) {
  //         let allNewPoints: TemperaturePoint[] = [];

  //         if (monthData[k].length == 0 || !Array.isArray(monthData[k])) {
  //           monthlyPoints.push([]); // Push empty array for this day
  //           continue;
  //         }
  //         //remove time from the data
  //         const monthDataWithoutTime = monthData[k].map((d: any) => {
  //           return [d[0], d[1], d[2]];
  //         });
  //         for (let i = 0; i < geoGrids.length; i++) {
  //           for (let j = 0; j < geoGrids[i]["grid"].length; j++) {
  //             const point = geoGrids[i]["grid"][j];
  //             const tempPoint = interpolation(
  //               geoGrids[i]["polygon"].coordinates,
  //               [...monthDataWithoutTime, ...allNewPoints],
  //               point
  //             );
  //             allNewPoints.push(tempPoint);
  //           }
  //         }
  //         //TODO - account for including the existing specific month data
  //         const combine = [...monthDataWithoutTime, ...allNewPoints].map(
  //           (point) => {
  //             return [point[0], point[1], tempConverter(point[2])];
  //           }
  //         );
  //         const combineRaw = [...monthDataWithoutTime, ...allNewPoints];
  //         monthlyPoints.push(combine);
  //         monthlyPointsRaw.push(combineRaw);
  //       }
  //       //set State
  //       setMonthDataBucket(monthlyPoints);
  //       setMonthBucketRaw(monthlyPointsRaw);
  //       // console.log('MONTH BUCKET AFTER INTERPOLATION', monthlyPoints)
  //     } else {
  //       let allNewPoints: TemperaturePoint[] = [];

  //       for (let i = 0; i < geoGrids.length; i++) {
  //         for (let j = 0; j < geoGrids[i]["grid"].length; j++) {
  //           const point = geoGrids[i]["grid"][j];
  //           const tempPoint = interpolation(
  //             geoGrids[i]["polygon"].coordinates,
  //             [...tempData, ...allNewPoints],
  //             point
  //           );
  //           allNewPoints.push(tempPoint);
  //         }
  //       }

  //       if (allNewPoints.length > 0) {
  //         // console.log('new interpolated', allNewPoints)
  //         const join: TemperaturePoint[] = [...tempData, ...allNewPoints].map(
  //           (point) => {
  //             // console.log('Temperature before conversion:', point[2]); // Add this line
  //             return [point[0], point[1], tempConverter(point[2])];
  //           }
  //         );
  //         const joinRaw: TemperaturePoint[] = [...tempData, ...allNewPoints];

  //         setInterpolatedTempData(join);
  //         setAllBucketRaw(joinRaw);
  //       }
  //     }
  //   }
  // }, [polygons, tempData, gridsGenerated, props.timeRange]);

  const tempFunc = (temp: number) => {
    if (temp <= 2) {
      return "#8B00FF";
    } else if (temp <= 4) {
      return "#4B0082"; 
    } else if (temp <= 6) {
      return "#0000FF"; 
    } else if (temp <= 8) {
      return "#1E90FF"; 
    } else if (temp <= 10) {
      return "#00CED1"; 
    } else if (temp <= 12) {
      return "#00FA9A"; 
    } else if (temp <= 14) {
      return "#00FF00"; 
    } else if (temp <= 16) {
      return "#7CFC00"; 
    } else if (temp <= 18) {
      return "#ADFF2F"; 
    } else if (temp <= 20) {
      return "#FFD700"; 
    } else if (temp <= 22) {
      return "#FFA500"; 
    } else if (temp <= 24) {
      return "#FF8C00"; 
    } else if (temp <= 26) {
      return "#FF4500"; 
    } else if (temp <= 28) {
      return "#B22222";
    } else {
      return "#8B0000";
    }
  }

  const getFeatureStyle = (feature: any) => {
    const temperature = feature.properties.temperature;
    const fillColor = tempFunc(temperature)
    
    return {
      fillColor: fillColor,
      weight: 1,
      opacity: 0.8,
      color: fillColor,
      fillOpacity: 1
    };
  };

  const getFeatureStyle2 = (feature: any) => {
    const temperature = feature.properties.fill;
    // const fillColor = tempFunc(temperature)
    
    return {
      fillColor: temperature,
      weight: 1,
      opacity: 0.8,
      color: temperature,
      fillOpacity: 1
    };
  };

  useEffect(() => {
    console.log('contours changed')
  },[loofsContours, leofsContours, lsofsContours, lmhofsContours])

  //RENDER
  // console.log('loofs', loofsContours)
  // console.log('leofs', leofsContours)
  // console.log('lmhofs', lmhofsContours)
  // console.log('lsofs', lsofsContours)
  if (
    mapCoords.latitude &&
    mapCoords.longitude &&
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
        {/* <MapClickHandler /> */}
        {/* {tempVisible &&
          props.timeRange == "all" &&
          interpolatedTempData.length > 0 && (
            <HeatmapLayer data={interpolatedTempData} />
          )} */}
        {/* {tempVisible &&
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
          )} */}

          {/* {tempVisible && (
          <GeoJSON
            data={g0}
            style={getFeatureStyle2}
          />
        )} */}

        {tempVisible && loofsContours && (
          <GeoJSON
            data={loofsContours}
            style={getFeatureStyle2}
          />
        )}
        {tempVisible && leofsContours && (
          <GeoJSON
            data={leofsContours}
            style={getFeatureStyle2}
          />
        )}
        {tempVisible && lmhofsContours && (
          <GeoJSON
            data={lmhofsContours}
            style={getFeatureStyle2}
          />
        )}
         {tempVisible && lsofsContours && (
          <GeoJSON
            data={lsofsContours}
            style={getFeatureStyle2}
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
