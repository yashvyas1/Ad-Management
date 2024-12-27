import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from 'react-icons/ci';
import PaginationFile from "@/components/admin/pagination/PaginationFile";
import { getRequest, } from "../../../services/backendAPIsServices";
import { useForm } from "react-hook-form";
import useModal from "@/hooks/useModal";
import { toast, ToastContainer } from "react-toastify";
import { GoDownload } from "react-icons/go";
import { MdKeyboardArrowDown } from "react-icons/md";
import Datepicker from "react-tailwindcss-datepicker";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

function PublisherPaymentsTable() {
    const [status, setStatus] = useState('');
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
    const [sortOrder, setSortOrder] = useState({ amount: 'asc', adType: 'asc' });
    const [sortedData, setSortedData] = useState(data);

    const getData = async () => {
        let query = "?";
        if (status) query += `status=${status}&`;
        if (updatedDate?.startDate)
            query += `updateDate=${updatedDate?.startDate?.toISOString().split("T")[0]}&`;

        query = query.slice(0, -1);
        try {
            const result = await getRequest(`/api/publisher/websitelist${query}`);
            if (result) {
                setData(result?.websiteListData);
                setCurrentPage(1);
                setSortedData(result?.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        getData();
    }, [status, updatedDate]);

    const handlePageChange = useCallback((pageData, value) => {
        setCurrentRecords(pageData);
        setEndIndex(value)
    }, []);

    // Manage the opening of the embed code modal
    const openEmbedModal = (website_id) => {
        openModal("EmbedCodeModal", { website_id: website_id });
    };

    const handleClear = () => {
        setSearchByName("");
        setUpdatedDate("");
        setStatus("");
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
        <div>
            <div className="min-h-screen bg-gray-100 p-4 lg:p-2">
                <div className="w-full lg:p-6">
                    {/* Tab navigation */}
                    <div className="flex space-x-6 mb-6">
                        <button onClick={() => handleTabChange("Payments")} className={`text-base font-semibold ${activeTab === "Payments" ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md" : "text-[#6F6F6F]"}`}>Payments</button>
                        <button onClick={() => handleTabChange("ManualPayments")} className={`text-base font-semibold ${activeTab === "ManualPayments" ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md" : "text-[#6F6F6F]"}`}>Manual Payments</button>
                    </div>
                    {/* Table and other content goes here */}
                    <div className="w-full bg-white rounded-lg p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                            <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                                <div className="flex items-center border border-gray-300 p-3 rounded-xl w-full md:w-2/3 lg:w-[24rem] bg-white shadow-sm">
                                    <CiSearch className="text-gray-400 text-xl mx-2" />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="w-full focus:outline-none text-gray-600"
                                        onChange={(e) => { search(e) }}
                                    />
                                </div>
                                {activeTab === "Payments" && (
                                    <>
                                        <div className="relative w-full lg:w-auto ">
                                            <select
                                                onChange={(e) => setStatus(e.target.value)}
                                                value={status}
                                                className="bg-white dark:bg-slate-800 py-3 px-2 pr-7 border rounded-xl text-gray-400 dark:text-[#CBD5E1] focus:outline-none appearance-none w-full lg:w-auto"
                                            >
                                                <option value="">Status</option>
                                                <option value="active">Complete</option>
                                                <option value="inactive">Failed</option>
                                            </select>
                                            <MdKeyboardArrowDown className="absolute top-1/2 right-1 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                                        </div>
                                    </>
                                )}
                                <div className="w-full lg:w-auto">
                                    <Datepicker
                                        inputClassName="border border-black  rounded-xl w-full h-10 py-6 px-2 text-[#657488]"
                                        popoverDirection="down"
                                        placeholder="Start and End Date"
                                        value={value}
                                        onChange={(newValue) => setValue(newValue)}
                                    />
                                </div>
                                {(searchByName || status) && (
                                    <button onClick={handleClear} className="text-blue-600">Clear</button>
                                )}
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
                                        <table className="w-full lg:w-[111.1rem] bg-white rounded-lg">
                                            <thead>
                                                <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                                                    <th className="px-4 py-4 whitespace-nowrap">Sr. No.</th>
                                                    <th className="px-4 py-4 whitespace-nowrap">Website Name</th>
                                                    <th className="px-4 py-4 whitespace-nowrap">Start Date and Time</th>
                                                    <th className="px-4 py-4 whitespace-nowrap">End Date and Time</th>
                                                    <th className="px-4 py-4 whitespace-nowrap flex items-center justify-center">
                                                        Amount
                                                        {sortOrder.amount === 'asc' ? (
                                                            <FaAngleUp className="pl-1 cursor-pointer" onClick={handleSortAmountClick} />
                                                        ) : (
                                                            <FaAngleDown className="pl-1 cursor-pointer" onClick={handleSortAmountClick} />
                                                        )}
                                                    </th>
                                                    <th className="px-4 py-4 whitespace-nowrap">Status</th>
                                                    <th className="px-4 py-4 whitespace-nowrap">Payment Date and Time</th>
                                                    <th className="px-4 py-4 whitespace-nowrap">Invoice</th>
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
                                                        <tr key={index} className={`bg-white border-b text-center border-gray-300 hover:bg-gray-50`}>
                                                            <td className="px-4 py-4 whitespace-nowrap">{endIndex + index + 1}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap capitalize">{item.website_name}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{new Date(item?.createdAt).toLocaleString()}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{item.amount || 0}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                {item.status === 'active' && (
                                                                    <span className="text-[#059000]">Complete</span>
                                                                )}
                                                                {item.status === 'inactive' && (
                                                                    <span className="text-[#FF1F1F]">Failed</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-[#5B6CFF] font-semibold cursor-pointer underline" onClick={() => openEmbedModal(item.website_id)}>
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
                                    <div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full bg-white rounded-lg">
                                                <thead>
                                                    <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                                                        <th className="px-4 py-4 whitespace-nowrap">Sr. No.</th>
                                                        <th className="px-4 py-4 whitespace-nowrap">Website Name</th>
                                                        <th className="px-4 py-4 whitespace-nowrap">Start Date and Time</th>
                                                        <th className="px-4 py-4 whitespace-nowrap">End Date and Time</th>
                                                        <th className="px-4 py-4 whitespace-nowrap flex items-center justify-center">
                                                            Amount
                                                            {sortOrder.amount === 'asc' ? (
                                                                <FaAngleUp className="pl-1 cursor-pointer" onClick={handleSortAmountClick} />
                                                            ) : (
                                                                <FaAngleDown className="pl-1 cursor-pointer" onClick={handleSortAmountClick} />
                                                            )}
                                                        </th>
                                                        <th className="px-4 py-4 whitespace-nowrap">Payment Date and Time</th>
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
                                                            <tr key={index} className={`bg-white border-b text-center border-gray-300 hover:bg-gray-50`}>
                                                                <td className="px-4 py-4 whitespace-nowrap">{endIndex + index + 1}</td>
                                                                <td className="px-4 py-4 whitespace-nowrap capitalize">{item.website_name}</td>
                                                                <td className="px-4 py-4 whitespace-nowrap">{new Date(item?.createdAt).toLocaleString()}</td>
                                                                <td className="px-4 py-4 whitespace-nowrap">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                                <td className="px-4 py-4 whitespace-nowrap">{item.totalRevenue || 0}</td>
                                                                <td className="px-4 py-4 whitespace-nowrap">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
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
        </div>
    );
}

export default PublisherPaymentsTable