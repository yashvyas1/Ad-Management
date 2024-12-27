import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';

function AdEngagementChart() {
  const [timeFrame, setTimeFrame] = useState('weeks'); 
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

  const data = {
    weeks: {
      categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      series: [
        { name: 'AD Engagement', data: [1400, 1000, 630, 800, 1300, 600, 400] },
      ],
    },
    months: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
      series: [
        { name: 'AD Engagement', data: [1200, 1000, 800, 1300, 1400, 900, 700, 1300, 800, 900, 1200, 1400] },
      ],
    },
    years: {
      categories: ['2019','2020','2021', '2022', '2023', '2024'],
      series: [
        { name: 'AD Engagement', data: [900, 1350, 600, 1170, 850, 1345] },
      ],
    },
  };

  const options = {
    chart: {
      type: 'line',
      height: 400,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'straight',
      width: 3,
    },
    markers: {
      size: 6, 
      colors: ['#5768FF'],
      hover: {
        size: 10,
        fillColor: '#FF864A',
      },
    },
    colors: isDarkMode ? ['#34D399'] : ['#008FFB'],
    xaxis: {
      categories: data[timeFrame].categories,
      labels: {
        style: {
          fontSize: '14px',
          fontWeight: 400,
          colors: isDarkMode ? '#fff' : '#4E4E4E',
        },
      },
    },
    yaxis: {
      min: 0,
      max: 1500, 
      tickAmount: 6,
      labels: {
        style: {
          fontSize: '14px',
          fontWeight: 600,
          colors: isDarkMode ? '#fff' : '#65739A',
        },
      },
    },
    tooltip: {
      enabled: true,
      style: {
        fontSize: '14px',
      },
      y: {
        formatter: (val) => `${val}`,
      },
    },
    grid: {
      borderColor: isDarkMode ? '#333' : '#B5C3EA', 
      strokeDashArray: 4,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '14px',
      labels: {
        colors: isDarkMode ? '#fff' : '#65739A', 
      },
    },
  };

  const handleTimeFrameClick = (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
  };

  return (
    <div className="w-[66.1rem] bg-white p-4 rounded-xl shadow-md pt-4">
      <div className="flex justify-between items-center mb-4">
        <h1 htmlFor="timeFrame" className="block mb-2 pl-5 text-3xl font-semibold">
          AD Engagement
        </h1>
        <div className="flex space-x-4 text-base font-semibold text-[#65739A]">
          <span
            className={`cursor-pointer ${timeFrame === 'weeks' ? 'text-[#334168]' : ''}`}
            onClick={() => handleTimeFrameClick('weeks')}
          >
            WEEKS
          </span>
          <span
            className={`cursor-pointer ${timeFrame === 'months' ? 'text-[#334168]' : ''}`}
            onClick={() => handleTimeFrameClick('months')}
          >
            MONTHS
          </span>
          <span
            className={`cursor-pointer ${timeFrame === 'years' ? 'text-[#334168]' : ''}`}
            onClick={() => handleTimeFrameClick('years')}
          >
            YEARS
          </span>
        </div>
      </div>
      <div className="flex">
        <Chart options={options} series={data[timeFrame].series} type="line" height={400} width={1025} />
      </div>
    </div>
  );
}

export default AdEngagementChart;