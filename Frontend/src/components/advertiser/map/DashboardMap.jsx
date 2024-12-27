import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const countryCoordinates = {
    IN: { name: "India", coordinates: [20.5937, 78.9629] },
    AL: { name: "Albania", coordinates: [41.1533, 20.1683] },
    AF: { name: "Afghanistan", coordinates: [33.9391, 67.71] },

};

const sampleResponse = {
    adCountsByCountry: [
        { target_country: "IN", ad_count: "19" },
        { target_country: "AL", ad_count: "2" },
        { target_country: "AF", ad_count: "1" },
    ],
};

const DashboardMap = () => {

    const [adData, setAdData] = useState([]);

    useEffect(() => {
        const parsedData = sampleResponse.adCountsByCountry.map((item) => ({
            countryCode: item.target_country,
            count: parseInt(item.ad_count, 10),
        }));
        setAdData(parsedData);
    }, []);

    return (
        <div className="p-4 rounded-lg bg-[#FFF] shadow-md max-w-full h-[500px]">
            <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ width: "100%", height: "100%", borderRadius: "10px" }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {adData.map((data, index) => {
                    const countryInfo = countryCoordinates[data.countryCode];
                    if (!countryInfo) return null;

                    return (
                        <CircleMarker
                            key={index}
                            center={countryInfo.coordinates}
                            radius={Math.sqrt(data.count) * 3}
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
}

export default DashboardMap
