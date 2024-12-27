import { getRequest } from '@/services/backendAPIsServices';
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';

function DashboardAdsClicksChart() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    const handleThemeChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addListener(handleThemeChange);

    return () => {
      darkModeMediaQuery.removeListener(handleThemeChange);
    };
  }, []);

  const [data, setData] = useState({
    week: {
      categories: [],
      series: [
        { name: "Impressions", data: [] },
        { name: "Clicks", data: [] },
      ],
    },
    month: {
      categories: [],
      series: [
        { name: "Impressions", data: [] },
        { name: "Clicks", data: [] },
      ],
    },
    year: {
      categories: [],
      series: [
        { name: "Impressions", data: [] },
        { name: "Clicks", data: [] },
      ],
    },
  });

  const [filter, setFilter] = useState("week");

  const getData = async () => {
    try {
      const response = await getRequest(
        `/api/advertiser/impressiongraph?filter=${filter}`
      );
      if (filter === "week") {
        const impressions = Array(7).fill(0);
        const clicks = Array(7).fill(0);
        const today = new Date().getDay();
        const categories = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          .slice(today + 1).concat(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].slice(0, today + 1));

        response.forEach((item) => {
          const dayIndex = parseInt(item?.groupKey);
          if (!isNaN(dayIndex)) {
            const rotatedIndex = (dayIndex - today - 1 + 7) % 7;
            impressions[rotatedIndex] = parseInt(item?.totalVisits) || 0;
            clicks[rotatedIndex] = parseInt(item?.totalClicks) || 0;
          }
        });

        setData((prevData) => ({
          ...prevData,
          week: {
            categories: categories,
            series: [
              { name: "Impressions", data: impressions },
              { name: "Clicks", data: clicks },
            ],
          },
        }));
      } else if (filter === "month") {
        const impressions = Array(12).fill(0);
        const clicks = Array(12).fill(0);
        const currentMonth = new Date().getMonth();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          .slice(currentMonth + 1).concat(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].slice(0, currentMonth + 1));

        response.forEach((item) => {
          const monthIndex = new Date(Date.parse(item?.groupKey + " 1, 2020")).getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            const rotatedIndex = (monthIndex - currentMonth - 1 + 12) % 12;
            impressions[rotatedIndex] = parseInt(item?.totalVisits) || 0;
            clicks[rotatedIndex] = parseInt(item?.totalClicks) || 0;
          }
        });

        setData((prevData) => ({
          ...prevData,
          month: {
            categories: monthNames,
            series: [
              { name: "Visits", data: impressions },
              { name: "Clicks", data: clicks },
            ],
          },
        }));
      } else if (filter === "year") {
        const yearData = {};
        const currentYear = new Date().getFullYear();
        const years = [];

        response.forEach((item) => {
          const year = parseInt(item.groupKey);
          if (!isNaN(year)) {
            yearData[year] = {
              impressions: parseInt(item.totalVisits) || 0,
              clicks: parseInt(item.totalClicks) || 0,
            };
            if (!years.includes(year)) {
              years.push(year);
            }
          }
        });

        years.sort((a, b) => a - b);

        const categories = years;
        const impressions = years.map(year => yearData[year]?.impressions || 0);
        const clicks = years.map(year => yearData[year]?.clicks || 0);

        setData((prevData) => ({
          ...prevData,
          year: {
            categories: categories,
            series: [
              { name: "Impressions", data: impressions },
              { name: "Clicks", data: clicks },
            ],
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, [filter]);

  const options = {
    chart: {
      type: "bar",
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
    colors: ["#FF8041"
      , "#5B6CFF"],
    xaxis: {
      categories: data[filter].categories,
    },
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div className="text-gray-600 dark:text-[#CBD5E1] bg-white dark:bg-slate-800 p-4 rounded-md shadow-md pt-4">
      <div className="flex justify-between items-center mb-4">
        <label htmlFor="timeFrame" className="block mb-2 font-bold text-lg">
          Ads Impression & Click
        </label>
        <select
          id="timeFrame"
          value={filter}
          onChange={handleFilterChange}
          className="ml-auto py-1.5 px-3 border bg-white dark:bg-slate-800 border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-sm">
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>
      <div className="flex justify-center">
        <Chart options={options} series={data[filter].series} type="bar" height={400} className="w-full" />
      </div>
    </div>
  );
}
export default DashboardAdsClicksChart