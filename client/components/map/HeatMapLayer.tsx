 import React, { useEffect } from "react";
 import { useMap } from "react-leaflet";
 import L from "leaflet";

 
 export const HeatmapLayer = ({
    data,
  }: {
    data: [number,number][];
  }) => {
    const map = useMap();

    useEffect(() => {
      if (!map || !data || data.length === 0) return;

      const addHeatmap = () => {
        const heatLayer = (L as any).heatLayer(data, {
          radius: 25,
          blur: 15,
          maxZoom: 18,
          minOpacity: 0.5,

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