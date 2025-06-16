"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '../lib/supabase/client';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Marker, Popup } from 'react-leaflet'
import L, { Icon, divIcon, point } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { getUserLocation} from './GeoLocation';
import MapLegend from './ui/MapLegend';
import 'leaflet.heat'
import "leaflet/dist/leaflet.css";
import 'react-leaflet-markercluster/styles';
const supabase = createClient();

const Map = (props: any) => {
    const [userLocation, setUserLocation] = useState(() => {
        const userLocationData = localStorage.getItem('USER_LOCATION');
        return userLocationData ? JSON.parse(userLocationData) : {latitude: null, longitude: null};
    });

    const [tempData, setTempData] = useState(() => {
        const localData = localStorage.getItem('TEMP_DATA');
        return localData ? JSON.parse(localData) : [];
    });
    const [rawTempData, setRawTempData] = useState(() => {
        const localRawData = localStorage.getItem('RAW_TEMP_DATA');
        return localRawData ? JSON.parse(localRawData) : [];
    });

    const [clickedPoint, setClickedPoint] = useState({
        latitude: null as number | null,
        longitude: null as number | null,
        nearestPoint: null as { latitude: number; longitude: number; temperature: number; distance: number; intensity: number } | null
    });
    
    useEffect(() => {
        localStorage.setItem('USER_LOCATION', JSON.stringify(userLocation));
    },[userLocation])

    useEffect(() => {
        localStorage.setItem('TEMP_DATA', JSON.stringify(tempData));
    },[tempData])
    useEffect(() => {
        localStorage.setItem('RAW_TEMP_DATA', JSON.stringify(rawTempData));
    },[rawTempData])

    useEffect(() => {
        const fetchUserLocation = async () => {
            const pos = await getUserLocation();
            console.log('User location:', pos);
            setUserLocation(pos);
        };
        fetchUserLocation();
    }, []);
    const markers = [
        {
            geocode: [43.760120, -78.683160] as [number, number],
            popUp: "Lake Ontario\n 8 °C"
        },
        {
            geocode: [43.638927, -79.483009] as [number, number],
            popUp: "Humber River 11 °C"
        },
        {
            geocode: [43.631911, -79.498712] as [number, number],
            popUp: "Mimico Creek 9 °C"
        },
        
    ]

    const customIcon = new Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", 
        iconSize: [38, 38], 
        iconAnchor: [12, 31], 
        popupAnchor: [0, -41] 
    });

    const createClusterCustomIcon = (cluster: any) => {
        return divIcon({
            html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
            className: 'cluster-marker-cluster',
            iconSize: point(33, 33, true),
        });
    }

    const tempConverter = (temp: number) => { //celcius
        if (temp <= 0) {
            return 0.0
        } else if (temp <= 6.7) {
            return 0.2 //blue
        } else if (temp <= 10.55) {
            return 0.4 //green
        } else if (temp <= 15.6) {
            return 0.6 //yellow
        } else if (temp <= 19.5) {
            return 0.8 //orange
        } else if (temp <= 23.3) {
            return 0.9 //red
        } else {
            return 1.0 // dark red
        }
    }

    const getData = async () => {
        const { data, error } = await supabase
        .from('temperatures')
        .select('latitude, longitude, temperature, measured_on')

        if (error) {
            console.error('Error fetching data:', error);
            return [];
        }
        console.log(`Fetched data:`, data);
        const heatData = data.map(point => [
            point.latitude,
            point.longitude,
            tempConverter(point.temperature) 
        ]);
        const rawData = data.map(point => [
            point.latitude,
            point.longitude,
            point.temperature
        ]);
        setRawTempData(rawData);
        // const arr = []
        // for (let i = 0; i < heatData.length; i++) {
        //     if (heatData[i][2] >= 0.9) {
        //         arr.push([heatData[i][0], heatData[i][1], heatData[i][2]]); // add a point with 0.9 intensity
        //         arr.push([heatData[i][0], heatData[i][1], heatData[i][2]]);
        //         arr.push([heatData[i][0], heatData[i][1], heatData[i][2]]);
        //     }
        // }
        // const x = heatData.concat(arr);
        setTempData(heatData);
    }

    useEffect(() => {
        getData();
    }, [])



    const HeatmapLayer = ({ data }: { data: Array<[number, number, number]> }) => {
        const map = useMap();

        useEffect(() => {
            if (!map || !data || data.length === 0) return;

            const addHeatmap = () => {
            console.log('temp data',data)
            const heatLayer = (L as any).heatLayer(data, {
                radius: 20,
                blur: 15,
                maxZoom: 6,
                max: 1.0,
                minOpacity: 0.5,
                gradient: {
                    0.0: '#350273',     
                    0.2: 'blue',
                    0.4: 'lime',
                    0.6: '#FCED21',
                    0.8: '#FF8001',
                    0.9: '#E4080A',         
                    1.0: '#A40203'      
                }
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
        }, [map, data]);

        return null;
    };

    const findNearestTemperaturePoint = (clickLat: number, clickLng: number, maxDistance: number = 0.5) => {
        let nearest = null;
        let minDistance = Infinity;

        rawTempData.forEach((point: any) => {
            const distance = Math.sqrt(
                Math.pow(point[0] - clickLat, 2) + 
                Math.pow(point[1] - clickLng, 2)
            );
            console.log(`Distance to point (${point[0]}, ${point[1]}):`, distance);
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
        console.log('Nearest point:', nearest);
        return nearest;
    };

    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                console.log('Map clicked at:', lat, lng);
                
                const nearestPoint = findNearestTemperaturePoint(lat, lng);
                
                if (nearestPoint) {
                    setClickedPoint({
                        latitude: lat,
                        longitude: lng,
                        nearestPoint: nearestPoint
                    });
                } else {
                    setClickedPoint({
                        latitude: null,
                        longitude: null,
                        nearestPoint: null
                    });
                }
            }
        });
        return null;
    };

    


    if (props.centerLatitude != null && props.centerLongitude != null) {
        console.log('Displaying search results', props.centerLatitude, props.centerLongitude);
        return (
            <MapContainer key={`${props.centerLatitude},${props.centerLongitude}`} center={[props.centerLatitude, props.centerLongitude]} zoom={13}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    maxZoom={19}
                />
                <MapClickHandler />
                <HeatmapLayer data={tempData} />
                {/* <MarkerClusterGroup
                    chunkedLoading={true}
                    iconCreateFunction={createClusterCustomIcon}
                >
                    {markers.map((marker, index) => {
                        return (
                            <Marker position={marker.geocode} icon={customIcon} key={index}>
                                <Popup>{marker.popUp}</Popup>
                            </Marker>
                        )
                    })}
                </MarkerClusterGroup> */}
                {clickedPoint.latitude && clickedPoint.longitude && (
                <Marker position={[clickedPoint.latitude, clickedPoint.longitude]} icon={customIcon}>
                    <Popup>
                        <div>
                            <strong>Temperature Data</strong><br/>
                            <strong>Temperature:</strong> {clickedPoint.nearestPoint?.temperature}°C<br/>
                        </div>
                    </Popup>
                </Marker>
            )}
                <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                pointerEvents: 'auto'
            }}>
                <MapLegend />
            </div>
            </MapContainer>
        );

    }
    else if (userLocation.latitude && userLocation.longitude) {
        console.log('Displaying user location')
        return (
            <MapContainer key={`${userLocation.latitude},${userLocation.longitude}`} center={[userLocation.latitude, userLocation.longitude]} zoom={13}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    maxZoom={19}
                />
                <MapClickHandler />
                <HeatmapLayer data={tempData} />
                {/* <MarkerClusterGroup
                    chunkedLoading={true}
                    iconCreateFunction={createClusterCustomIcon}
                >
                    {markers.map((marker, index) => {
                        return (
                            <Marker position={marker.geocode} icon={customIcon} key={index}>
                                <Popup>{marker.popUp}</Popup>
                            </Marker>
                        )
                    })}
                </MarkerClusterGroup> */}
                {clickedPoint.latitude && clickedPoint.longitude && (
                <Marker position={[clickedPoint.latitude, clickedPoint.longitude]} icon={customIcon}>
                    <Popup>
                        <div>
                            <strong>Temperature Data</strong><br/>
                            <strong>Temperature:</strong> {clickedPoint.nearestPoint?.temperature}°C<br/>
                        </div>
                    </Popup>
                </Marker>
            )}
                <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                pointerEvents: 'auto'
            }}>
                <MapLegend />
            </div>
            </MapContainer>
        );

    }
}

export default Map;