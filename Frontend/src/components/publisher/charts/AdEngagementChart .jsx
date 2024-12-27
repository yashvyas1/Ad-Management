import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { getRequest } from "@/services/backendAPIsServices";

function AdEngagementChart() {
  const [filter, setFilter] = useState("week");

  const [data, setData] = useState({
    week: {
      categories: [],
      series: [{ name: "Visits", data: [] }],
    },
    month: {
      categories: [],
      series: [{ name: "Visits", data: [] }],
    },
    year: {
      categories: [],
      series: [{ name: "Visits", data: [] }],
    },
  });

  const getData = async () => {
    try {
      const result = await getRequest(
        `/api/publisher/websitegraph?filter=${filter}`
      );

      if (filter === "week") {
        const visits = Array(7).fill(0);
        const categories = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        result.forEach((item) => {
          const dayIndex = parseInt(item.groupKey);
          if (!isNaN(dayIndex)) {
            visits[dayIndex] = parseInt(item.totalVisits) || 0;
          }
        });

        setData((prevData) => ({
          ...prevData,
          week: {
            categories: categories,
            series: [{ name: "Visits", data: visits }],
          },
        }));
      } else if (filter === "month") {
        const visits = Array(12).fill(0);
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        result.forEach((item) => {
          const monthName = item.groupKey;
          const monthIndex = new Date(
            Date.parse(monthName + " 1, 2020")
          ).getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            visits[monthIndex] = parseInt(item.totalVisits) || 0;
          }
        });

        setData((prevData) => ({
          ...prevData,
          month: {
            categories: monthNames, // Use static month names for labels
            series: [{ name: "Visits", data: visits }],
          },
        }));
      } else if (filter === "year") {
        const visits = [];
        const categories = [];

        result.forEach((item) => {
          const year = item.groupKey;
          categories.push(year);
          visits.push(parseInt(item.totalVisits) || 0);
        });

        setData((prevData) => ({
          ...prevData,
          year: {
            categories: categories,
            series: [{ name: "Visits", data: visits }],
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
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: "55%",
        borderRadius: 8,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#5765FF"],
    xaxis: {
      categories: data[filter].categories,
    },
    markers: {
      size: 6, // Set the size of the markers (dots)
      colors: ["#5768FF"], // Color of the dots
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8, // Increase size on hover
      },
    },
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div className="text-gray-600 dark:text-[#CBD5E1] bg-white dark:bg-slate-800 p-4 rounded-md shadow-md pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <h2 className="text-lg font-semibold text-[#212227]">AD Engagement</h2>
        <select
          id="timeFrame"
          value={filter}
          onChange={handleFilterChange}
          className="ml-auto py-2 px-3 border bg-white dark:bg-slate-800 border-[#E6EAEF] rounded-md focus:outline-none focus:ring focus:ring-blue-300 font-semibold text-sm"
        >
          <option className="text-[#334168]" value="week">
            Weekly
          </option>
          <option className="text-[#334168]" value="month">
            Monthly
          </option>
          <option className="text-[#334168]" value="year">
            Yearly
          </option>
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

export default AdEngagementChart;
