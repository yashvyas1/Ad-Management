import React, { useCallback, useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import useModal from "@/hooks/useModal";
import Datepicker from "react-tailwindcss-datepicker";
import { RxCross1 } from "react-icons/rx";
import { getRequest, postRequest } from "@/services/backendAPIsServices";
import { toast } from "react-toastify";
import "react-phone-input-2/lib/style.css";
import PaginationFile from "@/components/admin/pagination/PaginationFile";

const AdminFeedback = () => {
  const { isModalOpen, modalContent, openModal, closeModal } = useModal();
  const [isCheck, setIsCheck] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showBankDetailsModal, setshowBankDetailsModal] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [endIndex, setEndIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("Advertiser Feedback");
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [repliedFeedbacks, setRepliedFeedbacks] = useState({});
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearchChange = debounce((value) => {
    setSearchByName(value.toLowerCase());
  }, 300);

  const openModalWithMessage = (message) => {
    setFeedbackMessage(message);
    setshowBankDetailsModal(true);
  };
  const closeModalAndReset = () => {
    setResponse("");
    setFeedbackMessage("");

    setShowAddUserModal(false);
    setShowEditUserModal(false);
    setshowBankDetailsModal(false);
  };

  const [data, setData] = useState([]);
  const [currentRecords, setCurrentRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchByName, setSearchByName] = useState("");
  const [type, setType] = useState("");
  const [filteredCount, setFilteredCount] = useState(0);
  const [category, setCategory] = useState("");
  const [updatedDate, setUpdatedDate] = useState(null);
  const [debouncedTerm, setDebouncedTerm] = useState(searchByName);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const dropdownRef = useRef(null);
  const [response, setResponse] = useState("");
  const characterLimit = 500;

  const toggleMenu = (index) => {
    setIsMenuOpen(isMenuOpen === index ? null : index);
  };

  const getData = async () => {
    let query = "?";
    if (updatedDate?.startDate)
      query += `updatedAt=${
        updatedDate?.startDate?.toISOString().split("T")[0]
      }&`;
    if (value?.startDate && value?.endDate)
      query += `start_date=${
        value?.startDate.toISOString().split("T")[0]
      }&end_date=${value?.endDate.toISOString().split("T")[0]}&`;
    if (searchByName) query += `search=${searchByName}&`;

    query = query.slice(0, -1);

    const endpoint =
      activeTab === "Publisher Feedback"
        ? `/api/admin/getpublisherfeedback?timestamp=${new Date().getTime()}`
        : `/api/admin/getadvertiserfeedback?timestamp=${new Date().getTime()}`;

    try {
      const result = await getRequest(`${endpoint}${query}`);

      if (result) {
        const feedbacks =
          activeTab === "Publisher Feedback"
            ? result.publisherFeedbacks || []
            : result.advertiserFeedbacks || [];

        const initialRepliedState = feedbacks.reduce((acc, item) => {
          if (item.response_text) {
            acc[item.feedback_id] = item.response_text;
          }
          return acc;
        }, {});
        setRepliedFeedbacks(initialRepliedState);

        setData(feedbacks);
        setTotalRecords(feedbacks.length);
        setCurrentPage(1);
        setCurrentRecords(feedbacks.slice(0, 10));
        setFilteredCount(feedbacks.length);
      }
    } catch (error) {
      console.error("Error fetching feedback data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, [activeTab, updatedDate, value]);

  const handlePageChange = useCallback((pageData, endValue) => {
    setCurrentRecords(pageData);
  }, []);

  const handleClear = () => {
    setType("");
    setSearchByName("");
    setUpdatedDate("");
    setValue({
      startDate: null,
      endDate: null,
    });
  };

  const search = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchByName(searchValue);

    if (searchValue.length === 0) {
      setCurrentRecords(data.slice(0, 10)); // Reset to initial data with pagination
    } else {
      const filteredData = data.filter((ad) =>
        ad.advertiser_name.toLowerCase().includes(searchValue)
      );
      setCurrentRecords(filteredData.slice(0, 10)); // Show first 10 of filtered data
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchByName(""); // Clear search input on tab change
  };

  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        (item.advertiser_name &&
          item.advertiser_name.toLowerCase().includes(searchByName)) ||
        (item.publisher_name &&
          item.publisher_name.toLowerCase().includes(searchByName))
    );
    setFilteredData(filtered);
    setCurrentRecords(filtered.slice(0, 10)); // Show first 10 of filtered data
    setTotalRecords(filtered.length); // Update total records count for filtered data
  }, [data, searchByName]);

  const handleReplyClick = (feedback) => {
    setSelectedRow(feedback); // Set selected feedback row
    setResponse(repliedFeedbacks[feedback.feedback_id] || ""); // Load existing response if available

    setShowAddUserModal(true); // Open the reply modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const responseData = {
        feedback_id: selectedRow?.feedback_id,
        email: selectedRow?.email,
        response_text: response,
      };

      const result = await postRequest(
        "/api/admin/feedbackresponse",
        responseData
      );
      if (result && result.message) {
        toast.success(result.message);

        setRepliedFeedbacks((prevState) => ({
          ...prevState,
          [selectedRow.feedback_id]: response,
        }));

        getData();
      } else {
        toast.error("Failed to send response");
      }

      setSubmitting(false);
      closeModalAndReset();
    } catch (error) {
      console.error("Error submitting feedback response:", error);
      toast.error("Error sending response");
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen lg:p-2 pt-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 p-1 w-full">
        <div className="flex space-x-6 mb-2">
          <button
            onClick={() => handleTabChange("Advertiser Feedback")}
            className={`text-base font-semibold ${
              activeTab === "Advertiser Feedback"
                ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md"
                : "text-[#6F6F6F]"
            }`}
          >
            {" "}
            Advertiser Feedback
          </button>
          <button
            onClick={() => handleTabChange("Publisher Feedback")}
            className={`text-base font-semibold ${
              activeTab === "Publisher Feedback"
                ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md"
                : "text-[#6F6F6F]"
            }`}
          >
            Publisher Feedback
          </button>
        </div>
      </div>

      {showBankDetailsModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-gray-400 bg-opacity-30 backdrop-blur-sm"></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Feedback</h2>
              <button
                onClick={closeModalAndReset}
                className="text-gray-500 text-lg"
              >
                <RxCross1 />
              </button>
            </div>
            <form className="gap-4 w-full">
              <textarea
                className="mt-1 p-4 border border-gray-300 rounded-lg w-full resize-none"
                rows="8"
                value={feedbackMessage}
                disabled
              />
            </form>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-gray-400 bg-opacity-30 backdrop-blur-sm"></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Response <span className="text-red-500">*</span>
              </h2>
              <button
                onClick={closeModalAndReset}
                className="text-gray-500 text-lg"
              >
                <RxCross1 />
              </button>
            </div>
            <form className="gap-4 w-full" onSubmit={handleSubmit}>
              <textarea
                className="mt-1 p-4 border border-gray-300 rounded-lg w-full resize-none"
                rows="8"
                required
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response..."
                disabled={
                  repliedFeedbacks[selectedRow?.feedback_id] ? true : false
                }
              />
              <div className="flex justify-end items-center mt-2 text-sm text-gray-500">
                <span>
                  {response.length}/{characterLimit}
                </span>
                {response.length > characterLimit && (
                  <span className="text-red-500">
                    Exceeded 500-character limit. Please shorten your text.
                  </span>
                )}
              </div>
              {!repliedFeedbacks[selectedRow?.feedback_id] && (
                <div className="col-span-2 flex justify-end mt-4">
                  <button
                    type="submit"
                    className={`bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600 transition ${
                      response.length > characterLimit
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={response.length > characterLimit}
                  >
                    {submitting ? "Sending..." : "Send"}
                  </button>
                </div>
              )}
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
                onChange={(e) => handleSearchChange(e.target.value)}
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
        </div>

        <div className="w-full">
          <div className="w-full bg-white rounded-lg ">
            {activeTab === "Advertiser Feedback" && (
              <>
                <div className="overflow-x-auto relative">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr className="bg-[#5B6CFF] text-white rounded-lg">
                        <th className=" px-4 py-4 whitespace-nowrap">
                          Sr. No.
                        </th>
                        <th className="px-4 py-4 whitespace-nowrap ">
                          Advertiser Name
                        </th>
                        <th className="px-4 py-4 whitespace-nowrap ">
                          Email ID
                        </th>
                        <th className="px-4 py-4 whitespace-nowrap ">
                          Feedback
                        </th>
                        <th className="px-4 py-4 whitespace-nowrap ">
                          Created Date & Time
                        </th>
                        <th className=" px-4 py-4 whitespace-nowrap">
                          Updated Date & Time
                        </th>
                        <th className="px-4 py-4 whitespace-nowrap">
                          Response
                        </th>
                      </tr>
                    </thead>
                    {currentRecords.length === 0 ? (
                      <tbody>
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center p-4 text-gray-800 text-sm"
                          >
                            No Data Found
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody className="mb-5">
                        {currentRecords.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-300 hover:bg-gray-100 text-center py-4"
                          >
                            <td className="px-6 py-6 whitespace-nowrap text-sm mb-5">
                              {endIndex + index + 1}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm capitalize mb-5">
                              {item?.advertiser_name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm mb-5">
                              {item?.email}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {item?.feedback_text?.length > 18 ? (
                                <span>
                                  {item.feedback_text.slice(0, 18)}...{" "}
                                  <span
                                    onClick={() =>
                                      openModalWithMessage(item.feedback_text)
                                    }
                                    className="text-blue-800 cursor-pointer hover:bg-indigo-100"
                                  >
                                    Read More
                                  </span>
                                </span>
                              ) : (
                                item.feedback_text
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                              {new Date(item?.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                              {new Date(item?.updatedAt).toLocaleString()}
                            </td>
                            <td className="text-sm text-blue-500 underline cursor-pointer">
                              <button
                                className="border p-2 rounded-lg hover:bg-indigo-100"
                                onClick={() => handleReplyClick(item)}
                              >
                                {repliedFeedbacks[item.feedback_id]
                                  ? "Replied"
                                  : "Reply"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </div>
                <div className="bottom-0 right-0 bg-white p-2">
                  <PaginationFile
                    data={filteredData}
                    itemsPerPage={10}
                    totalItems={totalRecords}
                    onPageChange={handlePageChange}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              </>
            )}

            {activeTab === "Publisher Feedback" && (
              <>
                <div className="overflow-x-auto relative">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr className="bg-[#5B6CFF] text-white rounded-lg">
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
                          Feedback
                        </th>

                        <th className="px-4 py-4 whitespace-nowrap ">
                          Created Date & Time
                        </th>
                        <th className=" px-4 py-4 whitespace-nowrap">
                          Updated Date & Time
                        </th>

                        <th className="px-4 py-4 whitespace-nowrap">
                          Response
                        </th>
                      </tr>
                    </thead>
                    {currentRecords.length === 0 ? (
                      <tbody>
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center p-4 text-gray-800 text-sm"
                          >
                            No Data Found
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody className="mb-5">
                        {currentRecords.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-300 hover:bg-gray-100 text-center py-4"
                          >
                            <td className="px-6 py-6 whitespace-nowrap text-sm">
                              {endIndex + index + 1}
                            </td>

                            <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                              {item?.publisher_name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {item?.email}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {item?.feedback_text.length > 18 ? (
                                <span>
                                  {item.feedback_text.slice(0, 18)}...{" "}
                                  <span
                                    onClick={() =>
                                      openModalWithMessage(item?.feedback_text)
                                    }
                                    className="text-blue-500 cursor-pointer"
                                  >
                                    Read More
                                  </span>
                                </span>
                              ) : (
                                item?.feedback_text
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                              {new Date(item?.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                              {new Date(item?.updatedAt).toLocaleString()}
                            </td>
                            <td className="text-sm text-blue-500 underline cursor-pointer">
                              <button
                                className="border p-2 rounded-lg hover:bg-indigo-100"
                                onClick={() => handleReplyClick(item)}
                              >
                                {repliedFeedbacks[item.feedback_id]
                                  ? "Replied"
                                  : "Reply"}
                              </button>
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
                    data={filteredData}
                    itemsPerPage={10}
                    totalItems={totalRecords}
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
    </div>
  );
};

export default AdminFeedback;
