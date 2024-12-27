import React, {
    useCallback,
    useEffect,
    useState,
    useRef,
    useMemo,
  } from "react";
  import { CiSearch } from "react-icons/ci";
  import Icons from "@/components/ui/Icon";
  import useModal from "@/hooks/useModal";
  import Datepicker from "react-tailwindcss-datepicker";
  import Modal from "@/components/common/Modal";
  import { RxCross1 } from "react-icons/rx";
  import {
    getRequest,
    patchRequest,
    deleteRequest,
  } from "@/services/backendAPIsServices";
  import PaginationFile from "../pagination/PaginationFile";
  import { FiMoreVertical } from "react-icons/fi";
  import { toast } from "react-toastify";
  import { RiVerifiedBadgeLine } from "react-icons/ri";
  import { MdOutlineDoNotDisturb } from "react-icons/md";
  import "react-datepicker/dist/react-datepicker.css";
  import DatePicker from "react-datepicker";
  import PhoneInput from "react-phone-input-2";
  import "react-phone-input-2/lib/style.css";
  
  const AdminUsersTables = ({ insightViewHandler }) => {
    const { isModalOpen, modalContent, openModal, closeModal } = useModal();
    const [isCheck, setIsCheck] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showBankDetailsModal, setshowBankDetailsModal] = useState(false);
    const [joiningDate, setJoiningDate] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("");
  
    const handleJoiningDateChange = (date) => {
      setJoiningDate(date);
    };
    const [submitting, setSubmitting] = useState(false);
    const [endIndex, setEndIndex] = useState(0);
    const [activeTab, setActiveTab] = useState("Publishers Details");
    const [value, setValue] = useState({
      startDate: null,
      endDate: null,
    });
    const modalRef = useRef(null);
    const closeModalAndReset = () => {
      setShowAddUserModal(false);
      setShowEditUserModal(false);
      setshowBankDetailsModal(false);
    };
  
    const handleActionChange = (action, row) => {
      let modalContentString =
        action === "Pause"
          ? "Are you sure you want to pause the ad ?"
          : action === "Stop"
          ? "Are you sure you want to stop the ad ?"
          : action === "Delete"
          ? "Are you sure you want to delete the ad ?"
          : action === "Approve"
          ? "Are you sure you want to approve the ad ?"
          : action === "Decline"
          ? "Are you sure you want to decline the ad ?"
          : action === "Resume"
          ? "Are you sure you want to resume the ad?"
          : "";
      if (action === "View") {
        openModal("AdsViewModal", { row });
      } else if (action === "Preview") {
        openModal("ImagePreviewModal", { row });
      } else {
        setModalMessage(modalContentString);
        setSelectedAction(action);
        setSelectedRow(row);
        setSelectedAction(action.toLowerCase());
        openModal("ActionConfirmationModal", { action });
      }
    };
  
    const handleConfirmAction = async () => {
      try {
        let ad_ids = [];
        if (selectedRows.length > 0) {
          ad_ids = selectedRows;
        } else if (selectedRow?.ad_id) {
          ad_ids = [selectedRow.ad_id];
        }
        if (!Array.isArray(ad_ids) || ad_ids.length === 0) {
          toast.error("No Ads Selected for Action.");
          return;
        }
        if (selectedAction === "delete") {
          const data = { ad_ids };
          // API call to delete the ads
          await deleteRequest("/api/admin/deleteAds", data);
          toast.success("Ads Deleted Successfully.");
        } else if (selectedAction === "approve" || selectedAction === "decline") {
          const permissionStatus =
            selectedAction === "approve" ? "approved" : "decline";
          const data = {
            ad_ids,
            permission: permissionStatus,
          };
          // API call to update ad permissions
          await patchRequest("/api/admin/updateAdPermission", data);
          toast.success(`Ads ${permissionStatus} Successfully.`, {
            className: "capitalize",
          });
        } else {
          const data = {
            ad_ids,
            action: selectedAction.toLowerCase(),
          };
          await patchRequest("/api/admin/updateAdStatus", data);
          toast.success(` Ads ${selectedAction} Successfully`, {
            className: "capitalize",
          });
        }
        setSelectedRows([]);
        getData();
        closeModal();
      } catch (error) {
        console.error("Error performing action:", error);
        toast.error(`Failed to ${selectedAction} the ad.`);
      }
    };
  
    const [data, setData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentRecords, setCurrentRecords] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchByName, setSearchByName] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [permissions, setPermissions] = useState("");
    const [category, setCategory] = useState("");
    const [updatedDate, setUpdatedDate] = useState(null);
    const [debouncedTerm, setDebouncedTerm] = useState(searchByName);
    const [currentPage, setCurrentPage] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(null);
    const dropdownRef = useRef(null);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
  
    const handleSelectAll = (event) => {
      if (event.target.checked) {
        setIsCheck(true);
        setSelectedRows(currentRecords.map((record) => record.ad_id));
      } else {
        setIsCheck(false);
        setSelectedRows([]);
      }
    };
  
    const handleSelectAllData = () => {
      setIsCheck(true);
      setSelectedRows(data?.map((record) => record.ad_id));
    };

    const handleSelectRow = (ad_id) => {
      if (selectedRows.includes(ad_id)) {
        setSelectedRows(selectedRows.filter((row) => row !== ad_id));
      } else {
        setSelectedRows([...selectedRows, ad_id]);
      }
    };
    const toggleMenu = (index) => {
      setIsMenuOpen(isMenuOpen === index ? null : index);
    };
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsMenuOpen(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
    const getData = async () => {
      let query = "?";
      if (type) query += `ad_type=${type}&`;
      if (status) query += `status=${status}&`;
      if (permissions) query += `permission=${permissions}&`;
      if (category) query += `category=${category}&`;
      if (updatedDate?.startDate)
        query += `updatedAt=${
          updatedDate?.startDate?.toISOString().split("T")[0]
        }&`;
      if (value?.startDate && value?.endDate)
        query += `start_date=${
          value?.startDate.toISOString().split("T")[0]
        }&end_date=${value?.endDate.toISOString().split("T")[0]}&`;
  
      query = query.slice(0, -1);
      try {
        const result = await getRequest(
          `/api/admin/getAdvertisementList${query}`
        );
        if (result) {
          setData(result?.ads);
          setTotalRecords(result?.totalRecords);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    useEffect(() => {
      getData();
    }, [type, status, permissions, category, updatedDate, value]);
  
    const handlePageChange = useCallback((pageData, endValue) => {
      setCurrentRecords(pageData);
      setEndIndex(endValue);
    }, []);
  
    const handleClear = () => {
      setType("");
      setPermissions("");
      setSearchByName("");
      setUpdatedDate("");
      setStatus("");
      setValue({
        startDate: null,
        endDate: null,
      });
    };
  
    const search = (e) => {
      const searchValue = e.target.value.toLowerCase();
      if (searchValue.length === 0) {
        getData();
      } else {
        const searchedAds = data?.filter((ad) =>
          ad.ad_name.toLowerCase().includes(searchValue)
        );
        setData(searchedAds);
        setCurrentPage(1);
      }
    };
    const handleTabChange = (tab) => {
      setActiveTab(tab);
    };
  
    useEffect(() => {
      if (data) {
        setData(data);
      }
    }, [data]);
    const handleSubmit = (e) => {
      e.preventDefault();
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setShowAddUserModal(false);
        setShowEditUserModal(false);
        setshowBankDetailsModal(false);
      }, 1000);
    };
    return (
      <div className="min-h-screen lg:p-2 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 p-1 w-full">
          <div className="flex space-x-6 mb-2">
            <button
              onClick={() => handleTabChange("Publishers Details")}
              className={`text-base font-semibold ${
                activeTab === "Publishers Details"
                  ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md"
                  : "text-[#6F6F6F]"
              }`}
            >
              Publishers Details
            </button>
            <button
              onClick={() => handleTabChange("Advertiser Details")}
              className={`text-base font-semibold ${
                activeTab === "Advertiser Details"
                  ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md"
                  : "text-[#6F6F6F]"
              }`}
            >
              Advertiser Details
            </button>
            <button
              onClick={() => handleTabChange("User Details")}
              className={`text-base font-semibold ${
                activeTab === "User Details"
                  ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md"
                  : "text-[#6F6F6F]"
              }`}
            >
              User Details
            </button>
          </div>
          {activeTab === "User Details" && (
            <button
              className="bg-blue-500 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-600 transition"
              onClick={() => setShowAddUserModal(true)}
            >
              Add New User
            </button>
          )}
        </div>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <div className="absolute inset-0 bg-gray-400 bg-opacity-30 backdrop-blur-sm"></div>
            <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add Users</h2>
                <button
                  onClick={closeModalAndReset}
                  className="text-gray-500 text-lg"
                >
                  <RxCross1 />
                </button>
              </div>
              <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User ID<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="E004"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="Prasenjeet Kharat"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email ID<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country={"us"}
                    value={phoneNumber}
                    onChange={(phone, country) => {
                      setPhoneNumber(phone);
                      setCountryCode(country.dialCode);
                    }}
                    containerClass="mt-1"
                    inputClass="p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Joining Date and Time<span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={joiningDate}
                    onChange={handleJoiningDateChange}
                    showTimeSelect
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholderText="Select Joining Date & Time"
                    dateFormat="d-MM-yyyy h:mm aa"
                    timeIntervals={15}
                    popperPlacement="top-start"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="Senior"
                    required
                  />
                </div>
                <div className="col-span-2 flex justify-end mt-4">
                  <button
                    type="submit"
                    className={`bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600 transition ${
                      submitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={submitting}
                  >
                    {submitting ? "Adding..." : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showEditUserModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <div className="absolute inset-0 bg-gray-400 bg-opacity-30 backdrop-blur-sm"></div>
            <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit User</h2>
                <button
                  onClick={closeModalAndReset}
                  className="text-gray-500 text-lg"
                >
                  <RxCross1 />
                </button>
              </div>
              <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User ID
                  </label>
  
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="E004"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="Prasenjeet Kharat"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email ID
                  </label>
                  <input
                    type="email"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="email@example.com"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country={"us"}
                    value={phoneNumber}
                    onChange={(phone, country) => {
                      setPhoneNumber(phone);
                      setCountryCode(country.dialCode);
                    }}
                    containerClass="mt-1"
                    inputClass="p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Joining Date and Time
                  </label>
                  <DatePicker
                    selected={joiningDate}
                    onChange={handleJoiningDateChange}
                    showTimeSelect
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholderText="Select Joining Date & Time"
                    dateFormat="d-MM-yyyy h:mm aa"
                    timeIntervals={15}
                    popperPlacement="top-start"
                    disabled
                  />
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="Senior"
                    required
                  />
                </div>
                <div className="col-span-2 flex justify-end mt-4">
                  <button
                    type="submit"
                    className={`bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600 transition ${
                      submitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {showBankDetailsModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <div className="absolute inset-0 bg-gray-400 bg-opacity-30 backdrop-blur-sm"></div>
            <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-xl lg:max-w-xl w-full z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Bank Details</h2>
                <button
                  onClick={closeModalAndReset}
                  className="text-gray-500 text-lg"
                >
                  <RxCross1 />
                </button>
              </div>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Name
                  </label>
  
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="SBI"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="Pune"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="Prasenjeet Kharat"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="SBIN0009726"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 ">
                    Account Number
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="1234567890"
                    disabled
                  />
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="bg-white rounded-md p-3 shadow-lg mt-2">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
              <div className="flex items-center border border-gray-300 p-3 rounded-xl w-full md:w-2/3 lg:w-[24rem] bg-white shadow-sm">
                <CiSearch className="text-gray-400 text-xl mx-2" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full focus:outline-none text-gray-600"
                  onChange={(e) => {
                    search(e);
                  }}
                />
              </div>
  
              <div className="w-full lg:w-auto">
                <div className="relative rounded-lg border border-gray-300 py-1 w-full">
                  <Datepicker
                    useRange={false}
                    asSingle={true}
                    value={updatedDate}
                    placeholder="Updated Date"
                    onChange={(newValue) => setUpdatedDate(newValue)}
                    inputClassName="w-full py-2 px-3 text-gray-500 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
  
            <div className="flex space-x-4 items-center w-full md:w-auto justify-end">
              {selectedRows?.length > 0 && (
                <div className="flex space-x-4 justify-end mt-4 lg:mt-0">
                  <div className="relative group">
                    <button
                      className="flex items-center text-red-600 shadow-sm hover:bg-red-100 transition-all"
                      onClick={() => handleActionChange("Delete", selectedRows)}
                    >
                      <Icons
                        icon="mdi:delete-circle-outline"
                        width="36"
                        height="36"
                      />
                    </button>
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Delete
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
  
          <div className="w-full">
            <div className="w-full bg-white rounded-lg ">
              {selectedRows?.length > 0 ? (
                <div className="text-center mb-1 text-sm font-semibold">
                  {` All ${selectedRows?.length} ads on this page are selected. `}
                  <button
                    className="text-indigo-500"
                    onClick={handleSelectAllData}
                  >{`Select all ${data?.length} ads`}</button>
                </div>
              ) : (
                ""
              )}
              {activeTab === "Publishers Details" && (
                <>
                  <div className="overflow-x-auto relative">
                    <table className="min-w-full bg-white rounded-lg">
                      <thead>
                        <tr className="bg-[#5B6CFF] text-white rounded-lg">
                          <th className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="checkbox"
                              onChange={handleSelectAll}
                              checked={currentRecords.length > 0 && isCheck}
                            />
                          </th>
                          <th className=" px-4 py-4 whitespace-nowrap">
                            Sr. No.
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Publisher Name
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Email ID
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Phone No.
                          </th>
  
                          <th className="px-4 py-4 whitespace-nowrap">
                            Bank Details
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap">
                            Website Details
                          </th>
  
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Created Date & Time
                          </th>
                          <th className=" px-4 py-4 whitespace-nowrap">
                            Updated Date & Time
                          </th>
                        </tr>
                      </thead>
                      {data?.length === 0 ? (
                        <tbody>
                          <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                              <p className="flex justify-center text-gray-800 text-sm p-4">
                                No Data Found
                              </p>
                              <td></td>
                              <td></td> <td></td>
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody>
                          {currentRecords.map((item, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-300 hover:bg-gray-100 text-center"
                            >
                              <td className="px-4 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedRows.includes(item.ad_id)}
                                  onChange={() => handleSelectRow(item.ad_id)}
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {endIndex + index + 1}
                              </td>
  
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {item?.Advertiser?.User?.name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                vrajpatil4444@gmail.com
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                1234567890
                              </td>
  
                              <td className="text-sm text-blue-500 underline cursor-pointer">
                                <button
                                  className="border p-2 rounded-lg hover:bg-indigo-100"
                                  onClick={() => setshowBankDetailsModal(true)}
                                >
                                  View
                                </button>
                              </td>
                              <td className="text-sm text-blue-500 underline cursor-pointer">
                                <button
                                  className="border p-2 rounded-lg hover:bg-indigo-100"
                                  onClick={() => insightViewHandler("main", item)}
                                >
                                  View
                                </button>
                              </td>
  
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {new Date(item?.createdAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {new Date(item?.updatedAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>
                  </div>
  
                  {/* Sticky Pagination */}
                  <div className="bottom-0 right-0 bg-white p-2">
                    <PaginationFile
                      data={data}
                      itemsPerPage={10}
                      onPageChange={handlePageChange}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </>
              )}
              {activeTab === "Advertiser Details" && (
                <>
                  <div className="overflow-x-auto relative">
                    <table className="min-w-full bg-white rounded-lg">
                      <thead>
                        <tr className="bg-[#5B6CFF] text-white rounded-lg">
                          <th className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="checkbox"
                              onChange={handleSelectAll}
                              checked={currentRecords.length > 0 && isCheck}
                            />
                          </th>
                          <th className=" px-4 py-4 whitespace-nowrap">
                            Sr. No.
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Advertiser Name
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Created Date & Time
                          </th>
                          <th className=" px-4 py-4 whitespace-nowrap">
                            Updated Date & Time
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Email ID
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Phone No.
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Ad Count
                          </th>
                        </tr>
                      </thead>
                      {data?.length === 0 ? (
                        <tbody>
                          <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                              <p className="flex justify-center text-gray-800 text-sm p-4">
                                No Data Found
                              </p>
                              <td></td>
                              <td></td> <td></td>
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody>
                          {currentRecords.map((item, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-300 hover:bg-gray-100 text-center"
                            >
                              <td className="px-4 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedRows.includes(item.ad_id)}
                                  onChange={() => handleSelectRow(item.ad_id)}
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {endIndex + index + 1}
                              </td>
  
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {item?.Advertiser?.User?.name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {new Date(item?.createdAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {new Date(item?.updatedAt).toLocaleString()}
                              </td>
  
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                vrajpatil4444@gmail.com
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                1234567890
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                45
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>
                  </div>
  
                  {/* Sticky Pagination */}
                  <div className="bottom-0 right-0 bg-white p-2">
                    <PaginationFile
                      data={data}
                      itemsPerPage={10}
                      onPageChange={handlePageChange}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </>
              )}
              {activeTab === "User Details" && (
                <>
                  <div className="overflow-x-auto relative">
                    <table className="min-w-full bg-white rounded-lg">
                      <thead>
                        <tr className="bg-[#5B6CFF] text-white rounded-lg">
                          <th className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="checkbox"
                              onChange={handleSelectAll}
                              checked={currentRecords.length > 0 && isCheck}
                            />
                          </th>
                          <th className=" px-4 py-4 whitespace-nowrap">
                            Sr. No.
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap">User ID</th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            User Name
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Created Date & Time
                          </th>
                          <th className=" px-4 py-4 whitespace-nowrap">
                            Updated Date & Time
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Email ID
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap ">
                            Phone No.
                          </th>
  
                          <th className="px-4 py-4 whitespace-nowrap">
                            Joining Date & Time
                          </th>
  
                          {/* <th className="px-4 py-4 whitespace-nowrap">Roles</th> */}
  
                          <th className="px-4 py-4 whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      {data?.length === 0 ? (
                        <tbody>
                          <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                              <p className="flex justify-center text-gray-800 text-sm p-4">
                                No Data Found
                              </p>
                              <td></td>
                              <td></td> <td></td>
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody>
                          {currentRecords.map((item, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-300 hover:bg-gray-100 text-center"
                            >
                              <td className="px-4 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedRows.includes(item.ad_id)}
                                  onChange={() => handleSelectRow(item.ad_id)}
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {endIndex + index + 1}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {item?.ad_name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {item?.Advertiser?.User?.name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {new Date(item?.createdAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {new Date(item?.updatedAt).toLocaleString()}
                              </td>
  
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                vrajpatil4444@gmail.com
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                1234567890
                              </td>
  
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {new Date(item?.end_date).toLocaleString()}
                              </td>
  
                              {/* 
                                                          <td className="p-3 text-sm text-center">
                                                              {item.is_verified ? (
                                                                  <span className="flex items-center text-sm justify-center text-[#027A48] bg-[#ECFDF3] rounded-full w-24 h-8 mx-auto">
                                                                      Admin
                                                                  </span>
                                                              ) : (
                                                                  <span className="flex items-center text-sm justify-center text-[#B42318] bg-[#FEF3F2] rounded-full w-32 h-8 mx-auto">
                                                                      Publisher
                                                                  </span>
                                                              )}
                                                          </td> */}
  
                              {/* <td className="p-2 text-sm relative">
                                                              <button onClick={() => toggleMenu(index)}>
                                                                  <FiMoreVertical />
                                                              </button>
                                                              {isMenuOpen === index && (
                                                                  <div
                                                                      className="absolute right-11 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg"
                                                                      ref={dropdownRef}
                                                                  >
                                                                      <ul className="py-3">
                                                                          <li
                                                                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                                              onClick={() => setShowEditUserModal(true)}
                                                                          >
                                                                              Edit
                                                                          </li>
  
                                                                          
                                                                      </ul>
                                                                  </div>
                                                              )}
                                                          </td> */}
                              <td className="p-2 text-sm ms-3">
                                <div className="relative group">
                                  <button
                                    className="flex items-center justify-center ml-7 w-8 h-8 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-100 transition-all"
                                    onClick={() => setShowEditUserModal(true)}
                                  >
                                    <Icons
                                      icon="akar-icons:edit"
                                      width="16"
                                      height="16"
                                    />
                                  </button>
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Edit
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>
                  </div>
  
                  {/* Sticky Pagination */}
                  <div className="bottom-0 right-0 bg-white p-2">
                    <PaginationFile
                      data={data}
                      itemsPerPage={10}
                      onPageChange={handlePageChange}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <Modal onConfirm={handleConfirmAction} />
      </div>
    );
  };
  
  export default AdminUsersTables;
  
  
  