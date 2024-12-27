import AdminCostLIneGraph from "@/components/admin/charts/AdminCostLIneGraph";
import AdvertisementMap from "@/components/admin/charts/AdvertisementMap";
import DashboardAdsBarChart from "@/components/admin/charts/DashboardAdsBarChart";
import DashboardDevicePiechart from "@/components/admin/charts/DashboardDevicePiechart";
import TopWebsites from "@/components/admin/table/TopWebsites";
import Card from "@/components/ui/Card";
import { getRequest } from "@/services/backendAPIsServices";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  
  const [cardData, setCardData] = useState([
    { name: "Total Advertisers", count: "", bgColor: "bg-info-50" },
    { name: "Total Publishers", count: "", bgColor: "bg-success-50" },
    { name: "Active Ads", count: "", bgColor: "bg-primary-50" },
    { name: "Total Websites", count: "", bgColor: "bg-warning-50" },
    { name: "Total CTR", count: "", bgColor: "bg-info-50" },
  ]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.success) {
      toast.success(location.state?.success);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname]);

  const getCardData =async ()=>{
    const result = await getRequest("/api/admin/overview")
    setCardData((prevCardData) =>
      prevCardData.map((card) => {
        switch (card.name) {
          case "Total Advertisers":
            return { ...card, count: result.advertiserCount };
          case "Total Publisher":
            return { ...card, count: result.publisherCount };
          case "Active Ads":
            return { ...card, count: result.adCount };
          case "Total CPC":
            return { ...card, count: result.cpc };
          case "Total CTR":
            return { ...card, count: parseInt(result.ctr )};
          default:
            return card;
        }
      })
    );
  };

  useEffect(()=>{
    getCardData()
  },[])
  
  return (
   <>
    <div className="text-lg font-semibold">Dashboard</div>
     <div className=" dark:bg-slate-900 text-gray-600 dark:text-[#CBD5E1] mt-4">
      <div className=" mx-auto ">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cardData?.map((item, index) => (
            <Card
              key={index}
              title={item?.name}
              className="shadow-md rounded-lg text-center"
              bodyClass="p-6"
              titleClass="text-lg font-bold text-gray-600 dark:text-[#CBD5E1]"
              bgColor={item?.bgColor}
              icon={item?.icon}
            >
              <p className="text-xl font-semibold text-gray-600 dark:text-[#CBD5E1] mt-0">
                {item?.count||0}
              </p>
            </Card>
          ))}
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-[70%_30%] gap-4 w-full mt-6 ">
          <DashboardAdsBarChart />
          <TopWebsites />
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-[70%_30%] gap-4 w-full mt-6">
          <AdminCostLIneGraph/>
          <DashboardDevicePiechart />
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-1 gap-4 w-full mt-6">
            <AdvertisementMap/> 
        </div>
      </div>
    </div>
   </>
  );
};

export default AdminDashboard;
