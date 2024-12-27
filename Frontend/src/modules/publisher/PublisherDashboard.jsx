import PublisherDashboardBarChart from "@/components/publisher/charts/PublisherDashboardBarChart";
import PublisherDashboardDevicePiechart from "@/components/publisher/charts/PublisherDashboardDevicePiechart";
import AdEngagementChart from "@/components/publisher/charts/AdEngagementChart "
import Card from "@/components/ui/Card";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getRequest } from "@/services/backendAPIsServices";

const PublisherDashboard = () => {
  const [cardData, setCardData] = useState([
    { name: "Active Ads", count: "", bgColor: "bg-primary-50" },
    { name: "Total CPC", count: "", bgColor: "bg-warning-50" },
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

  const getCardData = async () => {
    const result = await getRequest("/api/publisher/overview")
    setCardData((prevCardData) =>
      prevCardData.map((card) => {
        switch (card.name) {
          case "Active Ads":
            return { ...card, count: result.adCount };
          case "Total CPC":
            return { ...card, count: result.cpc };
          case "Total CTR":
            return { ...card, count: parseInt(result.ctr) };
          default:
            return card;
        }
      })
    );
  };

  useEffect(() => {
    getCardData()
  }, [])

  return (
    <div className="">
      <div className="dark:bg-slate-900 text-gray-600 dark:text-[#CBD5E1]">
        <div className="w-full lg:p-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
            </div>
          </div>
          <div className="mx-auto ">
            <div className="grid lg:grid-cols-3 gap-4">
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
                    {item?.count}
                  </p>
                </Card>
              ))}
            </div>

            {/* bar graph  and top website list*/}
            <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-[100%] w-full mt-6 ">
              <PublisherDashboardBarChart />
            </div>

            {/* CampaingTable and pie chart */}
            <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-[70%_29%] gap-4 w-full mt-6">
              <AdEngagementChart />
              <PublisherDashboardDevicePiechart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublisherDashboard;