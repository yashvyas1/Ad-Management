import React from "react";
import Chart from "react-apexcharts";

function AdRevenueBarChart({ filter }) {
    // Static data for each filter
    const staticData = {
        week: {
            categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            series: [{ name: "Revenue", data: [60, 100, 80, 40, 110, 90, 100] }],
        },
        month: {
            categories: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            ],
            series: [{ name: "Revenue", data: [300, 250, 400, 500, 350, 450, 600, 400, 380, 420, 410, 480] }],
        },
        year: {
            categories: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"],
            series: [{ name: "Revenue", data: [2000, 3000, 2500, 2800, 3200, 3500, 3700] }],
        },
    };

    const options = {
        chart: {
            type: "bar",
            height: '100%',
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: "50%",
            },
        },
        dataLabels: {
            enabled: false,
        },
        colors: ["#A5B4FC"],
        xaxis: {
            categories: staticData[filter].categories,
        },
        yaxis: {
            labels: {
                formatter: (value) => `$${value}`,
            },
            title: {
                style: {
                    color: "#6B7280",
                    fontWeight: 600,
                },
            },
        },
        tooltip: {
            y: {
                formatter: (value) => `$${value}`,
            },
        },
        responsive: [
            {
                breakpoint: 1024,
                options: {
                    plotOptions: {
                        bar: {
                            columnWidth: "60%",
                        },
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
                    plotOptions: {
                        bar: {
                            columnWidth: "70%",
                        },
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
                <h2 className="text-lg font-semibold text-[#212227]">Ad Revenue</h2>
            </div>
            <div className="w-full">
                <Chart
                    options={options}
                    series={staticData[filter].series}
                    type="bar"
                    height="400"
                    width="100%"
                />
            </div>
        </div>
    );
}

export default AdRevenueBarChart;
