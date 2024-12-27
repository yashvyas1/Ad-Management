import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { getRequest } from "@/services/backendAPIsServices";

function AdAnalyticsLineGraph() {

  const [data, setData] = useState({
    week: {
      categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      series: [
        { name: "Visits", data: [60, 70, 45, 90, 78, 85, 60] },
        { name: "Clicks", data: [55, 65, 40, 75, 65, 78, 58] },
      ],
    },
    month: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      series: [
        { name: "Visits", data: [300, 450, 400, 600, 700, 800, 750, 650, 700, 720, 780, 810] },
        { name: "Clicks", data: [280, 420, 380, 570, 680, 760, 730, 620, 680, 710, 750, 790] },
      ],
    },
    year: {
      categories: ["2019", "2020", "2021", "2022", "2023"],
      series: [
        { name: "Visits", data: [3000, 3500, 3200, 4000, 4200] },
        { name: "Clicks", data: [2900, 3300, 3100, 3800, 4100] },
      ],
    },
  });

  const [filter, setFilter] = useState("week");

  const getData = async () => {
    try {
      const response = await getRequest(`/api/admin/impressionsgraph?filter=${filter}`);
      if (filter === "week") {
        const visits = Array(7).fill(0);
        const clicks = Array(7).fill(0);
        const categories = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        response.forEach((item) => {
          const dayIndex = parseInt(item.groupKey);
          if (!isNaN(dayIndex)) {
            visits[dayIndex] = parseInt(item.totalVisits) || 0;
            clicks[dayIndex] = parseInt(item.totalClicks) || 0;
          }
        });

        setData((prevData) => ({
          ...prevData,
          week: {
            categories: categories,
            series: [
              { name: "Visits", data: visits },
              { name: "Clicks", data: clicks },
            ],
          },
        }));
      } else if (filter === "month") {
        const visits = Array(12).fill(0);
        const clicks = Array(12).fill(0);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        response.forEach((item) => {
          const monthIndex = new Date(Date.parse(item.groupKey + " 1, 2020")).getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            visits[monthIndex] = parseInt(item.totalVisits) || 0;
            clicks[monthIndex] = parseInt(item.totalClicks) || 0;
          }
        });

        setData((prevData) => ({
          ...prevData,
          month: {
            categories: monthNames,
            series: [
              { name: "Visits", data: visits },
              { name: "Clicks", data: clicks },
            ],
          },
        }));
      } else if (filter === "year") {
        const visits = [];
        const clicks = [];
        const categories = [];

        response.forEach((item) => {
          const year = item.groupKey;
          categories.push(year);
          visits.push(parseInt(item.totalVisits) || 0);
          clicks.push(parseInt(item.totalClicks) || 0);
        });

        setData((prevData) => ({
          ...prevData,
          year: {
            categories: categories,
            series: [
              { name: "Visits", data: visits },
              { name: "Clicks", data: clicks },
            ],
          },
        }));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    getData();
  }, [filter]);

  const options = {
    chart: {
      type: "line",
      height: 400,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#5765FF", "#FFA07A"],
    xaxis: {
      categories: data[filter].categories,
    },
    markers: {
      size: 6,
      colors: ["#5765FF", "#FFA07A"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    legend: {
      position: "bottom",
    },
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div className="text-gray-600 dark:text-[#CBD5E1] bg-white dark:bg-slate-800 p-4 rounded-md shadow-md pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-lg font-semibold text-[#212227]">Ads Analytics</h2>
        <select
          id="timeFrame"
          value={filter}
          onChange={handleFilterChange}
          className="ml-auto py-2 px-3 border bg-white dark:bg-slate-800 border-[#E6EAEF] rounded-md focus:outline-none focus:ring focus:ring-blue-300 font-semibold text-sm"
        >
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>
      <div className="w-full justify-center">
        <Chart
          options={options}
          series={data[filter].series}
          type="line"
          height={400}
          width="100%"
        />
      </div>
    </div>
  );
}

export default AdAnalyticsLineGraph;
