"use client";
import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854866.png",
  iconSize: [32, 32],
});

export default function MapContainer({ pgListings }) {
  return (
    <div className="h-[75vh] w-full rounded-xl overflow-hidden border border-gray-800 shadow-lg">
      <LeafletMap
        center={[28.6139, 77.209]}
        zoom={11}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pgListings.map((pg) => (
          <Marker key={pg.id} position={[pg.lat, pg.lng]} icon={icon}>
            <Popup>
              <strong>{pg.name}</strong>
              <br />
              ₹{pg.rent}/month
              <br />
              {pg.distance} km from {pg.college}
            </Popup>
          </Marker>
        ))}
      </LeafletMap>
    </div>
  );
}
