
import React, { useCallback, useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";
import Icons from "@/components/ui/Icon";
import useModal from "@/hooks/useModal";
import Datepicker from "react-tailwindcss-datepicker";
import Modal from "@/components/common/Modal";
import { getRequest, patchRequest, deleteRequest } from "@/services/backendAPIsServices";
import PaginationFile from "../../components/admin/pagination/PaginationFile";
import { FiMoreVertical } from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import moment from "moment";

const Advertisement = () => {
  const { openModal, closeModal } = useModal();
  const [isCheck, setIsCheck] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [endIndex, setEndIndex] = useState(0);
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentRecords, setCurrentRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchByName, setSearchByName] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [updatedDate, setUpdatedDate] = useState(null);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState([]);
  const [activeTab, setActiveTab] = useState("Advertisement");
  const [sortOrder, setSortOrder] = useState({ amount: 'asc', adType: 'asc' });
  const [sortedData, setSortedData] = useState(data);

  const adTypeOptions = [
    { value: 'Banner', label: 'Banner' },
    { value: 'Video', label: 'Video' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'paused', label: 'Pause' },
  ];

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
        await deleteRequest("/api/advertiser/deleteads", data);
        toast.success("Ads Deleted Successfully.");
      } else if (selectedAction === "approve" || selectedAction === "decline") {
        const permissionStatus =
          selectedAction === "approve" ? "approved" : "decline";
        const data = {
          ad_ids,
          permission: permissionStatus,
        };
        // API call to update ad permissions
        await patchRequest("/api/advertiser/updateadstatus", data);
        toast.success(`Ads ${permissionStatus} Successfully.`, {
          className: "capitalize",
        });
      } else {
        const data = {
          ad_ids,
          action: selectedAction.toLowerCase(),
        };
        await patchRequest("/api/advertiser/updateadstatus", data);
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

  const fetchCategories = async () => {
    try {
      const response = await getRequest("/api/advertiser/selected-data");
      if (response?.category) {
        const formattedCategories = response?.category.map((option) => ({
          label: option,
          value: option.toLowerCase(),
        }));
        setCategoryData(formattedCategories);
      }
    } catch (err) {
      console.error("Failed to fetch category data:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    if (type) query += `adType=${type}&`;
    if (status) query += `status=${status}&`;
    if (category) query += `categories=${category}&`;
    if (updatedDate?.startDate)
      query += `updateDate=${moment(updatedDate?.startDate).format("YYYY-MM-DD")}&`;
    if (value?.startDate && value?.endDate)
      query += `startDate=${moment(value?.startDate).format("YYYY-MM-DD")
        }&endDate=${moment(value?.endDate).format("YYYY-MM-DD")}&`;

    query = query.slice(0, -1);

    try {
      const response = await getRequest(
        `/api/advertiser/getadlist${query}`
      );
      if (response?.data) {
        setData(response?.data);
        setSortedData(response?.data);
        setTotalRecords(response?.totalRecords);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getData();
  }, [type, status, category, updatedDate?.startDate, value]);

  const handlePageChange = useCallback((pageData, endValue) => {
    setCurrentRecords(pageData);
    setEndIndex(endValue);
  }, []);

  const handleClear = () => {
    setType("");
    setCategory("");
    setSearchByName("");
    setUpdatedDate("");
    setStatus("");
    setValue({
      startDate: null,
      endDate: null,
    });
  };

  const handleSearchInputChange = (e) => {
    setSearchByName(e.target.value.toLowerCase());
  }

  let debounceTimeout;

  const search = (e) => {
    const searchValue = e.target.value.toLowerCase();
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (searchValue.length === 0) {
        getData();
      } else {
        searchAds(searchValue);
      }
      setCurrentPage(1);
    }, 300);
  };

  const searchAds = async (searchValue) => {
    try {
      const response = await getRequest(`/api/advertiser/searchadsbyname?ad_name=${searchValue}`);
      if (response?.ads) {
        setData(response.ads);
        setCurrentRecords(response.ads.slice(0, 10));
      } else {
        setData([]);
        setCurrentRecords([]);
      }
      setTotalRecords(response?.totalRecords || 0);
    } catch (err) {
      console.error("Error fetching search results:", err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStatus('');
  };

  const sortData = (field, order) => {
    const sorted = [...data].sort((a, b) => {
      if (field === 'amount') {
        return order === 'asc' ? a.ad_budget - b.ad_budget : b.ad_budget - a.ad_budget;
      } else if (field === 'adType') {
        return order === 'asc' ? a.ad_type.localeCompare(b.ad_type) : b.ad_type.localeCompare(a.ad_type);
      }
      return 0;
    });
    setSortedData(sorted);
  };

  const handleSortAmountClick = () => {
    const newOrder = sortOrder.amount === 'asc' ? 'desc' : 'asc';
    setSortOrder((prev) => ({ ...prev, amount: newOrder }));
    sortData('amount', newOrder);
  };

  const handleSortAdTypeClick = () => {
    const newOrder = sortOrder.adType === 'asc' ? 'desc' : 'asc';
    setSortOrder((prev) => ({ ...prev, adType: newOrder }));
    sortData('adType', newOrder);
  };

  return (
    <div className="min-h-screen lg:p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 p-1 w-full mb-2">
        <div className="flex space-x-6 pt-4">
          <button onClick={() => handleTabChange("Advertisement")} className={`text-lg font-semibold ${activeTab === "Advertisement" ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md" : "text-[#6F6F6F]"}`}>Advertisement</button>
          <button onClick={() => handleTabChange("Pending Advertisement")} className={`text-lg font-semibold ${activeTab === "Pending Advertisement" ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md" : "text-[#6F6F6F]"}`}>Pending Advertisement</button>
        </div>
        <div className="w-full sm:w-auto flex flex-col md:flex-row md:space-x-4 gap-2">
          <div className="w-full md:w-auto">
            <label className="text-gray-800 text-sm">Updated Date</label>
            <div className="relative rounded-lg w-full">
              <Datepicker
                useRange={false}
                asSingle={true}
                value={updatedDate}
                onChange={(newValue) => setUpdatedDate(newValue)}
              />
            </div>
          </div>
          {activeTab === "Advertisement" && (
            <div className="w-full md:w-auto">
              <label className="text-gray-800 text-sm">Start and End Date</label>
              <div className="relative rounded-md shadow-sm w-full">
                <Datepicker
                  className="w-full h-12"
                  popoverDirection="down"
                  value={value}
                  onChange={(newValue) => setValue(newValue)}
                />
              </div>
            </div>
          )}
          <div className="pt-6">
            <button
              onClick={() => navigate("/advertiser/ads-list")}
              className="py-2 px-8 bg-[#5B6CFF] text-white rounded-lg font-semibold text-base"
            >Create Ad</button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-3 shadow-lg">
        {activeTab === "Advertisement" ? (
          <>
            <div className="flex flex-col lg:flex-row p-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row md:flex-row flex-wrap items-center gap-2 w-full lg:w-auto">
                <div className="flex items-center border border-gray-300 p-2 text-sm rounded-xl bg-white shadow-sm w-[15rem]">
                  <CiSearch className="text-gray-500 text-2xl mx-1" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="focus:outline-none text-gray-600 w-full"
                    onChange={(e) => {
                      search(e);
                    }}
                  />
                </div>
                <div className="w-[8rem]">
                  <Select
                    key={type}
                    onChange={(option) => setType(option.value)}
                    value={adTypeOptions.find(option => option.value === type)}
                    options={adTypeOptions}
                    placeholder="Ad Type"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '12px',
                        boxShadow: 'none',
                        borderColor: '#D1D5DB',
                        padding: '0.12rem',
                      }),
                      option: (base) => ({
                        ...base,
                        padding: '0.5rem 1rem',
                        color: '#000',
                        cursor: 'pointer',
                      }),
                      menu: (base) => ({
                        ...base,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '0.375rem',
                        overflow: 'hidden',
                        zIndex: 1000,
                        maxHeight: '200px',
                      }),
                      indicatorSeparator: (base) => ({
                        ...base,
                        display: 'none',
                      }),
                    }}
                  />
                </div>
                <div className="w-[8rem]">
                  <Select
                    key={status}
                    onChange={(option) => setStatus(option.value)}
                    value={statusOptions.find(option => option.value === status)}
                    options={statusOptions}
                    placeholder="Status"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '12px',
                        boxShadow: 'none',
                        borderColor: '#D1D5DB',
                        padding: '0.12rem',
                      }),
                      option: (base) => ({
                        ...base,
                        padding: '0.5rem 1rem',
                        color: '#000',
                        cursor: 'pointer',
                      }),
                      menu: (base) => ({
                        ...base,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '0.375rem',
                        overflow: 'hidden',
                        zIndex: 1000,
                        maxHeight: '200px',
                      }),
                      indicatorSeparator: (base) => ({
                        ...base,
                        display: 'none',
                      }),
                    }}
                  />
                </div>
                <div className="w-[11rem]">
                  <Select
                    key={category}
                    onChange={(option) => {
                      setCategory(option ? option.value : "");
                    }}
                    value={categoryData.find(option => option.value === category)}
                    options={categoryData}
                    placeholder="Categories"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '12px',
                        boxShadow: 'none',
                        borderColor: '#D1D5DB',
                        padding: '0.12rem',
                      }),
                      option: (base) => ({
                        ...base,
                        padding: '0.5rem 1rem',
                        color: '#000',
                        cursor: 'pointer',
                      }),
                      menu: (base) => ({
                        ...base,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '0.375rem',
                        overflow: 'hidden',
                        zIndex: 1000,
                        maxHeight: '200px',
                      }),
                      indicatorSeparator: (base) => ({
                        ...base,
                        display: 'none',
                      }),
                    }}
                  />
                </div>
                {type === "" &&
                  searchByName === "" &&
                  status === "" &&
                  category === "" ? (
                  ""
                ) : (
                  <button onClick={handleClear} className="text-blue-600">
                    Clear
                  </button>
                )}
              </div>
              {selectedRows?.length > 0 && (
                <div className="flex space-x-4 justify-end mt-4 lg:mt-0">
                  <div className="relative group">
                    <button
                      className="flex items-center text-green-600 shadow-sm hover:bg-green-100 transition-all"
                      onClick={() => handleActionChange("Resume", selectedRows)}
                    >
                      <Icons icon="heroicons-solid:play" width="36" height="36" />
                    </button>
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Resume
                    </span>
                  </div>
                  <div className="relative group">
                    <button
                      className="flex items-center text-gray-600 shadow-sm hover:bg-gray-100 transition-all"
                      onClick={() => handleActionChange("Pause", selectedRows)}
                    >
                      <Icons icon="gridicons:pause" width="36" height="36" />
                    </button>
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Pause
                    </span>
                  </div>
                  <div className="relative group">
                    <button
                      className="flex items-center text-red-600 shadow-sm hover:bg-red-100 transition-all"
                      onClick={() => handleActionChange("Stop", selectedRows)}
                    >
                      <Icons
                        icon="mynaui:stop-circle-solid"
                        width="36"
                        height="36"
                      />
                    </button>
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Stop
                    </span>
                  </div>
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
            <div className="w-full">
              <div className="w-full bg-white rounded-lg">
                {selectedRows?.length > 0 ? (
                  <div className="text-center mb-1 text-sm font-semibold">
                    {` All ${selectedRows?.length} ads on this page are selected.`}
                    <button
                      className="text-indigo-500"
                      onClick={handleSelectAllData}
                    >{`Select all ${data?.length} ads`}</button>
                  </div>
                ) : (
                  ""
                )}
                <>
                  <div className="overflow-x-auto relative">
                    <table className="min-w-full bg-white rounded-lg">
                      <thead>
                        <tr className="bg-[#5B6CFF] text-white rounded-lg">
                          <th className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="checkbox"
                              onChange={handleSelectAll}
                              checked={
                                (currentRecords.length > 0 && isCheck)
                              }
                            />
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap">Sr. No.</th>
                          <th className="px-4 py-4 whitespace-nowrap">Ad Name</th>
                          <th className="px-4 py-4 whitespace-nowrap">Created Date and Time</th>
                          <th className="px-4 py-4 whitespace-nowrap">Updated Date and Time</th>
                          <th className="px-4 py-4 whitespace-nowrap">Category Name</th>
                          <th className="px-4 py-4 whitespace-nowrap">Status</th>
                          <th className="px-4 py-4 whitespace-nowrap">Start Date and Time</th>
                          <th className="px-4 py-4 whitespace-nowrap">End Date and Time</th>
                          <th className="px-4 py-4 whitespace-nowrap">Insights</th>
                          <th className="px-4 py-4 whitespace-nowrap flex items-center justify-center">
                            Daily Budget
                            {sortOrder.amount === 'asc' ? (
                              <FaAngleUp className="pl-1 cursor-pointer" onClick={handleSortAmountClick} />
                            ) : (
                              <FaAngleDown className="pl-1 cursor-pointer" onClick={handleSortAmountClick} />
                            )}
                          </th>
                          <th className="px-4 py-4 whitespace-nowrap">Preview</th>
                          <th className="px-4 py-4 whitespace-nowrap">Ad Type</th>
                          <th className="px-4 py-4 whitespace-nowrap flex items-center">
                            Ad Count
                            {sortOrder.adType === 'asc' ? (
                              <FaAngleUp className="pl-1 cursor-pointer" onClick={handleSortAdTypeClick} />
                            ) : (
                              <FaAngleDown className="pl-1 cursor-pointer" onClick={handleSortAdTypeClick} />
                            )}
                          </th>
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
                            <td></td>
                            <td></td>
                            <td>
                              <p className="flex justify-center text-gray-800 text-sm p-4">
                                No Data Found
                              </p>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody>
                          {currentRecords.map((item, index) => {
                            const isExpired = new Date(item.end_date) < new Date();
                            return (
                              <tr
                                key={index}
                                className="border-b border-gray-300 hover:bg-gray-100 text-center"
                              >
                                <td className="px-4 py-2 whitespace-nowrap">
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
                                  {moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                  {moment(item?.updatedAt).format("DD/MM/YYYY hh:mm A")}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                  {item?.ad_category}
                                </td>
                                <td className={`capitalize text-sm ${item.status === "active" ? "text-green-600" : "text-red-600"}`}>
                                  {item.status}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  {moment(item?.start_date).format("DD/MM/YYYY hh:mm A")}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  {moment(item?.end_date).format("DD/MM/YYYY hh:mm A")}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <button
                                    className="text-[#5B6CFF] border border-[#5B6CFF] px-2 py-1 rounded-md"
                                    onClick={() => openModal("AdvertiserInsightViewModal")}
                                  >
                                    View
                                  </button>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  ₹ {Number(item?.ad_budget).toLocaleString()}
                                </td>
                                <td className="p-2 text-sm ms-3">
                                  <button
                                    className="text-blue-500 underline"
                                    onClick={() => handleActionChange("Preview", item)}
                                  >
                                    <Icons icon="icon-park-outline:preview-open" width="24" height="24" />
                                  </button>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  {item?.ad_type}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">2</td>
                                <td className="p-2 text-sm relative">
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
                                          onClick={() => handleActionChange("View", item)}
                                        >
                                          View
                                        </li>
                                        <li
                                          className={`px-4 py-2 ${isExpired
                                            ? "hover:bg-gray-100 cursor-pointer"
                                            : "text-gray-400 cursor-not-allowed"
                                            }`}
                                          onClick={isExpired ? () => navigate("/advertiser/ads-list") : null}
                                        >
                                          Reupload
                                        </li>
                                      </ul>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      )}
                    </table>
                  </div>
                  <div className="bottom-0 right-0 bg-white flex justify-end p-2">
                    <PaginationFile
                      data={sortedData}
                      itemsPerPage={10}
                      onPageChange={handlePageChange}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row p-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-col md:flex-row flex-wrap items-center gap-2 w-full lg:w-auto">
                <div className="flex items-center border border-gray-300 p-2 text-sm rounded-xl bg-white shadow-sm w-[15rem]">
                  <CiSearch className="text-gray-500 text-2xl mx-1" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="focus:outline-none text-gray-600 w-full"
                    onChange={(e) => {
                      search(e);
                    }}
                  />
                </div>
                <div className="w-[8rem]">
                  <Select
                    key={type}
                    onChange={(option) => setType(option.value)}
                    value={adTypeOptions.find(option => option.value === type)}
                    options={adTypeOptions}
                    placeholder="Ad Type"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '12px',
                        boxShadow: 'none',
                        borderColor: '#D1D5DB',
                        padding: '0.12rem',
                      }),
                      option: (base) => ({
                        ...base,
                        padding: '0.5rem 1rem',
                        color: '#000',
                        cursor: 'pointer',
                      }),
                      menu: (base) => ({
                        ...base,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '0.375rem',
                        overflow: 'hidden',
                        zIndex: 1000,
                        maxHeight: '200px',
                      }),
                      indicatorSeparator: (base) => ({
                        ...base,
                        display: 'none',
                      }),
                    }}
                  />
                </div>
                <div className="w-[11rem]">
                  <Select
                    key={category}
                    onChange={(option) => {
                      setCategory(option ? option.value : "");
                    }}
                    value={categoryData.find(option => option.value === category)}
                    options={categoryData}
                    placeholder="Categories"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '12px',
                        boxShadow: 'none',
                        borderColor: '#D1D5DB',
                        padding: '0.12rem',
                      }),
                      option: (base) => ({
                        ...base,
                        padding: '0.5rem 1rem',
                        color: '#000',
                        cursor: 'pointer',
                      }),
                      menu: (base) => ({
                        ...base,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '0.375rem',
                        overflow: 'hidden',
                        zIndex: 1000,
                        maxHeight: '200px',
                      }),
                      indicatorSeparator: (base) => ({
                        ...base,
                        display: 'none',
                      }),
                    }}
                  />
                </div>
                {type === "" &&
                  searchByName === "" &&
                  category === "" ? (
                  ""
                ) : (
                  <button onClick={handleClear} className="text-blue-600">
                    Clear
                  </button>
                )}
              </div>
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
            <div className="w-full">
              <div className="w-full bg-white rounded-lg">
                {selectedRows?.length > 0 ? (
                  <div className="text-center mb-1 text-sm font-semibold">
                    {`All ${selectedRows?.length} ads on this page are selected.`}
                    <button
                      className="text-indigo-500"
                      onClick={handleSelectAllData}
                    >{`Select all ${data?.length} ads`}</button>
                  </div>
                ) : (
                  ""
                )}
                <>
                  <div className="overflow-x-auto relative">
                    <table className="min-w-full bg-white rounded-lg">
                      <thead>
                        <tr className="bg-[#5B6CFF] text-white rounded-lg">
                          <th className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="checkbox"
                              onChange={handleSelectAll}
                              checked={
                                (currentRecords.length > 0 && isCheck)
                              }
                            />
                          </th>
                          <th className="px-4 py-2 whitespace-nowrap">Sr. No.</th>
                          <th className="px-4 py-2 whitespace-nowrap">Ad Name</th>
                          <th className="px-4 py-2 whitespace-nowrap">Created Date and Time</th>
                          <th className="px-4 py-2 whitespace-nowrap">Updated Date and Time</th>
                          <th className="px-4 py-2 whitespace-nowrap">Category Name</th>
                          <th className="px-4 py-2 whitespace-nowrap flex items-center justify-center">
                            Daily Budget
                            {sortOrder.amount === 'asc' ? (
                              <FaAngleUp className="pl-1 cursor-pointer" onClick={handleSortAmountClick} />
                            ) : (
                              <FaAngleDown className="pl-1 cursor-pointer" onClick={handleSortAmountClick} />
                            )}
                          </th>
                          <th className="px-4 py-2 whitespace-nowrap">Preview</th>
                          <th className="px-4 py-2 whitespace-nowrap">Ad Type</th>
                        </tr>
                      </thead>
                      {data?.length === 0 ? (
                        <tbody>
                          <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                              <p className="flex justify-center text-gray-800 text-sm p-4">
                                No Data Found
                              </p>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody>
                          {currentRecords.map((item, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-300 hover:bg-gray-100 text-center"
                            >
                              <td className="px-4 py-2 whitespace-nowrap">
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
                                {moment(item?.createdAt).format('DD/MM/YYYY hh:mm A')}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {moment(item?.updatedAt).format('DD/MM/YYYY hh:mm A')}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                                {item?.ad_category}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                ₹ {Number(item?.ad_budget).toLocaleString()}
                              </td>
                              <td className="p-2 text-sm ms-3">
                                <button
                                  className="text-blue-500 underline"
                                  onClick={() =>
                                    handleActionChange("Preview", item)
                                  }
                                >
                                  <Icons
                                    icon="icon-park-outline:preview-open"
                                    width="24"
                                    height="24"
                                  />
                                </button>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {item?.ad_type}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>
                  </div>
                  <div className="bottom-0 right-0 bg-white flex justify-end p-2">
                    <PaginationFile
                      data={sortedData}
                      itemsPerPage={10}
                      onPageChange={handlePageChange}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </>
              </div>
            </div>
          </>
        )
        }
      </div>
      <Modal onConfirm={handleConfirmAction} />
    </div>
  );
};

export default Advertisement;



