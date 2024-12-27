import Modal from "@/components/common/Modal";
import useModal from "@/hooks/useModal";
import { getName } from "country-list";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaPen, FaUserCircle } from "react-icons/fa";
import { RiPaletteLine } from "react-icons/ri";
import { ChromePicker } from "react-color";

const ProfileSetting = () => {
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "example@gmail.com",
    mobileno: "+919654876832",
    country: "IN",
    profileImage: "",
  });

  const [selectedColor, setSelectedColor] = useState("#4A90E2"); // Default primary color
  const colors = ["#4A90E2", "#50E3C2", "#B8E986", "#F5A623", "#F8E71C", "#7E51FF", "#FF6F61"];
  const [showPicker, setShowPicker] = useState(false); // Toggle color picker visibility
  const pickerRef = useRef(null); // Reference to the color picker element
  const containerRef = useRef(null); // Reference to the container to calculate position
  const [openUpward, setOpenUpward] = useState(false); // Determine if picker should open upwards

  const { t } = useTranslation();
  const { openModal } = useModal();

  const handleSave = (updatedData) => {
    setProfileData(updatedData);
  };

  const handleColorChange = (color) => {
    // setSelectedColor(color);
    setSelectedColor(color.hex); // Update the selected color
    document.documentElement.style.setProperty("--primary-color", color); // Apply color globally
  };

  // Close the picker when clicking outside
  const handleClickOutside = (event) => {
    if (
      pickerRef.current &&
      !pickerRef.current.contains(event.target) &&
      containerRef.current &&
      !containerRef.current.contains(event.target)
    ) {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    const calculatePosition = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const pickerHeight = 250; // Approx height of ChromePicker
        setOpenUpward(containerRect.bottom + pickerHeight > viewportHeight);
      }
    };

    calculatePosition(); // Calculate position when component mounts
    window.addEventListener("resize", calculatePosition); // Recalculate on resize
    return () => {
      window.removeEventListener("resize", calculatePosition);
    };
  }, [showPicker]);

  // Add event listener for detecting outside clicks
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const countryName = getName(profileData.country);

  return (
    <div className="bg-white flex flex-col gap-8 rounded-md shadow-md px-16 py-8">
      {/* Profile Section */}
      <div className="flex gap-4 flex-wrap md:flex-nowrap">
        <div className="w-full md:w-1/3">Profile</div>
        <div className="flex gap-8 items-center">
          <div
            className="relative w-24 h-24 cursor-pointer"
            onClick={() => openModal("PublisherUploadImageModal")}
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

      {/* User Details Section */}
      <div className="flex justify-between gap-4 flex-wrap md:flex-nowrap">
        <div className="w-full md:w-1/3">User Details</div>
        <div className="flex flex-col w-full md:w-2/3">
          <div
            className="ml-auto flex items-center"
            onClick={() => openModal("PublisherProfileSettingModal")}
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

      <div className="border-b border-[#E6EAEF] mt-4"></div>

      <div className="flex justify-between gap-4 flex-wrap md:flex-nowrap">
        <h3 className="text-lg font-bold mb-4">Theme Customization</h3>

        <div className="border border-gray-300 rounded-lg p-6 w-[52rem]">

          <div className="flex items-center gap-2 mb-4">
            <RiPaletteLine className="text-[#334168]" size={24} />
            <p className="text-xl font-semibold text-[#334168]">Primary Color Settings</p>
          </div>

          <div className="border-t border-gray-300 mb-4"></div>

          <div className="flex gap-3 items-center mb-4 flex-wrap ">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                style={{
                  backgroundColor: color,
                  width: "60px",
                  height: "36px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              ></button>
            ))} 
          </div>

          <div
            ref={containerRef}
            className="relative flex items-center border border-gray-300 rounded-xl p-3 bg-[#F9FAFB] w-full max-w-md"
          >
            <span className="text-[#444444] flex-1">Primary color</span>

            <div
              className="w-8 h-8 rounded-full cursor-pointer border border-gray-300"
              style={{ backgroundColor: selectedColor }}
              onClick={() => setShowPicker(!showPicker)}
            ></div>

            {showPicker && (
              <div
                ref={pickerRef}
                style={{
                  position: "absolute",
                  zIndex: 10,
                  marginBottom: openUpward ? "8px" : undefined,
                  marginTop: !openUpward ? "8px" : undefined,
                  top: openUpward ? "auto" : "100%",
                  bottom: openUpward ? "100%" : "auto",
                  right: "0",
                }}
              >
                <ChromePicker color={selectedColor} onChange={handleColorChange} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal data={profileData} onSave={handleSave} />
    </div>
  );
};

export default ProfileSetting;