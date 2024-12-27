import Modal from "@/components/common/Modal";
import useModal from "@/hooks/useModal";
import { getName } from "country-list";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPen, FaUserCircle } from "react-icons/fa";

const ProfileSetting = () => {
  const [profileData, setProfileData] = useState({
    name: "Rutuja Kamble",
    email: "rutuja@gmail.com",
    mobileno: "+919654876832",
    country: "IN",
    profileImage: "",
  });

  const { t } = useTranslation();

  const { openModal } = useModal();

  const handleSave = (updatedData) => {
    setProfileData(updatedData);
  };

  const countryName = getName(profileData.country);

  return (
    <div className="bg-white h-screen flex flex-col gap-8 rounded-md shadow-md px-16 py-8">
      <div className="flex gap-4 flex-wrap md:flex-nowrap">
        <div className="w-full md:w-1/3">Profile</div>
        <div className="flex gap-8 items-center">
          <div
            className="relative w-24 h-24 cursor-pointer"
            onClick={() => openModal("AdminUploadImageModal")}
          >
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-gray-400" />
            )}
            <FaPen className="absolute bottom-2 right-2 text-blue-500 bg-white p-1 h-6 w-6 rounded-full" />
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-bold">{profileData.name}</div>
            <div className="text-base">{profileData.email}</div>
            <div className="border-b border-black-500 mt-2"></div>
          </div>
        </div>
      </div>
      <div className="border-b border-[#E6EAEF] mt-4"></div>
      <div className="flex justify-between gap-4 flex-wrap md:flex-nowrap">
        <div className="w-full md:w-1/3">User Details</div>
        <div className="flex flex-col w-full md:w-2/3">
          <div
            className="ml-auto flex items-center"
            onClick={() => openModal("AdminProfileSettingModal")}
          >
            <div className="text-blue-500 cursor-pointer">Edit</div>
            <FaPen className="text-blue-500 ml-2 cursor-pointer" />
          </div>

          <div className="flex flex-col gap-8 w-full">
            <div className="flex gap-8 items-center justify-between flex-wrap md:flex-nowrap">
              <div className="flex flex-col gap-2 w-full">
                <label className="font-medium">Full Name</label>
                <div className="border border-gray-300 rounded-md p-2 w-full">
                  {profileData.name}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="font-medium">Email ID</label>
                <div className="border border-gray-300 text-[#939393] rounded-md p-2 w-full">
                  {profileData.email}
                </div>
              </div>
            </div>
            <div className="flex gap-8 items-center justify-between flex-wrap md:flex-nowrap">
              <div className="flex flex-col gap-2 w-full">
                <label className="font-medium">Mobile No</label>
                <div className="border w-full border-gray-300 rounded-md p-2">
                  {profileData.mobileno}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="font-medium">Country</label>
                <div className="border w-full border-gray-300 text-[#939393] rounded-md p-2">
                  {countryName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal data={profileData} onSave={handleSave} />
    </div>
  );
};

export default ProfileSetting;
