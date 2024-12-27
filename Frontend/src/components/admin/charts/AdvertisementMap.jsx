import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Predefined coordinates for each country code (Add more countries as needed)
const countryCoordinates = {
  IN: { name: "India", coordinates: [20.5937, 78.9629] },
  AL: { name: "Albania", coordinates: [41.1533, 20.1683] },
  AF: { name: "Afghanistan", coordinates: [33.9391, 67.71] },
  // Add other countries as needed
};

// Sample static response from backend
const sampleResponse = {
  adCountsByCountry: [
    { target_country: "IN", ad_count: "19" },
    { target_country: "AL", ad_count: "2" },
    { target_country: "AF", ad_count: "1" },
  ],
};

const AdvertisementMap = () => {
  // State to store parsed advertisement data
  const [adData, setAdData] = useState([]);

  // Mimic fetching data from backend
  useEffect(() => {
    // Parse the sample response data to fit the expected format
    const parsedData = sampleResponse.adCountsByCountry.map((item) => ({
      countryCode: item.target_country,
      count: parseInt(item.ad_count, 10),
    }));
    setAdData(parsedData);
  }, []);

  return (
    <div className="p-4 border-2 border-gray-300 rounded-lg bg-gray-100 shadow-md max-w-full h-[500px]">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Loop through adData and render a marker for each country */}
        {adData.map((data, index) => {
          const countryInfo = countryCoordinates[data.countryCode];
          if (!countryInfo) return null; // Skip if country code not found in predefined coordinates
          return (
            <CircleMarker
              key={index}
              center={countryInfo.coordinates}
              radius={Math.sqrt(data.count) * 3} // Adjust radius based on ad count for better visibility
              fillColor="#FF5733"
              color="#FFFFFF"
              fillOpacity={0.8}
              stroke={false}
              eventHandlers={{
                mouseover: (e) => {
                  e.target.openTooltip();
                  e.target.setStyle({ fillColor: "#FFC300" });
                },
                mouseout: (e) => {
                  e.target.closeTooltip();
                  e.target.setStyle({ fillColor: "#FF5733" });
                },
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -10]}
                opacity={1}
                permanent={false}
              >
                <span>{`${countryInfo.name}: ${data.count} ads`}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default AdvertisementMap;


