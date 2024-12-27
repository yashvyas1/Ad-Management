import { getRequest } from "@/services/backendAPIsServices";
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

function DashboardDevicePiechart() {
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
      labels: ["Mobiles", "Tablets", "Computers"],
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

  useEffect(() => {
    const fetchData = async () => {
      const response = await getRequest("/api/admin/devicetypecount"); // replace with actual API endpoint
      const data = response;
      const deviceLabels = data.map((item) => item.device_type);
      const deviceCounts = data.map((item) => parseInt(item.device_count, 10));
      const total = deviceCounts.reduce((acc, curr) => acc + curr, 0);

      setTotalDevices(total);
      setChartData((prevState) => ({
        ...prevState,
        series: deviceCounts,
        options: {
          ...prevState.options,
          labels: deviceLabels,
        },
      }));
    };

    fetchData();
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  font-bold text-[#212227]">
          <p className="text-sm">Total Devices</p>
          <p className="text-center"> {totalDevices}</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center mt-4">
        <div className="flex items-center mb-2 ms-2">
          <div className="w-3 h-3 rounded-md bg-[#4F46E5] mr-1"></div>
          <span className="text-sm">Mobiles</span>
        </div>
        <div className="flex items-center mb-2 ms-2">
          <div className="w-3 h-3 rounded-md bg-[#F59E0B] mr-1"></div>
          <span className="text-sm">Tablets</span>
        </div>
        <div className="flex items-center mb-2 ms-2">
          <div className="w-3 h-3 rounded-md bg-[#0EA5E9] mr-1"></div>
          <span className="text-sm">Computers</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardDevicePiechart;
