import AdAnalyticsLineGraph from "@/components/admin/charts/AdAnalyticsLineGraph";
import AdAnalyticsTable from "@/components/admin/table/AdAnalyticsTable";
import React from "react";
import "react-toastify/dist/ReactToastify.css";

const AdminAdAnalytics = () => {
  return (
    <div className=" dark:bg-slate-900 text-gray-600 dark:text-[#CBD5E1] mt-4">
      <div className=" mx-auto ">
        <div>
          <AdAnalyticsLineGraph />
        </div>
        <div>
          <AdAnalyticsTable />
        </div>
      </div>
    </div>
  );
};
export default AdminAdAnalytics;
