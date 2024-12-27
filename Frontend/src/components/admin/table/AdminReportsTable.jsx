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
import {
  getRequest,
  patchRequest,
  deleteRequest,
} from "@/services/backendAPIsServices";
import PaginationFile from "../pagination/PaginationFile";
import { toast } from "react-toastify";
import { FiDownload } from "react-icons/fi";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

const AdminReportsTable = () => {
  const { isModalOpen, modalContent, openModal, closeModal } = useModal();
  const [endIndex, setEndIndex] = useState(0);
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const modalRef = useRef(null);

  const [data, setData] = useState([]);
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
  const [sortOrder, setSortOrder] = useState({ amount: "asc", adType: "asc" });
  const [sortedData, setSortedData] = useState();

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
    setCategory("");
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

  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data]);

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
  const handleSortVisitClick = () => {
    const newOrder = sortOrder.amount === "asc" ? "desc" : "asc";
    setSortOrder((prev) => ({ ...prev, amount: newOrder }));
    sortData("amount", newOrder);
  };
  const handleSortClicks = () => {
    const newOrder = sortOrder.adType === "asc" ? "desc" : "asc";
    setSortOrder((prev) => ({ ...prev, adType: newOrder }));
    sortData("adType", newOrder);
  };
  const handleSortCTRClicks = () => {
    const newOrder = sortOrder.adType === "asc" ? "desc" : "asc";
    setSortOrder((prev) => ({ ...prev, adType: newOrder }));
    sortData("adType", newOrder);
  };
  const handleSortCPCClicks = () => {
    const newOrder = sortOrder.adType === "asc" ? "desc" : "asc";
    setSortOrder((prev) => ({ ...prev, adType: newOrder }));
    sortData("adType", newOrder);
  };

  return (
    <div className="min-h-screen lg:p-2 pt-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 p-1 w-full">
        <div className="text-lg font-semibold">Reports</div>
        <div className="w-full sm:w-auto flex flex-col md:flex-row md:space-x-4 gap-2">
          <div className="w-full md:w-auto">
            <label className="text-gray-800 text-sm">Start and End Date</label>
            <div className="relative rounded-md shadow-sm w-full">
              <Datepicker
                className="w-full h-12 "
                popoverDirection="down"
                value={value}
                onChange={(newValue) => setValue(newValue)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-3 shadow-lg mt-2">
        <div className="flex flex-col lg:flex-row p-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-col md:flex-row flex-wrap items-center gap-2 w-full lg:w-auto">
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
            <div className="w-full lg:w-auto">
              <select
                onChange={(e) => setType(e.target.value)}
                value={type}
                className="bg-white dark:bg-slate-800 py-2 px-3 border rounded-xl text-gray-500 dark:text-[#CBD5E1] focus:outline-none appearance-none w-full lg:w-auto"
              >
                <option value="">Ad Type</option>
                <option value="Banner">Banner</option>
                <option value="Video">Video</option>
              </select>
            </div>
            <div className="w-full lg:w-auto">
              <select
                onChange={(e) => setStatus(e.target.value)}
                value={status}
                className="bg-white dark:bg-slate-800 py-2 px-3 border rounded-xl text-gray-500 dark:text-[#CBD5E1] focus:outline-none appearance-none w-full lg:w-auto"
              >
                <option value="">Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Pause</option>
              </select>
            </div>
            <div className="w-full lg:w-auto">
              <select
                onChange={(e) => setPermissions(e.target.value)}
                value={permissions}
                className="bg-white dark:bg-slate-800 py-2 px-3 border rounded-xl text-gray-500 dark:text-[#CBD5E1] focus:outline-none appearance-none w-full lg:w-auto"
              >
                <option value="">Permissions</option>
                <option value="approved">Approve</option>
                <option value="decline">Decline</option>
              </select>
            </div>
            <div className="w-full lg:w-auto">
              <select
                onChange={(e) => setCategory(e.target.value)}
                value={category}
                className="bg-white dark:bg-slate-800 py-2 px-3 border rounded-xl text-gray-500 dark:text-[#CBD5E1] focus:outline-none appearance-none w-full lg:w-auto"
              >
                <option value="">Category</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {type === "" &&
            permissions === "" &&
            searchByName === "" &&
            category === "" &&
            status === "" ? (
              ""
            ) : (
              <button onClick={handleClear} className="text-blue-600">
                Clear
              </button>
            )}
          </div>
          <button className="flex items-center text-white bg-blue-500 py-2 px-4 rounded-md shadow hover:bg-blue-600 transition">
            <FiDownload className="mr-2" /> Bulk Export
          </button>
        </div>
        <div className="w-full">
          <div className="w-full bg-white rounded-lg ">
            <>
              <div className="overflow-x-auto relative">
                <table className="min-w-full bg-white rounded-lg">
                  <thead>
                    <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                      <th className="px-2 py-4 whitespace-nowrap">Sr. No.</th>
                      <th className="px-2 py-4 whitespace-nowrap">Ad Name</th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        Advertiser Name
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        Create Date and Time
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        Update Date and Time
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        Category Name
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        Publisher Name
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        Website URL
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        <span className="flex items-center justify-center">
                          Visits
                          {sortOrder.adType === "asc" ? (
                            <FaAngleUp
                              className="pl-1 cursor-pointer"
                              onClick={handleSortVisitClick}
                            />
                          ) : (
                            <FaAngleDown
                              className="pl-1 cursor-pointer"
                              onClick={handleSortVisitClick}
                            />
                          )}
                        </span>
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        <span className="flex items-center justify-center">
                          Clicks
                          {sortOrder.adType === "asc" ? (
                            <FaAngleUp
                              className="pl-1 cursor-pointer"
                              onClick={handleSortClicks}
                            />
                          ) : (
                            <FaAngleDown
                              className="pl-1 cursor-pointer"
                              onClick={handleSortClicks}
                            />
                          )}
                        </span>
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        <span className="flex items-center justify-center">
                          CTR
                          {sortOrder.adType === "asc" ? (
                            <FaAngleUp
                              className="pl-1 cursor-pointer"
                              onClick={handleSortCTRClicks}
                            />
                          ) : (
                            <FaAngleDown
                              className="pl-1 cursor-pointer"
                              onClick={handleSortCTRClicks}
                            />
                          )}
                        </span>
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        <span className="flex items-center justify-center">
                          CPC
                          {sortOrder.adType === "asc" ? (
                            <FaAngleUp
                              className="pl-1 cursor-pointer"
                              onClick={handleSortCPCClicks}
                            />
                          ) : (
                            <FaAngleDown
                              className="pl-1 cursor-pointer"
                              onClick={handleSortCPCClicks}
                            />
                          )}
                        </span>
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">Ad Budget</th>
                      <th className="px-2 py-4 whitespace-nowrap">Status</th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        Permissions
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        Start Date and Time
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">
                        End Date and Time
                      </th>
                      <th className="px-2 py-4 whitespace-nowrap">Ad Type</th>
                      <th className="px-2 py-4 whitespace-nowrap">Devices</th>
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
                          <td className="px-6 py-6 whitespace-nowrap text-sm">
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
                          <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                            {item?.ad_category}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                            {item?.Advertiser?.User?.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {" "}
                            https://www.flipkart.com/
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                            {" "}
                            66
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                            {" "}
                            166
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                            {" "}
                            500
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                            {" "}
                            800
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            ₹ {Number(item?.ad_budget).toLocaleString()}
                          </td>
                          <td
                            className={`capitalize text-sm  ${
                              item.status === "active"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {item.status}
                          </td>
                          <td>
                            <button
                              disabled
                              className={`capitalize ${
                                item.permission === "approved"
                                  ? "text-green-600 bg-green-100 p-1 px-2 rounded-lg"
                                  : "text-red-600 bg-red-100 p-1 px-2 rounded-lg"
                              }`}
                            >
                              {item.permission}
                            </button>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {new Date(item?.start_date).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {new Date(item?.end_date).toLocaleString()}
                          </td>

                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {item?.ad_type}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            Mobile , Laptop
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsTable;
