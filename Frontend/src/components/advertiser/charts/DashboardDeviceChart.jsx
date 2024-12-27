import { getRequest } from "@/services/backendAPIsServices";
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

function DashboardDeviceChart() {
    const [chartData, setChartData] = useState({
        series: [],
        options: {
            chart: {
                type: "donut",
                toolbar: {
                    show: false,
                },
            },
            labels: [],
            colors: ["#4F46E5", "#F59E0B", "#0EA5E9"],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: "100%",
                        },
                        legend: {
                            position: "bottom",
                            horizontalAlign: "center",
                        },
                    },
                },
            ],
            tooltip: {
                y: {
                    formatter: (val) => `${val} Devices`,
                },
            },
            legend: {
                show: false,
            },
        },
    });

    const [totalDevices, setTotalDevices] = useState(0);

    const getDevices = async () => {
        try {
            const response = await getRequest("/api/advertiser/devicetypes");
            if (response?.deviceTypes && response.deviceTypes.length > 0) {
                const series = [];
                const labels = [];
                let total = 0;

                response.deviceTypes.forEach(device => {
                    const count = Number(device.device_count);
                    series.push(count);
                    labels.push(device.device_type);
                    total += count;
                });
                setTotalDevices(total);
                setChartData({
                    series,
                    options: {
                        ...chartData.options,
                        labels,
                    },
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getDevices();
    }, []);

    return (
        <div className="border rounded-lg shadow-lg flex flex-col p-4 bg-white dark:bg-slate-800 text-gray-600 dark:text-[#CBD5E1] w-full">
            <h2 className="text-lg font-semibold text-[#212227]">Devices</h2>
            <div className="flex-1 mt-6 mb-0 relative flex items-center justify-center">
                <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="donut"
                    width="100%"
                    height={270}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-[#212227]">
                    <p className="text-sm">Total Devices</p>
                    <p className="text-center">{totalDevices || 0}</p>
                </div>
            </div>
            <div className="flex items-center justify-center mt-4">
                <div className="flex items-center mb-2 ms-2">
                    <div className="w-3 h-3 rounded-md bg-[#4F46E5] mr-1"></div>
                    <span className="text-sm">Mobile</span>
                </div>
                <div className="flex items-center mb-2 ms-2">
                    <div className="w-3 h-3 rounded-md bg-[#F59E0B] mr-1"></div>
                    <span className="text-sm">Tablet</span>
                </div>
                <div className="flex items-center mb-2 ms-2">
                    <div className="w-3 h-3 rounded-md bg-[#0EA5E9] mr-1"></div>
                    <span className="text-sm">Desktop</span>
                </div>
            </div>
        </div>
    );
}

export default DashboardDeviceChart