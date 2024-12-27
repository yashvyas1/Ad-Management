import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from 'react-icons/ci';
import PaginationFile from "@/components/admin/pagination/PaginationFile";
import { getRequest } from "../../../services/backendAPIsServices";
import { ToastContainer } from "react-toastify";
import { GoDownload } from "react-icons/go";
import Select from "react-select";
import Datepicker from "react-tailwindcss-datepicker";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

const AdvertiserPayments = () => {
    const [status, setStatus] = useState('');
    const [currentRecords, setCurrentRecords] = useState([]);
    const [updatedDate, setUpdatedDate] = useState(null);
    const [data, setData] = useState([]);
    const [searchByName, setSearchByName] = useState("");
    const [endIndex, setEndIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("Payments");
    const [type, setType] = useState("");
    const [value, setValue] = useState({
        startDate: null,
        endDate: null,
    });
    const [sortOrder, setSortOrder] = useState({ amount: 'asc' });
    const [sortedData, setSortedData] = useState(data);

    const adTypeOptions = [
        { value: 'Banner', label: 'Banner' },
        { value: 'Video', label: 'Video' },
    ];

    const statusOptions = [
        { value: 'complete', label: 'Completed' },
        { value: 'fail', label: 'Failed' },
    ];

    const getData = async () => {
        let query = "?";
        if (status) query += `status=${status}&`;
        if (updatedDate?.startDate)
            query += `updateDate=${updatedDate?.startDate?.toISOString().split("T")[0]}&`;

        query = query.slice(0, -1);
        try {
            const result = await getRequest(`/api/advertiser/getadlist${query}`);
            if (result) {
                setData(result?.websiteListData);
                setCurrentPage(1);
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

    const handleClear = () => {
        setType("");
        setSearchByName("");
        setUpdatedDate(null);
        setStatus("");
        setValue({ startDate: null, endDate: null });
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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setStatus('');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 lg:p-2">
            <div className="w-full lg:p-6">
                <div className="flex space-x-6 mb-10">
                    <button onClick={() => handleTabChange("Payments")} className={`text-base font-semibold ${activeTab === "Payments" ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md" : "text-[#6F6F6F]"}`}>Payments</button>
                    <button onClick={() => handleTabChange("ManualPayments")} className={`text-base font-semibold ${activeTab === "ManualPayments" ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md" : "text-[#6F6F6F]"}`}>Manual Payments</button>
                    <button onClick={() => handleTabChange("PendingPayments")} className={`text-base font-semibold ${activeTab === "PendingPayments" ? "text-[#4880FF] border-b-[1px] border-[#4880FF] rounded-bl-md rounded-br-md" : "text-[#6F6F6F]"}`}>Pending Payments</button>
                </div>
                {activeTab === "Payments" ? (
                    <div className="w-full bg-white rounded-lg p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                            <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
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
                                {activeTab === "Payments" && (
                                    <>
                                        <div className="w-[10rem]">
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
                                        <div className="w-[15rem]">
                                            <Datepicker
                                                inputClassName="border border-[#D1D5DB] rounded-xl w-full h-10 px-2 text-[#657488]"
                                                popoverDirection="down"
                                                placeholder="Start and End Date"
                                                value={value}
                                                onChange={(newValue) => setValue(newValue)}
                                            />
                                        </div>
                                        {(type !== "" || searchByName !== "" || status !== "" || updatedDate !== null || value.startDate || value.endDate) && (
                                            <button onClick={handleClear} className="text-blue-600">
                                                Clear
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            <button className="flex items-center text-white bg-blue-500 py-2 px-4 rounded-md shadow hover:bg-blue-600 transition">
                                <GoDownload className="mr-2" /> Bulk Export
                            </button>
                        </div>
                        <div className="w-full">
                            {activeTab === "Payments" ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg">
                                        <thead>
                                            <tr className="bg-[#5B6CFF] text-white rounded-lg">
                                                <th className="px-4 py-2 whitespace-nowrap">Sr. No.</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Name</th>
                                                <th className="px-4 py-4 whitespace-nowrap flex items-center justify-center">
                                                    Amount
                                                    {sortOrder.amount === 'asc' ? (
                                                        <FaAngleUp className="pl-1 cursor-pointer" />
                                                    ) : (
                                                        <FaAngleDown className="pl-1 cursor-pointer" />
                                                    )}
                                                </th>
                                                <th className="px-4 py-2 whitespace-nowrap">Platform</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Status</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Payment Date and Time</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Type</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Invoice</th>
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
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{endIndex + index + 1}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{item.website_name}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.totalRevenue || 0}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">Paypal</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                            {item.status === 'active' && (
                                                                <span className="text-[#059000]">Complete</span>
                                                            )}
                                                            {item.status === 'inactive' && (
                                                                <span className="text-[#FF1F1F]">Failed</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">Banner</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-base text-[#5B6CFF] font-semibold cursor-pointer underline" onClick={() => openEmbedModal(item.website_id)}>
                                                            Get Invoice
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg">
                                        <thead>
                                            <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                                                <th className="px-4 py-2 whitespace-nowrap">Sr. No.</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Name</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Amount</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Platform</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Status</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Payment Date and Time</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Type</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Invoice</th>
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
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{endIndex + index + 1}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{item.website_name}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.createdAt).toLocaleString()}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.totalRevenue || 0}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-base text-[#5B6CFF] font-semibold cursor-pointer underline" onClick={() => openEmbedModal(item.website_id)}>
                                                            Get Invoice
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
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
                ) : (activeTab === "ManualPayments") ? (
                    <div className="w-full bg-white rounded-lg p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                            <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                                <div className="flex items-center border border-gray-300 p-2 text-sm rounded-xl bg-white shadow-sm w-[16rem]">
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
                                {activeTab === "ManualPayments" && (
                                    <>
                                        <div className="w-[10rem]">
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
                                        <div className="w-[15rem]">
                                            <Datepicker
                                                inputClassName="border border-[#D1D5DB] rounded-xl w-full h-10 px-2 text-[#657488]"
                                                popoverDirection="down"
                                                placeholder="Start and End Date"
                                                value={value}
                                                onChange={(newValue) => setValue(newValue)}
                                            />
                                        </div>
                                        {(type !== "" || searchByName !== "" || status !== "" || updatedDate !== null || value.startDate || value.endDate) && (
                                            <button onClick={handleClear} className="text-blue-600">
                                                Clear
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            <button className="flex items-center justify-center text-white bg-blue-500 py-2 px-4 rounded-md shadow hover:bg-blue-600 transition">
                                <GoDownload className="mr-2" /> Bulk Export
                            </button>
                        </div>
                        <div className="w-full">
                            {activeTab === "ManualPayments" ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg">
                                        <thead>
                                            <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                                                <th className="px-4 py-2 whitespace-nowrap">Sr. No.</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Name</th>
                                                <th className="px-4 py-4 whitespace-nowrap flex items-center justify-center">
                                                    Amount
                                                    {sortOrder.amount === 'asc' ? (
                                                        <FaAngleUp className="pl-1 cursor-pointer" />
                                                    ) : (
                                                        <FaAngleDown className="pl-1 cursor-pointer" />
                                                    )}
                                                </th>
                                                <th className="px-4 py-2 whitespace-nowrap">Status</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Payment Date and Time</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Type</th>
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
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{endIndex + index + 1}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{item.website_name}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.totalRevenue || 0}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                            {item.status === 'active' && (
                                                                <span className="text-[#059000]">Complete</span>
                                                            )}
                                                            {item.status === 'inactive' && (
                                                                <span className="text-[#FF1F1F]">Failed</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">Banner</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg">
                                        <thead>
                                            <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                                                <th className="px-4 py-2 whitespace-nowrap">Sr. No.</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Name</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Amount</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Status</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Payment Date and Time</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Type</th>
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
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{endIndex + index + 1}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{item.website_name}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.createdAt).toLocaleString()}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.totalRevenue || 0}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
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
                ) : (
                    <div className="w-full bg-white rounded-lg p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                            <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
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
                                <>
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
                                    {(type !== "" || searchByName !== "") && (
                                        <button onClick={handleClear} className="text-blue-600">
                                            Clear
                                        </button>
                                    )}
                                </>
                            </div>
                            <button className="flex items-center text-white bg-blue-500 py-2 px-4 rounded-md shadow hover:bg-blue-600 transition">
                                <GoDownload className="mr-2" /> Bulk Export
                            </button>
                        </div>
                        <div className="w-full">
                            {activeTab === "PendingPayments" ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg">
                                        <thead>
                                            <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                                                <th className="px-4 py-2 whitespace-nowrap">Sr. No.</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Name</th>
                                                <th className="px-4 py-4 whitespace-nowrap flex items-center justify-center">
                                                    Amount
                                                    {sortOrder.amount === 'asc' ? (
                                                        <FaAngleUp className="pl-1 cursor-pointer" />
                                                    ) : (
                                                        <FaAngleDown className="pl-1 cursor-pointer" />
                                                    )}
                                                </th>
                                                <th className="px-4 py-2 whitespace-nowrap">Payment Status</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Type</th>
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
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{endIndex + index + 1}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{item.website_name}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.totalRevenue || 0}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm"><button>Pay</button></td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">Banner</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg">
                                        <thead>
                                            <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                                                <th className="px-4 py-2 whitespace-nowrap">Sr. No.</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Name</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Amount</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Payment Status</th>
                                                <th className="px-4 py-2 whitespace-nowrap">Ad Type</th>
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
                                                        <td className="px-4 py-2 whitespace-nowraptext-sm">{endIndex + index + 1}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{item.website_name}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.totalRevenue || 0}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm"><button>Pay</button></td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">Banner</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
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
                )}
            </div>
            <ToastContainer />
        </div>
    );
}

export default AdvertiserPayments