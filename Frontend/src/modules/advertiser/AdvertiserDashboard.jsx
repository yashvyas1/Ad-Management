import DashboardAdsClicksChart from '@/components/advertiser/charts/DashboardAdsClicksChart';
import DashboardDeviceChart from '@/components/advertiser/charts/DashboardDeviceChart';
import DashboardMap from '@/components/advertiser/map/DashboardMap';
import DashboardTopAds from '@/components/advertiser/table/DashboardTopAds';
import Card from '@/components/ui/Card';
import { getRequest } from '@/services/backendAPIsServices';
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdvertiserDashboard = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState([
    { name: "Total Ads", count: "", bgColor: "bg-info-50" },
    { name: "Active Ads", count: "", bgColor: "bg-primary-50" },
    { name: "Total Clicks", count: "", bgColor: "bg-warning-50" },
    { name: "Total CTR", count: "", bgColor: "bg-info-50" },
  ]);

  useEffect(() => {
    if (location.state?.success) {
      toast.success(location.state?.success);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const response = await getRequest("/api/advertiser/overview")
    setCardData((prevCardData) =>
      prevCardData.map((card) => {
        switch (card.name) {
          case "Total Ads":
            return { ...card, count: response?.adCount || 0 };
          case "Active Ads":
            return { ...card, count: response?.activeAdCount || 0 };
          case "Total Clicks":
            return { ...card, count: response?.totalClicks || 0 };
          case "Total CTR":
            return { ...card, count: parseInt(response?.totalCtr || 0) };
          default:
            return card;
        }
      })
    );
  };

  return (
    <div className="dark:bg-slate-900 text-gray-600 dark:text-[#CBD5E1]">
      <div className="mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardData?.map((item, index) => (
            <Card
              key={index}
              title={item?.name}
              className="shadow-md text-center"
              bodyClass="p-6"
              titleClass="text-lg font-bold text-gray-600 dark:text-[#CBD5E1]"
              bgColor={item?.bgColor}
              icon={item?.icon}
            >
              <p className="text-xl font-semibold text-gray-600 dark:text-[#CBD5E1] mt-0">
                {item?.count || 0}
              </p>
            </Card>
          ))}
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-[74.7%_24.1%] gap-4 w-full mt-4">
          <DashboardAdsClicksChart />
          <DashboardTopAds />
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-[74.7%_24.1%] gap-4 w-full mt-4">
          <DashboardMap />
          <DashboardDeviceChart />
        </div>
      </div>
    </div>
  )
}

export default AdvertiserDashboard