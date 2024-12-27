import React, { useState } from "react";
import Chart from "react-apexcharts";

function AdminCostLineGraph() {
  const [filter, setFilter] = useState("week");

  const data = {
    week: [80, 100, 90, 70, 110, 120, 100], 
    month: [400, 600, 500, 700],
    year: [
      3000, 3200, 3100, 2800, 3500, 3600, 3700, 4000, 4200, 3800, 3900, 4500,
    ], 
  };

  const categories = {
    week: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    month: ["Week 1", "Week 2", "Week 3", "Week 4"],
    year: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
  };

  const series = [
    {
      name: "Cost",
      data: data[filter],
    },
  ];

  const options = {
    chart: {
      type: "area", 
      height: 350,
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: categories[filter],
    },
    yaxis: {
      title: {
        text: "Cost ($)",
      },
      labels: {
        formatter: (val) => `$${val}`,
      },
    },
    fill: {
      type: "gradient", 
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3, 
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#009FFF1A", 
            opacity: 0.7,
          },
          {
            offset: 100,
            color: "#1E90FF", 
            opacity: 0.3,
          },
        ],
      },
    },
    stroke: {
      curve: "smooth", 
      width: 2,
      colors: ["#1E90FF"], 
    },
    title: {
      text: "",
      align: "left",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#263238",
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  return (
    <div className="grid w-full grid-cols-1 bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <label htmlFor="timeFrame" className="block mb-2 font-bold text-lg">
          Advertisement Cost
        </label>
        <select
          id="timeFrame"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="ml-auto p-1 border bg-white dark:bg-slate-800 border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-sm"
        >
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

      <div className="flex justify-center">
        <Chart
          options={options}
          series={series}
          type="area"
          height={280}
          className="w-full max-w-4xl"
        />
      </div>
    </div>
  );
}

export default AdminCostLineGraph;
