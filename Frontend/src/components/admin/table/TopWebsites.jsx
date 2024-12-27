import { getRequest } from "@/services/backendAPIsServices";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";

const TopWebsites = () => {
  const [websites, setWebsites] = useState([]);
  const getTopWebsites = async () => {
    try {
      const result = await getRequest("/api/admin/topwebsites");
      if (result?.topWebsites) {
        setWebsites(result?.topWebsites);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getTopWebsites();
  }, []);
  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-800 p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-4">Top Websites</h2>
      {
        websites?.length===0?<ul><li><p className="bg-white  border-b hover:bg-gray-100">No Data Found</p></li></ul>: <ul className="space-y-2 overflow-y-auto pr-2 h-[20rem]">
        {websites.map((website, index) => (
          <li key={index} className="flex items-center justify-between pb-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center border h-8 w-8 rounded-lg">{index+1}</div>
              <span className="font-medium text-md capitalize">
                {website?.website_name}
              </span>
            </div>
            <span className="text-gray-900 text-md dark:text-[#CBD5E1]">
              {website?.visitor_count}
              <p className="text-xs text-gray-400  dark:text-[#CBD5E1]">
                Visitors
              </p>
            </span>
          </li>
        ))}
      </ul>
      }
     
    </div>
  );
};

export default TopWebsites;
