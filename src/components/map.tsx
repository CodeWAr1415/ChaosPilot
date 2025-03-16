import React from "react";

import "./map.css";

import * as MapUtils from "../api/leaflet";

import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import toast from "react-hot-toast";

export default function MapDisplay() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [markers, setMarkers] = React.useState<React.ReactElement[]>([]);
  const [line, setLine] = React.useState<React.ReactElement>();
  const [map, setMap] = React.useState<any>(null);

  const displayMap = React.useMemo(() => (
    <MapContainer
      center={[25.086979946042508, 121.47388820821935]}
      zoom={14}
      ref={setMap}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {markers}
      {line}
    </MapContainer>
  ), [markers, line]);

  React.useEffect(() => {
    let onUpdateMap = async (ev: CustomEventInit<{
      startAddress: string,
      endAddress: string
    }>) => {
      setLoading(true);

      let { startAddress, endAddress } = ev.detail!;

      let startLocation = await MapUtils.geocodeAddress(startAddress),
        endLocation = await MapUtils.geocodeAddress(endAddress);

      if (!startLocation || !endLocation) {
        toast.error("找不到地點！");
        setLoading(false);
        return;
      }

      setMarkers([
        <Marker key="start" position={startLocation}>
          <Popup>
            起點：{startAddress}
          </Popup>
        </Marker>,
        <Marker key="end" position={endLocation}>
          <Popup>
            終點：{endAddress}
          </Popup>
        </Marker>
      ]);

      const { lat: startLat, lng: startLng } = startLocation;
      const { lat: endLat, lng: endLng } = endLocation;

      const randomMidpoint = MapUtils.generateOffsetMidpoint(startLat, startLng, endLat, endLng);
      const randomMidpoint2 = MapUtils.generateOffsetMidpoint(startLat, startLng, endLat, endLng);

      const routeCoordinates = [
        [startLng, startLat],
        [randomMidpoint[1], randomMidpoint[0]],
        [randomMidpoint2[1], randomMidpoint2[0]],
        [endLng, endLat]
      ];

      const apiUrl = "https://api.openrouteservice.org/v2/directions/driving-car/json";
      const apiKey = "5b3ce3597851110001cf62483f55f974310b4d04b09684ea34f9b96c";

      const data = {
        coordinates: routeCoordinates
      };

      function decodePolyline(encoded: string): [number, number][] {
        let coordinates = [];
        let index = 0, len = encoded.length;
        let lat = 0, lng = 0;

        while (index < len) {
          let shift = 0, result = 0;
          let byte;

          do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
          } while (byte >= 0x20);

          let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
          lat += dlat;

          shift = 0;
          result = 0;

          do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
          } while (byte >= 0x20);

          let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
          lng += dlng;

          coordinates.push([lat / 1E5, lng / 1E5]);
        }
        return coordinates as any;
      }

      let responseData = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey,
        },
        body: JSON.stringify(data)
      }).then(response => response.json())

      if (responseData.routes && responseData.routes.length > 0) {
        const encodedPolyline = responseData.routes[0].geometry;
        const decodedCoordinates = decodePolyline(encodedPolyline);

        setLine(<Polyline pathOptions={{
          color: "#00aaff",
          weight: 7,
          opacity: 0.7
        }} positions={decodedCoordinates} />);
      }
      else {
        toast.error("找不到路線！");
        setLoading(false);
        return;
      }

      const durationInSeconds = responseData.routes[0].summary.duration;
      const durationInMinutes = (durationInSeconds / 60).toFixed(0);

      toast.success(`預估開車時長：${durationInMinutes} 分鐘`);

      map.setView(startLocation);

      setLoading(false);
    }

    window.addEventListener("cp:update-map", onUpdateMap);
    return () => {
      window.removeEventListener("cp:update-map", onUpdateMap);
    }
  }, [map]);

  return <div className="map">
    <div className="wrapper">
      {displayMap}
      <div className="loading-overlay" data-visible={loading}>
        <div role="status">
          <svg aria-hidden="true" className="w-16 h-16 text-neutral-400 animate-spin dark:text-gray-600 fill-neutral-100" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  </div>
}
