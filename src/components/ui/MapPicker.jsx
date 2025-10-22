import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MarkerUpdater = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

const MapPicker = ({ onSelect, latitude, longitude, defaultCenter = [20.5937, 78.9629], zoom = 5 }) => {
  const [markerPosition, setMarkerPosition] = useState(
    latitude && longitude ? [latitude, longitude] : null
  );

  // update marker if props change (controlled)
  useEffect(() => {
    if (latitude && longitude) {
      setMarkerPosition([parseFloat(latitude), parseFloat(longitude)]);
    }
  }, [latitude, longitude]);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setMarkerPosition([lat, lng]);
    onSelect({ lat, lng });
  };

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden">
      <MapContainer
        center={markerPosition || defaultCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => {
          if (markerPosition) map.setView(markerPosition, zoom);
        }}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerUpdater position={markerPosition} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
