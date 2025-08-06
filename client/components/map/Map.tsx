"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Marker, Popup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { subDays } from "date-fns";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet-canvas-marker";
import { getUserLocation } from "./GeoLocation";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import "../../styles/MapSlider.css";

import {
  toFarenheit,
  simpleDate,
  createCustomClusterIcon,
  customUserIcon,
  poiIcon,
  mapClickIcon,
} from "./mapUtils";
import { getClosestPOIs, POI } from "@/lib/services/POIsService";
import { getMapContours } from "@/lib/services/mapContourService";
import { getAverageClosestTemperature } from "@/lib/services/tempByCoordinatesService";
import { SliderLayer } from "./SliderLayer";
import { HeatmapLayer } from "./HeatMapLayer";
import { MapClickHandler } from "./MapClickHandler";
import type { MapProps } from "./mapTypes";
import MapControls from "./MapControls";
import TrendsModal from "../ui/TrendsModal";
import IconLegend from "./MapIconLegend";
import { useUnits } from "@/app/unitsContext";

const getCurrentHourBucket = () => {
  const hour = new Date().getHours();
  console.log("hour func:", hour);
  if (hour < 4) return 0;
  if (hour < 8) return 4;
  if (hour < 12) return 8;
  if (hour < 16) return 12;
  if (hour < 20) return 16;
  return 20;
};

const getTodayDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const Map = (props: MapProps) => {
  const [userLocation, setUserLocation] = useState(() => {
    const userLocationData = localStorage.getItem("USER_LOCATION");
    return userLocationData
      ? JSON.parse(userLocationData)
      : { latitude: null, longitude: null };
  });

  const [tempVisible, setTempVisible] = useState(true);
  const [heatVisible, setHeatVisible] = useState(false);
  const [graphVisible, setGraphVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [clickedLake, setClickedLake] = useState<null | string>(null);

  const [currentWeekday, setCurrentWeekday] = useState(7);
  const [currentHour, setCurrentHour] = useState(getCurrentHourBucket);
  const [tempHour, setTempHour] = useState(getCurrentHourBucket);

  //Contour buckets
  const [loofsContours, setLoofsContours] = useState(null);
  const [leofsContours, setLeofsContours] = useState(null);
  const [lsofsContours, setLsofsContours] = useState(null);
  const [lmhofsContours, setLmhofsContours] = useState(null);

  //Points buckets
  const [userPoints, setUserPoints] = useState([]);
  const [heatMapPoints, setHeatMapPoints] = useState([]);
  const [poiData, setPoiData] = useState<POI[]>([]);
  const [poiTemps, setPoiTemps] = useState<Record<number, string | null>>({});
  const [poiKey, setPoiKey] = useState<string>(() => {
    if (poiData.length > 0) {
      let key = poiData.map((item) => {
        return item["id"];
      });
      return key.join("-");
    }
    return "";
  });

  const [modalPoint, setModalPoint] = useState<{
    latitude: number;
    longitude: number;
    lake: string | null;
  } | null>(null);

  const [date, setDate] = useState(getTodayDate);
  const [today, setToday] = useState(getTodayDate);
  const [tempDate, setTempDate] = useState(getTodayDate);

  const { unit, setUnit } = useUnits();

  const [clickedPoint, setClickedPoint] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    nearestPoint: null as {
      latitude: number;
      longitude: number;
      temperature: number;
    } | null,
  });

  const toggleUpdateComplete = () => {
    if (props.timeRange == "week") {
      const id = `${tempDate.getFullYear()}-${(tempDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${tempDate
        .getDate()
        .toString()
        .padStart(2, "0")}-12`;
      setIdentifier(id);
    } else {
      const id = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today
        .getDate()
        .toString()
        .padStart(2, "0")}-${tempHour}`;
      setIdentifier(id);
    }
  };

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
    const setPOI = async () => {
      if (mapCoords.latitude != null && mapCoords.longitude != null) {
        const data = await getClosestPOIs(
          mapCoords.latitude,
          mapCoords.longitude
        );
        if (data && data.length > 0) {
          setPoiData(data);
          const tempsMap: Record<number, string | null> = {};
          for (const poi of data) {
            const avgTemp = await getAverageClosestTemperature(
              poi.latitude,
              poi.longitude
            );
            if (avgTemp) {
              tempsMap[poi.id] = `${avgTemp.toFixed(2)}`;
            } else {
              tempsMap[poi.id] = "...";
            }
          }
          setPoiTemps(tempsMap);

          //update key
          const idArr = data.map((item) => {
            return item["id"];
          });
          setPoiKey(idArr.join("-"));
        }
      }
    };

    setPOI();
  }, [mapCoords]);

  const fetchAllData = async () => {
    if (fetchLoading) return;
    setFetchLoading(true);
    try {
      const response = await getMapContours({
        date: date,
        today: today,
        currentHour: currentHour,
        timeRange: props.timeRange,
      });
      if (response && response.data) {
        // console.log('fetchAll data:', response.data)
        setUserPoints(response.data.userPoints);
        setHeatMapPoints(response.data.heatMapPoints);
        setLoofsContours(response.data.loofsContours);
        setLeofsContours(response.data.leofsContours);
        setLsofsContours(response.data.lsofsContours);
        setLmhofsContours(response.data.lmhofsContours);

        if (response.data.tempDate) {
          setTempDate(new Date(response.data.tempDate));
        } else if (response.data.currentHour) {
          setTempHour(response.data.currentHour);
        }

        toggleUpdateComplete();
      }
    } catch (err) {
      console.error("Error fetching map data:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    // console.log("date state changed");
    fetchAllData();
  }, [date, currentHour, props.timeRange, today]);

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

  const weekSliderChange = (_event: Event, value: number) => {
    // changes the position of the thumb on the weekday slider
    const today = new Date();
    const daysBack = 7 - value;
    const newDate = subDays(today, daysBack);
    // console.log("old date", date);
    // console.log("new date", newDate);
    setDate(newDate);
    setTimeout(() => {
      // console.log("slider currently at:", currentWeekday);
      // console.log("changing slider to:", value);
      setCurrentWeekday(value);
    }, 500);
  };

  const hourSliderChange = (_event: Event, value: number) => {
    // Changes the position of the thumb on the month day slider
    setTimeout(() => {
      // console.log("slider currently at:", currentHour / 4 + 1);
      // console.log("changing slider to:", value);
      setCurrentHour((value - 1) * 4);
    }, 500);
  };

  const getFeatureStyle2 = (feature: any) => {
    // colors the geo json contours on the map
    const temperature = feature.properties.fill;

    return {
      fillColor: temperature,
      weight: 1,
      opacity: 0.8,
      color: temperature,
      fillOpacity: 1,
    };
  };

  //RENDER
  if (
    mapCoords.latitude != null &&
    mapCoords.longitude != null &&
    !loading &&
    loofsContours &&
    leofsContours &&
    lmhofsContours &&
    lsofsContours &&
    userPoints != null
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
        <MapClickHandler
          date={date}
          today={today}
          currentHour={currentHour}
          setClickedLake={setClickedLake}
          setClickedPoint={setClickedPoint}
          timeRange={props.timeRange}
        />
        {tempVisible && (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={(cluster: L.MarkerCluster) =>
              createCustomClusterIcon(cluster, "user point")
            }
            key={`markers-${date.toDateString()}`}
          >
            {userPoints.length > 0 &&
              userPoints.map((item, index) => {
                // console.log('Adding user point')
                return (
                  <Marker
                    key={`marker-${index}-${date.toDateString()}`}
                    position={[item["latitude"], item["longitude"]]}
                    icon={customUserIcon}
                  >
                    <Popup>
                      <div className="bg-white w-20 md:w-30 rounded-md gap-0">
                        <p className="font-semibold text-center text-sm md:text-lg mb-0">
                          {unit === "Celsius"
                            ? `${item["temperature"]} °C`
                            : `${toFarenheit(item["temperature"])} °F`}
                        </p>
                        <p className="text-center text-xs text-gray-500">
                          {simpleDate(item["measured_on"])}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MarkerClusterGroup>
        )}

        <MarkerClusterGroup
          chunkedLoading
          key={poiKey}
          iconCreateFunction={(cluster: L.MarkerCluster) =>
            createCustomClusterIcon(cluster, "poi")
          }
        >
          {poiData.length > 0 &&
            Object.keys(poiTemps).length > 0 &&
            poiData.map((item) => {
              return (
                <Marker
                  key={item["id"]}
                  position={[item["latitude"], item["longitude"]]}
                  icon={poiIcon}
                >
                  <Popup>
                    <div className="bg-white w-20 md:w-30 rounded-md gap-0">
                      <p className="font-semibold text-center md:text-sm text-xs">
                        {item["name"]}
                      </p>
                      <p className="text-center text-xs md:text-sm mb-0">
                        {unit == "Celsius"
                          ? `Avg: ${poiTemps[item.id]} °C`
                          : `Avg: ${toFarenheit(poiTemps[item.id])} °F`}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MarkerClusterGroup>

        {tempVisible && (
          <GeoJSON
            key={`loofs-${identifier}`}
            data={loofsContours}
            style={getFeatureStyle2}
          />
        )}
        {tempVisible && (
          <GeoJSON
            key={`leofs-${identifier}`}
            data={leofsContours}
            style={getFeatureStyle2}
          />
        )}
        {tempVisible && (
          <GeoJSON
            key={`lmhofs-${identifier}`}
            data={lmhofsContours}
            style={getFeatureStyle2}
          />
        )}
        {tempVisible && (
          <GeoJSON
            key={`lsofs-${identifier}`}
            data={lsofsContours}
            style={getFeatureStyle2}
          />
        )}

        {clickedPoint.latitude && clickedPoint.longitude && (
          <Marker
            position={[clickedPoint.latitude, clickedPoint.longitude]}
            icon={mapClickIcon}
          >
            <Popup>
              <div className="bg-white w-20 md:w-25 rounded-md flex items-center justify-center py-0 px-0">
                <p className="text-center text-sm md:text-base">
                  {unit == "Celsius"
                    ? `${clickedPoint.nearestPoint?.temperature.toFixed(2)} °C`
                    : `${toFarenheit(
                        clickedPoint.nearestPoint?.temperature.toFixed(2)
                      )} °F`}
                </p>
                <br />
              </div>
            </Popup>
          </Marker>
        )}

        {heatVisible && <HeatmapLayer data={heatMapPoints} />}

        <MapControls
          tempVisible={tempVisible}
          setTempVisible={setTempVisible}
          heatVisible={heatVisible}
          setHeatVisible={setHeatVisible}
          // @ts-ignore
          clickedPoint={clickedPoint}
          lakeClicked={clickedLake}
          onTrendPromptClick={() => {
            if (clickedPoint.latitude && clickedPoint.longitude) {
              setModalPoint({
                latitude: clickedPoint.latitude,
                longitude: clickedPoint.longitude,
                lake: clickedLake,
              });
              setShowTrendsModal(true);
            }
          }}
        />
        {modalPoint && (
          <TrendsModal
            latitude={modalPoint.latitude}
            longitude={modalPoint.longitude}
            lake={modalPoint.lake}
            onClose={() => {
              setShowTrendsModal(false);
              setModalPoint(null);
            }}
          />
        )}

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
          <SliderLayer
            currentHour={currentHour}
            currentWeekday={currentWeekday}
            timeRange={props.timeRange}
            today={today}
            hourSliderChange={hourSliderChange}
            weekSliderChange={weekSliderChange}
          />
        </div>

        <div
          style={{
            position: "absolute",
            zIndex: 500,
            top: "50%",
            left: "5px",
            width: "auto",
            height: "auto",
          }}
        >
          <IconLegend />
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
