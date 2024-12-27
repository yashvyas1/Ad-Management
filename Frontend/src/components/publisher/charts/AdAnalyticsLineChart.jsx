import React from "react";
import Chart from "react-apexcharts";

function AdAnalyticsLineChart({ filter }) {
    // Static data for each filter
    const staticData = {
        week: {
            categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            series: [{ name: "CTR", data: [46, 35, 20, 50, 60, 40, 30] }],
        },
        month: {
            categories: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            ],
            series: [{ name: "CTR", data: [40, 30, 20, 50, 60, 70, 40, 30, 20, 60, 70, 50] }],
        },
        year: {
            categories: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"],
            series: [{ name: "CTR", data: [50, 45, 35, 45, 65, 55, 70] }],
        },
    };

    const options = {
        chart: {
            type: "line",
            height: "100%",
            toolbar: {
                show: false,
            },
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        dataLabels: {
            enabled: false,
        },
        colors: ["#FF00FF"], // Pink color for the line
        xaxis: {
            categories: staticData[filter].categories,
        },
        yaxis: {
            labels: {
                formatter: (value) => `${value}%`,
            },
        },
        markers: {
            size: 6,
            colors: ["#5768FF"], // Color of the dots
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 8, // Increase size on hover
            },
        },
        tooltip: {
            y: {
                formatter: (value) => `${value}%`,
            },
        },
        responsive: [
            {
                breakpoint: 1024,
                options: {
                    markers: {
                        size: 5,
                    },
                    xaxis: {
                        labels: {
                            show: true,
                        },
                    },
                },
            },
            {
                breakpoint: 640,
                options: {
                    markers: {
                        size: 4,
                    },
                    xaxis: {
                        labels: {
                            show: true,
                        },
                    },
                },
            },
        ],
    };

    return (
        <div className="text-gray-600 dark:text-[#CBD5E1] bg-white dark:bg-slate-800 p-4 rounded-md shadow-md pt-4 w-full max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-lg font-semibold text-[#212227]">Ad Analytics</h2>
                <select
                    className="ml-auto py-2 px-3 border bg-white dark:bg-slate-800 border-[#E6EAEF] rounded-lg focus:outline-none focus:ring focus:ring-blue-300 font-semibold text-sm"
                >
                    <option value="impressions">Impressions</option>
                    <option value="clicks">Clicks</option>
                    <option value="cpc">CPC</option>
                    <option value="ctr">CTR</option>
                </select>
            </div>
            <div className="w-full">
                <Chart
                    options={options}
                    series={staticData[filter].series}
                    type="line"
                    height="400"
                    width="100%"
                />
            </div>
        </div>
    );
}

export default AdAnalyticsLineChart;
