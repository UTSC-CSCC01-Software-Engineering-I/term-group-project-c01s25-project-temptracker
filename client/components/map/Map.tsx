"use client";

import React, { useState, useEffect, useRef, use, useOptimistic } from "react";
import { createClient } from "../../lib/supabase/client";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Marker, Popup, GeoJSON } from "react-leaflet";
import L, { Icon, point, divIcon } from "leaflet";
import { subDays } from 'date-fns';
import MarkerClusterGroup from "react-leaflet-markercluster";
import { getTemperatureReading } from "@/lib/services/getTemperatureReadingService"
// import CanvasMarkersLayer from '../src/CanvasMarkersLayer';
import "leaflet-canvas-marker"
import clusterIcon from '../../public/circle.png'
import { getUserLocation } from "./GeoLocation";
import MapLegend from "../ui/MapLegend";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";

import Slider from "@mui/material/Slider";
import "../../styles/MapSlider.css";

// use 12 pm forcasted data for weekly, and regular 4 hrs apart forcasted data for today slider?

import {
  getNext7Days,
  getNext30Days,
  bucketWeek,
  bucketMonth,
  createWeekMarks,
  createMonthMarks,
} from "./dateUtils";

import {
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
// import { get } from "axios";
import { set } from "date-fns";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { init } from "next/dist/compiled/webpack/webpack";
import { Over_the_Rainbow } from "next/font/google";
import { useParams } from "next/navigation";

interface MyDataType {
  latitude: string;
  features: any[];
}

const supabase = createClient(); // need to move this elsewhere

const Map = (props: MapProps) => {
  const [userLocation, setUserLocation] = useState(() => {
    const userLocationData = localStorage.getItem("USER_LOCATION");
    return userLocationData
      ? JSON.parse(userLocationData)
      : { latitude: null, longitude: null };
  });


  const [tempVisible, setTempVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false)

  //Slider
  const [currentWeekday, setCurrentWeekday] = useState(7);
  const [currentMonthDate, setCurrentMonthDate] = useState(30);

  //Contour buckets
  const [loofsContours, setLoofsContours] = useState(null);
  const [leofsContours, setLeofsContours] = useState(null);
  const [lsofsContours, setLsofsContours] = useState(null);
  const [lmhofsContours, setLmhofsContours] = useState(null);

  //Points buckets
  const [userPoints, setUserPoints] = useState([])


  const [date, setDate] = useState(() => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth(); // Months are 0-indexed
    const day = new Date().getDate(); //make July 18th
    const today = new Date(year, month, day);
    return today
  })

  const [tempDate, setTempDate] = useState(() => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth(); // Months are 0-indexed
    const day = new Date().getDate(); //make July 18th
    const today = new Date(year, month, day);
    return today
  })


  const [unit, setUnit] = useState("Celsius");

  const [clickedPoint, setClickedPoint] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    nearestPoint: null as {
      latitude: number;
      longitude: number;
      temperature: number;
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

  const fetchAllData = async () => {
    //fetches geo json data from the supabase storage
    const dateStr = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    console.log("Current fetch date string:", dateStr);

    const fetchFunctions = [
      // Point data fetchers
      // async () => {
      //   const filePath = `${dateStr}/user_points.geo.json`;
      //   const { data, error } = await supabase.storage.from('geojson').download(filePath);
      //   if (error) throw new Error(`Error downloading user points: ${error.message}`);
      //   const text = await data.text();
      //   return { type: 'userPoints', data: JSON.parse(text) };
      // },
      // Database uploads
      async () => {
        const { data, error } = await supabase.from('temperatures').select('latitude,longitude,temperature')
        .gte('measured_on', `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T00:00:00.000Z`)
        .lt('measured_on', `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${(date.getDate()+1).toString().padStart(2, '0')}T00:00:00.000Z`);

        if (error) throw new Error(`Error reading user uploads: ${error.message}`);
        console.log('user uploads:', data)
        return { type: 'userPoints', data: data };
      },
      // Contour data fetchers
      async () => {
        const filePath = `${dateStr}/loofs_${dateStr}.geo.json`;
        const { data, error } = await supabase.storage.from('geojson').download(filePath);
        if (error) throw new Error(`Error downloading loofs contours: ${error.message}`);
        const text = await data.text();
        return { type: 'loofsContours', data: JSON.parse(text) };
      },
      async () => {
        const filePath = `${dateStr}/leofs_${dateStr}.geo.json`;
        const { data, error } = await supabase.storage.from('geojson').download(filePath);
        if (error) throw new Error(`Error downloading leofs contours: ${error.message}`);
        const text = await data.text();
        return { type: 'leofsContours', data: JSON.parse(text) };
      },
      async () => {
        const filePath = `${dateStr}/lsofs_${dateStr}.geo.json`;
        const { data, error } = await supabase.storage.from('geojson').download(filePath);
        if (error) throw new Error(`Error downloading lsofs contours: ${error.message}`);
        const text = await data.text();
        return { type: 'lsofsContours', data: JSON.parse(text) };
      },
      async () => {
        const filePath = `${dateStr}/lmhofs_${dateStr}.geo.json`;
        const { data, error } = await supabase.storage.from('geojson').download(filePath);
        if (error) throw new Error(`Error downloading lmhofs contours: ${error.message}`);
        const text = await data.text();
        return { type: 'lmhofsContours', data: JSON.parse(text) };
      }
    ];

    try {
      setDataLoading(true);
      const results = await Promise.all(fetchFunctions.map(fn => fn()));
      
      // Update all states at once
      results.forEach(result => {
        switch(result.type) {
          case 'userPoints':
            setUserPoints(result.data);
            break;
          case 'loofsContours':
            setLoofsContours(result.data);
            break;
          case 'leofsContours':
            setLeofsContours(result.data);
            break;
          case 'lsofsContours':
            setLsofsContours(result.data);
            break;
          case 'lmhofsContours':
            setLmhofsContours(result.data);
            break;
        }
      });

      setTempDate(date)
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    console.log("date state changed");
    fetchAllData();
  }, [date]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    localStorage.setItem("USER_LOCATION", JSON.stringify(userLocation));
  }, [userLocation]);

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

  // useEffect(() => {
  //   if (props.timeRange) {
  //     getData(props.timeRange);
  //   }
  // }, [props.timeRange]);

  const weekSliderChange = (_event: Event, value: number) => {
    // changes the position of the thumb on the weekday slider
    
    const today = new Date();
    const daysBack = 7 - value;
    const newDate = subDays(today, daysBack);
    console.log('old date', date)
    console.log('new date', newDate)
    setDate(newDate)

    setTimeout(() => {
      console.log("slider currently at:", currentWeekday);
      console.log("changing slider to:", value)
      setCurrentWeekday(value);
    },500)
  };

  const monthSliderChange = (_event: Event, value: number) => {
    // Changes the position of the thumb on the month day slider
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
    } else if (props.timeRange === "today") {
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

  // const LeafletCanvasMarker = ({ 
  //   other_points, 
  //   tempUnit 
  // }: {
  //   other_points: any;
  //   tempUnit: string;
  // }) => {
  //   const map = useMap()
  //   const canvasLayerRef = useRef<any>(null)

  //   useEffect(() => {
  //     if (!map || !map.getContainer() || dataLoading) return;

  //       try {
  //         // if (canvasLayerRef.current && map.hasLayer(canvasLayerRef.current)) {
  //         //   map.removeLayer(canvasLayerRef.current);
  //         //   canvasLayerRef.current = null;
  //         // }
  //         if (!map.getContainer()) return

  //         var ciLayer = (L as any).canvasIconLayer({}).addTo(map)
  //         // canvasLayerRef.current = ciLayer;

  //         var icon = L.icon({
  //           iconSize: [5, 5],
  //           iconAnchor: [5, 5],
  //           iconUrl: '/circle.png'
  //         });

  //         const markers = []
  //         for (let j = 0; j < other_points["features"].length; j++) {
  //           var marker = (L as any).marker(
  //             [other_points["features"][j]["geometry"]["coordinates"][1], other_points["features"][j]["geometry"]["coordinates"][0]],
  //             {icon: icon}
  //           ).bindPopup(tempUnit == 'Celsius' ? `${other_points["features"][j]["properties"]["temperature"]} °C` : `${toFarenheit(other_points["features"][j]["properties"]["temperature"])} °F`)
  //           markers.push(marker)
  //         }
          
  //         console.log(`created ${markers.length} markers`)
  //         ciLayer.addLayers(markers);
  //         // ciLayer.addTo(map)
  //         // return ciLayer
          
  //       } catch (error) {
  //         console.error('Error initializing map marker layer:', error)
  //       }


  //     // // Cleanup function
  //     return () => {
  //       if (canvasLayerRef.current && map.hasLayer(canvasLayerRef.current)) {
  //         map.removeLayer(canvasLayerRef.current);
  //       }
  //     };
  //   }, [map, userPoints, tempUnit])

  //   return null
  // }

  const findNearestTemperaturePoint = async (
    // calls a backend service to find the nearest temperature point to a given lat and long on a specific date
    clickLat: number,
    clickLng: number,
    date: string  ) => {
    
    const data = {
      coord: [clickLat, clickLng],
      date: date
    }
    let nearest = null;
    const result = await getTemperatureReading(data)
    if (result.data) {
        const temp: number = result.data.temp
        const lat: number = result.data.lat
        const lng: number = result.data.lng
        nearest = {
          latitude: lat,
          longitude: lng,
          temperature: temp,
        };
    }
    
    
    // console.log("Nearest point:", nearest);
    
    return nearest;
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
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
        // console.log("Map clicked at:", lat, lng);

        const nearestPoint = await findNearestTemperaturePoint(
          lat,
          lng,
          `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
        );

        if (nearestPoint) {
          // console.log('set clicked point')
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

  const getFeatureStyle2 = (feature: any) => {
    // colors the geo json contours on the map
    const temperature = feature.properties.fill;
    
    return {
      fillColor: temperature,
      weight: 1,
      opacity: 0.8,
      color: temperature,
      fillOpacity: 1
    };
  };

  const customUserIcon = new Icon({
    iconUrl: "/circle.png",
    iconSize: [20, 20],
    iconAnchor: [0, 0],
    popupAnchor: [10, 0],
  })

  const createCustomClusterIcon = (cluster: any) => {
    return L.divIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      iconSize: point(26,26,true)    })
  }

  
  //RENDER
  if (
    mapCoords.latitude &&
    mapCoords.longitude &&
    !loading &&
    loofsContours && leofsContours && lmhofsContours && lsofsContours && userPoints
  ) {
    // console.log('user points', userPoints)
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
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createCustomClusterIcon}
          key={`markers-${date.toDateString()}`}
        >
          {userPoints.length > 0 && userPoints.map((item,index) => {
            // console.log('Adding user point')
            return (
              <Marker
              key={`marker-${index}-${date.toDateString()}`}
                position={[item['latitude'], item['longitude']]}
                icon={customUserIcon}
                >
                <Popup>
                  {unit == 'Celsius' ? `${item['temperature']} °C` : `${toFarenheit(item['temperature'])} °F`}
                </Popup>
              </Marker>
            )
          })
          }
        </MarkerClusterGroup>

        {tempVisible && (
          <GeoJSON
            key={`loofs-${tempDate.toISOString()}`}
            data={loofsContours}
            style={getFeatureStyle2}
          />
        )}
        {tempVisible && (
          <GeoJSON
            key={`leofs-${tempDate.toISOString()}`}
            data={leofsContours}
            style={getFeatureStyle2}
          />
        )}
        {tempVisible && (
          <GeoJSON
            key={`lmhofs-${tempDate.toISOString()}`}
            data={lmhofsContours}
            style={getFeatureStyle2}
          />
        )}
         {tempVisible && (
          <GeoJSON
            key={`lsofs-${tempDate.toISOString()}`}
            data={lsofsContours}
            style={getFeatureStyle2}
          />
        )}

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
