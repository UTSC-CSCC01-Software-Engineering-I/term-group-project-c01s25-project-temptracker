import L, { Icon, point } from "leaflet";

export const toFarenheit = (temp: any) => {
  const tempNum = Number(temp);
  if (!isNaN(tempNum)) {
    return tempNum * 1.8 + 32;
  }
  return temp;
};

//COLOR VISUALIAZATION
export const lakeCodeConvert = (code: string) => {
  switch (code) {
    case "loofs":
      return "Lake Ontario";
    case "leofs":
      return "Lake Erie";
    case "lsofs":
      return "Lake Superior";
    case "lmhofs":
      return "Lake Huron & Michigan";
  }
};

export const simpleDate = (date: string) => {
  const d = new Date(date)

  const time = d.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

  return time;
};

export const mapClickIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [12, 31],
  popupAnchor: [0, -41],
});

export const customUserIcon = new Icon({
  iconUrl: "/circle.png",
  iconSize: [20, 20],
  iconAnchor: [0, 0],
  popupAnchor: [10, 0],
});

export const poiIcon = new Icon({
  iconUrl: "/poi_icon.png",
  iconSize: [22, 22],
  iconAnchor: [0, 0],
  popupAnchor: [10, 0],
});

export const createCustomClusterIcon = (cluster: any, type: string) => {
  if (type == "user point") {
    return L.divIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      iconSize: point(26, 26, true),
    });
  } else if (type == "poi") {
    return L.divIcon({
      html: `<div class="cluster-icon2">${cluster.getChildCount()}</div>`,
      iconSize: point(26, 26, true),
    });
  }
};
