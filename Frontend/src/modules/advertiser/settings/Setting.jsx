import { useState } from "react";
import AccountSetting from "./AccountSetting";
import NotificationSetting from "./NotificationSetting";
import ProfileSetting from "./ProfileSetting";

const Setting = () => {
  const [activeTab, setActiveTab] = useState("Account Setting");
  const navbar = ["Account Setting", "Profile Setting", "Notification Setting"];

  const renderContent = () => {
    return activeTab === "Account Setting" ? (
      <AccountSetting />
    ) : activeTab === "Profile Setting" ? (
      <ProfileSetting />
    ) : activeTab === "Notification Setting" ? (
      <NotificationSetting />
    ) : null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-8 md:gap-16 px-2">
        {navbar.map((tab) => (
          <button
            key={tab}
            className={`py-4 font-semibold font-nunito text-sm md:text-xl ${
              activeTab === tab
                ? "text-[#4880FF] border-b-2 border-[#4880FF]"
                : "text-[#6F6F6F] border-b-2 border-transparent"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};

export default Setting;
