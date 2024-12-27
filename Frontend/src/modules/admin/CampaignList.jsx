import CampaignListTable from "@/components/admin/table/CampaignListTable";
import Button from "@/components/ui/Button";
import Icons from "@/components/ui/Icon";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import Datepicker from "react-tailwindcss-datepicker";
function CampaignList() {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  return (
       <div className="">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 p-1">
        <div className="text-lg font-semibold">Campaign List</div>
        <div className="w-full sm:w-auto">
          <div className="relative border rounded-md p-1">
            <Datepicker
              className="w-full h-12"
              popoverDirection="down"
              value={value}
              onChange={(newValue) => setValue(newValue)}
            />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-3">
        <div className="w-full p-4 mb-2">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full space-y-4 sm:space-y-0">
            <div className="flex flex-col md:flex-row justify-between gap-2 items-center space-y-2 md:space-y-0 w-full sm:w-auto">
              <div className="w-78 sm:w-1/2 mb-4 sm:mb-0 relative bg-white dark:bg-slate-800">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-3 bg-white dark:bg-slate-800  dark:text-[#CBD5E1] px-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="absolute left-4 top-2/4 transform -translate-y-2/4 text-gray-400" />
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <select className="w-full  bg-white dark:bg-slate-800 py-3 border rounded-md text-gray-600 dark:text-[#CBD5E1] focus:outline-none">
                  <option value="">Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 gap-2">
                <Button className="text-gray-600 dark:text-[#CBD5E1]   border dark:border-slate-200 rounded-md w-full ">
                <Icons icon="pajamas:import" className="mt-1 me-2"/>  <p>Import</p>
                </Button>
                <Button className="text-gray-600 dark:text-[#CBD5E1] border dark:border-slate-200 rounded-md w-full">
                <Icons icon="pajamas:export" className="mt-1 me-2"/>     Export
                </Button>
              </div>
            </div>
          </div>
        </div>
        <CampaignListTable />
      </div>
    </div>
  );
}

export default CampaignList;
