"use client";

import React, { useState, useEffect, use } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Marker, Popup } from 'react-leaflet'
import L, { Icon, divIcon, point } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { getUserLocation} from './GeoLocation';
// import MarkerClusterGroup from 'react-leaflet-cluster';
import "leaflet/dist/leaflet.css";
import 'react-leaflet-markercluster/styles';
// import 'react-leaflet-markercluster/dist/styles.min.css'; // inside .js file

const Map = () => {
    const [userLocation, setUserLocation] = useState(() => {

        // const pos = getUserLocation();
        // console.log('User location:', pos);
        const userLocationData = localStorage.getItem('USER_LOCATION');
        return userLocationData ? JSON.parse(userLocationData) : {latitude: null, longitude: null};
    });

    useEffect(() => {
        localStorage.setItem('USER_LOCATION', JSON.stringify(userLocation));
    },[userLocation])

    useEffect(() => {
        const fetchUserLocation = async () => {
            const pos = await getUserLocation();
            console.log('User location:', pos);
            setUserLocation(pos);
        };
        fetchUserLocation();
    }, []);
    //Markers only contain one temperature, users can press a button to toggle, and then map refresh with updated markers
    const markers = [
        {
            geocode: [43.760120, -77.683160] as [number, number],
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
        iconSize: [38, 38], // size of the icon
        iconAnchor: [12, 31], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -41] // point from which the popup should open relative to the iconAnchor
    });

    const createClusterCustomIcon = (cluster: any) => {
        return divIcon({
            html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
            className: 'cluster-marker-cluster',
            iconSize: point(33, 33, true),
        });
    }
    if (userLocation.latitude && userLocation.longitude) {
        return (
            <MapContainer center={[userLocation.latitude, userLocation.longitude]} zoom={13}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    maxZoom={19}
                />
                <MarkerClusterGroup
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
                </MarkerClusterGroup>
            </MapContainer>
        );

    }
}

export default Map;