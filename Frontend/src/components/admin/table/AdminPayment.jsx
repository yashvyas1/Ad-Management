import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import PaginationFile from "@/components/admin/pagination/PaginationFile";
import { getRequest } from "../../../services/backendAPIsServices";
import { useForm } from "react-hook-form";
import useModal from "@/hooks/useModal";
import { toast, ToastContainer } from "react-toastify";
import { GoDownload } from "react-icons/go";
import { MdKeyboardArrowDown } from "react-icons/md";
import Icons from "@/components/ui/Icon";
import Modal from "@/components/common/Modal";
import Datepicker from "react-tailwindcss-datepicker";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

function AdminPayment() {
  const [status, setStatus] = useState("");
  const [adType, setAdType] = useState("");
  const [role, setRole] = useState("advertiser");
  const [currentRecords, setCurrentRecords] = useState([]);
  const [updatedDate, setUpdatedDate] = useState(null);
  const [data, setData] = useState([]);
  const [searchByName, setSearchByName] = useState("");
  const { openModal, closeModal } = useModal();
  const [endIndex, setEndIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Payments");
  const { reset } = useForm();
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const [sortOrder, setSortOrder] = useState({ amount: "asc", adType: "asc" });
  const [sortedData, setSortedData] = useState();

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
  }, [status, updatedDate]);

  const handlePageChange = useCallback((pageData, value) => {
    setCurrentRecords(pageData);
    setEndIndex(value);
  }, []);

  const openManualPayment = () => {
    if (role === "advertiser") {
      openModal("AddManualPayment", { role });
    } else {
      openModal("AddPublisherManualPayment", { role });
    }
  };

  const handleClear = () => {
    setSearchByName("");
    setUpdatedDate("");
    setStatus("");
    setAdType("");
    setRole("advertiser");
  };

  const search = (e) => {
    const searchValue = e.target.value.toLowerCase();
    if (searchValue.length === 0) {
      getData();
    } else {
      const searchedAds = data?.filter((ad) =>
        ad.website_name.toLowerCase().includes(searchValue)
      );
      setData(searchedAds);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data]);

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStatus("");
    setAdType("");
    setRole("advertiser");
  };

  const sortData = (field, order) => {
    const sorted = [...data].sort((a, b) => {
      if (field === "amount") {
        return order === "asc"
          ? a.ad_budget - b.ad_budget
          : b.ad_budget - a.ad_budget;
      } else if (field === "adType") {
        return order === "asc"
          ? a.ad_type.localeCompare(b.ad_type)
          : b.ad_type.localeCompare(a.ad_type);
      }
      return 0;
    });
    setSortedData(sorted);
  };
  const handleSortAmountClick = () => {
    const newOrder = sortOrder.amount === "asc" ? "desc" : "asc";
    setSortOrder((prev) => ({ ...prev, amount: newOrder }));
    sortData("amount", newOrder);
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-100 ">
        <div className="w-full lg:p-3">
          <div className="flex flex-col sm:flex-col md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-6 mb-5">
            <div className="flex space-x-6 md:w-1/2">
              <button
                onClick={() => handleTabChange("Payments")}
                className={`text-base font-semibold ${
                  activeTab === "Payments"
                    ? "text-[#4880FF] border-b-2 border-[#4880FF]"
                    : "text-gray-600"
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => handleTabChange("ManualPayments")}
                className={`text-base font-semibold ${
                  activeTab === "ManualPayments"
                    ? "text-[#4880FF] border-b-2 border-[#4880FF]"
                    : "text-gray-600"
                }`}
              >
                Manual Payments
              </button>
            </div>

            {activeTab === "ManualPayments" && (
              <button
                className="flex items-center text-white bg-blue-500 py-2 px-4 rounded-md shadow hover:bg-blue-600 transition"
                onClick={openManualPayment}
              >
                <Icons icon="si:add-duotone" width="24" height="24" /> Manual
                Payment
              </button>
            )}
          </div>

          {/* Table and other content goes here */}
          <div className="w-full bg-white rounded-lg p-4 ">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
              <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                <div className="flex items-center border border-gray-300 p-2 text-sm rounded-xl bg-white shadow-sm w-full lg:w-auto">
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
                {/* {activeTab === "Payments" && ( */}
                <>
                  {activeTab === "Payments" && (
                    <div className="relative w-full lg:w-auto ">
                      <select
                        onChange={(e) => setStatus(e.target.value)}
                        value={status}
                        className="bg-white dark:bg-slate-800 py-2 px-3  border rounded-xl text-gray-500 dark:text-[#CBD5E1] focus:outline-none appearance-none w-full lg:w-auto"
                      >
                        <option value="">Status</option>
                        <option value="active">Complete</option>
                        <option value="inactive">Failed</option>
                      </select>
                    </div>
                  )}

                  {role === "advertiser" &&
                    (activeTab === "Payments" ||
                      activeTab === "ManualPayments") && (
                      <div className="relative w-full lg:w-auto">
                        <select
                          onChange={(e) => setAdType(e.target.value)}
                          value={adType}
                          className="bg-white dark:bg-slate-800 py-2 px-6 border rounded-xl text-gray-500 dark:text-[#CBD5E1] focus:outline-none appearance-none w-full lg:w-auto"
                        >
                          <option value="">Ad Type</option>
                          <option value="Banner">Banner</option>
                          <option value="Video">Video</option>
                        </select>
                      </div>
                    )}

                  <div className="relative w-full lg:w-auto ">
                    <select
                      onChange={(e) => setRole(e.target.value)}
                      value={role}
                      className="bg-white dark:bg-slate-800 py-2 px-6   border rounded-xl text-gray-500 dark:text-[#CBD5E1] focus:outline-none appearance-none w-full lg:w-auto"
                    >
                      <option value="advertiser">Advertiser</option>
                      <option value="publisher">Publisher</option>
                    </select>
                  </div>

                  <div className="w-full lg:w-auto">
                    <Datepicker
                      inputClassName="border border-black  rounded-xl w-full h-10 py-6 px-2 text-[#657488]"
                      popoverDirection="down"
                      placeholder="Start and End Date"
                      value={value}
                      onChange={(newValue) => setValue(newValue)}
                    />
                  </div>

                  {(searchByName || status || adType) && (
                    <button
                      onClick={handleClear}
                      className="text-blue-600 mt-1"
                    >
                      Clear
                    </button>
                  )}
                </>
                {/* )} */}
              </div>

              <button className="flex items-center text-white bg-blue-500 py-2 px-4 rounded-md shadow hover:bg-blue-600 transition">
                <GoDownload className="mr-2" /> Bulk Export
              </button>
            </div>

            <div className="w-full">
              {activeTab === "Payments" ? (
                <div>
                  {/* Payments table (as per your existing structure) */}
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg">
                      <thead>
                        <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                          <th className="px-2 py-4 whitespace-nowrap">
                            Sr. No.
                          </th>
                          {role === "publisher" ? (
                            <>
                              <th className="px-2 py-4 whitespace-nowrap">
                                Publisher Name
                              </th>
                              <th className="px-2 py-4 whitespace-nowrap">
                                Website Name
                              </th>
                              <th className="px-2 py-4 whitespace-nowrap">
                                Start Date and Time
                              </th>
                              <th className="px-2 py-4 whitespace-nowrap">
                                End Date and Time
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="px-2 py-4 whitespace-nowrap">
                                Ad Name
                              </th>
                              <th className="px-2 py-4 whitespace-nowrap">
                                Advertiser Name
                              </th>
                            </>
                          )}
                          <th className="px-2 py-4 whitespace-nowrap flex items-center justify-center">
                            Amount
                            {sortOrder.amount === "asc" ? (
                              <FaAngleUp
                                className="pl-1 cursor-pointer"
                                onClick={handleSortAmountClick}
                              />
                            ) : (
                              <FaAngleDown
                                className="pl-1 cursor-pointer"
                                onClick={handleSortAmountClick}
                              />
                            )}
                          </th>
                          <th className="px-2 py-4 whitespace-nowrap">
                            Platform
                          </th>
                          <th className="px-2 py-4 whitespace-nowrap">
                            Status
                          </th>
                          <th className="px-2 py-4 whitespace-nowrap">
                            Payment Date and Time
                          </th>
                          <th className="px-2 py-4 whitespace-nowrap">
                            AD Type
                          </th>
                          <th className="px-2 py-4 whitespace-nowrap">
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords?.length === 0 ? (
                          <tr>
                            <td colSpan="11">
                              <p className="flex justify-center text-gray-800 text-sm p-4">
                                No Data Found
                              </p>
                            </td>
                          </tr>
                        ) : (
                          currentRecords?.map((item, index) => (
                            <tr
                              key={index}
                              className={`bg-white border-b text-center border-gray-300 hover:bg-gray-50`}
                            >
                              <td className="p-3 text-sm">
                                {endIndex + index + 1}
                              </td>
                              {role === "publisher" ? (
                                <>
                                  <td className="p-3 text-sm capitalize">
                                    {item?.publisher_name}
                                  </td>
                                  <td className="p-3 text-sm">
                                    {item?.website_name}
                                  </td>
                                  <td className="p-3 text-sm">
                                    {new Date(
                                      item?.start_date
                                    ).toLocaleString()}
                                  </td>
                                  <td className="p-3 text-sm">
                                    {new Date(item?.end_date).toLocaleString()}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="p-3 text-sm capitalize">
                                    {item?.ad_name}
                                  </td>
                                  <td className="p-3 text-sm">
                                    {item?.advertiser_name}
                                  </td>
                                </>
                              )}
                              <td className="p-3 text-sm">{item?.amount}</td>
                              <td className="p-3 text-sm">{item?.platform}</td>
                              <td className="p-3 text-sm">
                                {item.status === "active" && (
                                  <span className="text-[#059000]">
                                    Complete
                                  </span>
                                )}
                                {item.status === "inactive" && (
                                  <span className="text-[#FF1F1F]">Failed</span>
                                )}
                              </td>
                              <td className="p-3 text-sm">
                                {new Date(item?.updatedAt).toLocaleString()}
                              </td>
                              <td className="p-3 text-sm">{item?.ad_type}</td>
                              <td className="p-3 text-base text-[#5B6CFF] font-semibold cursor-pointer underline">
                                Get Invoice
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Payments table (as per your existing structure) */}
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg">
                      <thead>
                        <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                          <th className="px-2 py-4 whitespace-nowrap">
                            Sr. No.
                          </th>
                          {role === "publisher" ? (
                            <>
                              <th className="px-2 py-4 whitespace-nowrap">
                                Publisher Name
                              </th>
                              <th className="px-2 py-4 whitespace-nowrap">
                                Website Name
                              </th>
                              <th className="px-2 py-4 whitespace-nowrap">
                                Start Date and Time
                              </th>
                              <th className="px-2 py-4 whitespace-nowrap">
                                End Date and Time
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="px-2 py-4 whitespace-nowrap">
                                Ad Name
                              </th>
                              <th className="px-2 py-4 whitespace-nowrap">
                                Advertiser Name
                              </th>
                            </>
                          )}
                          <th className="px-2 py-4 whitespace-nowrap flex items-center justify-center">
                            Amount
                            {sortOrder.amount === "asc" ? (
                              <FaAngleUp
                                className="pl-1 cursor-pointer"
                                onClick={handleSortAmountClick}
                              />
                            ) : (
                              <FaAngleDown
                                className="pl-1 cursor-pointer"
                                onClick={handleSortAmountClick}
                              />
                            )}
                          </th>
                          <th className="px-2 py-4 whitespace-nowrap">
                            Payment Date and Time
                          </th>
                          <th className="px-2 py-4 whitespace-nowrap">
                            AD Type
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords?.length === 0 ? (
                          <tr>
                            <td colSpan="11">
                              <p className="flex justify-center text-gray-800 text-sm p-4">
                                No Data Found
                              </p>
                            </td>
                          </tr>
                        ) : (
                          currentRecords?.map((item, index) => (
                            <tr
                              key={index}
                              className={`bg-white border-b text-center border-gray-300 hover:bg-gray-50`}
                            >
                              <td className="p-3 text-sm">
                                {endIndex + index + 1}
                              </td>
                              {role === "publisher" ? (
                                <>
                                  <td className="p-3 text-sm capitalize">
                                    {item?.publisher_name}
                                  </td>
                                  <td className="p-3 text-sm">
                                    {item?.website_name}
                                  </td>
                                  <td className="p-3 text-sm">
                                    {new Date(
                                      item?.start_date
                                    ).toLocaleString()}
                                  </td>
                                  <td className="p-3 text-sm">
                                    {new Date(item?.end_date).toLocaleString()}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="p-3 text-sm capitalize">
                                    {item?.ad_name}
                                  </td>
                                  <td className="p-3 text-sm">
                                    {item?.advertiser_name}
                                  </td>
                                </>
                              )}
                              <td className="p-3 text-sm">{item?.amount}</td>
                              <td className="p-3 text-sm">
                                {new Date(item?.updatedAt).toLocaleString()}
                              </td>
                              <td className="p-3 text-sm">{item?.ad_type}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            {/* Pagination */}
            <div className="bottom-0 right-0 bg-white flex justify-end p-2">
              <PaginationFile
                data={data}
                itemsPerPage={10}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
      <Modal />
    </div>
  );
}

export default AdminPayment;
