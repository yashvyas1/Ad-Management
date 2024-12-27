import { getRequest } from "@/services/backendAPIsServices";
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

function PublisherDashboardDevicePiechart() {
  const [totalDevices, setTotalDevices] = useState(0);
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

  const getDevices = async () => {
    try {
      const response = await getRequest("/api/publisher/devicecount");
      if (response?.deviceTypeCounts && response.deviceTypeCounts.length > 0) {
        // Calculate the total count of all devices
        const totalCount = response.deviceTypeCounts.reduce(
          (sum, device) => sum + Number(device.device_count),
          0
        );
        setTotalDevices(totalCount);

        // Extract device counts and labels for the chart
        const seriesData = response.deviceTypeCounts.map(device =>
          Number(device.device_count)
        );
        const labelsData = response.deviceTypeCounts.map(
          device => device.device_type
        );

        // Update chart data
        setChartData(prevData => ({
          ...prevData,
          series: seriesData,
          options: {
            ...prevData.options,
            labels: labelsData,
          },
        }));
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
      <div className="flex-1 mt-6 mb-0 relative flex justify-center">
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="donut"
          width="100%"
          height={270}
        />
        <div className="absolute top-36 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-[#212227]">
          <p className="text-sm">Total Devices</p>
          <p className="text-center"> {totalDevices || 0}</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center mt-4">
        {chartData.options.labels.map((label, index) => (
          <div key={index} className="flex items-center mb-2 ms-2">
            <div
              className="w-3 h-3 rounded-md mr-1"
              style={{ backgroundColor: chartData.options.colors[index] }}
            ></div>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublisherDashboardDevicePiechart;