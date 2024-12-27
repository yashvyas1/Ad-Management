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
import {
  getRequest,
  patchRequest,
  deleteRequest,
} from "@/services/backendAPIsServices";
import PaginationFile from "../pagination/PaginationFile";
import { FiMoreVertical } from "react-icons/fi";
import { toast } from "react-toastify";

const AdminAdListTable = ({ insightViewHandler }) => {
  const { isModalOpen, modalContent, openModal, closeModal } = useModal();
  const [isCheck, setIsCheck] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [endIndex, setEndIndex] = useState(0);
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const modalRef = useRef(null);

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
  const handleImagePreview = (imageSrc) => {
    setImageSrc(imageSrc);
    setIsImageOpen(true);
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
      console.error(error)
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

  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data]);
  return (
    <div className="min-h-screen lg:p-2 pt-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 p-1 w-full">
        <div className="text-lg font-semibold">Advertisement</div>
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
                {/* <option value="stop">Stop</option> */}
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
                <option value="pending">Pending</option>
              </select>
            </div>
            {type === "" &&
            permissions === "" &&
            searchByName === "" &&
            status === "" ? (
              ""
            ) : (
              <button onClick={handleClear} className="text-blue-600">
                Clear
              </button>
            )}
            {/* <div className="w-full lg:w-auto">
              <select
                onChange={(e) => setCategory(e.target.value)}
                value={category}
                className="bg-white dark:bg-slate-800 py-2 px-3 border rounded-xl text-gray-500 dark:text-[#CBD5E1] focus:outline-none appearance-none w-full lg:w-auto"
              >
                <option value="">Select Category</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div> */}
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
              <div className="relative group">
                <button
                  className="flex items-center text-green-600 shadow-sm hover:bg-green-100 transition-all"
                  onClick={() => handleActionChange("Approve", selectedRows)}
                >
                  <Icons icon="lets-icons:check-fill" width="36" height="36" />
                </button>
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Approve
                </span>
              </div>
              <div className="relative group">
                <button
                  className="flex items-center text-red-600 shadow-sm hover:bg-red-100 transition-all"
                  onClick={() => handleActionChange("Decline", selectedRows)}
                >
                  <Icons icon="carbon:close-filled" width="36" height="36" />
                </button>
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Decline
                </span>
              </div>
            </div>
          )}
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
                      <th className=" px-4 py-4 whitespace-nowrap">Sr. No.</th>
                      <th className="px-4 py-4 whitespace-nowrap">Ad Name</th>
                      <th className="px-4 py-4 whitespace-nowrap ">
                        Advertiser Name
                      </th>
                      <th className="px-4 py-4 whitespace-nowrap ">
                        Created Date & Time
                      </th>
                      <th className=" px-4 py-4 whitespace-nowrap">
                        Updated Date & Time
                      </th>
                      <th className=" px-4 py-4 whitespace-nowrap">
                        Category Name
                      </th>
                      <th className="px-4 py-4 whitespace-nowrap">Status</th>
                      <th className="px-4 py-4 whitespace-nowrap">
                        Permission
                      </th>
                      <th className="px-4 py-4 whitespace-nowrap">Insights</th>
                      <th className="px-4 py-4 whitespace-nowrap">
                        Start Date & Time
                      </th>
                      <th className="px-4 py-4 whitespace-nowrap ">
                        End Date & Time
                      </th>
                      <th className="px-4 py-4 whitespace-nowrap">Type</th>
                      <th className="px-4 py-4 whitespace-nowrap">Ad Budget</th>
                      <th className="px-4 py-4 whitespace-nowrap">Preview</th>
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
                          <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                            {item?.ad_category}
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
                            {item?.permission === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  className="p-2 bg-green-700 text-white rounded-lg"
                                  onClick={() =>
                                    handleActionChange("Approve", item)
                                  }
                                >
                                  Approve
                                </button>
                                <button
                                  className="p-2 bg-red-700 text-white rounded-lg"
                                  onClick={() =>
                                    handleActionChange("Decline", item)
                                  }
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
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
                            )}
                          </td>
                          <td className="text-sm text-blue-500 underline cursor-pointer">
                            <button
                              className="border p-2 rounded-lg hover:bg-indigo-100"
                              onClick={() =>
                                insightViewHandler("main", item)
                              }
                            >
                              View
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
                                    onClick={() =>
                                      handleActionChange("View", item)
                                    }
                                  >
                                    View
                                  </li>
                                  {item?.status === "inactive" ? (
                                    ""
                                  ) : (
                                    <>
                                      {item?.status !== "paused" && (
                                        <li
                                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                          onClick={() =>
                                            handleActionChange("Pause", item)
                                          }
                                        >
                                          Pause
                                        </li>
                                      )}
                                      <li
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() =>
                                          handleActionChange("Resume", item)
                                        }
                                      >
                                        Resume
                                      </li>
                                      <li
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() =>
                                          handleActionChange("Stop", item)
                                        }
                                      >
                                        Stop
                                      </li>
                                    </>
                                  )}

                                  <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() =>
                                      handleActionChange("Delete", item)
                                    }
                                  >
                                    Delete
                                  </li>
                                </ul>
                              </div>
                            )}
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
      <Modal onConfirm={handleConfirmAction} />
    </div>
  );
};

export default AdminAdListTable;
