import React, { useCallback, useEffect, useState } from "react";
import { RiLinkM, RiVerifiedBadgeLine } from "react-icons/ri";
import { MdOutlineDoNotDisturb, MdKeyboardArrowDown } from "react-icons/md";
import { AiFillDelete } from "react-icons/ai";
import { CiSearch } from 'react-icons/ci';
import { RxCross1 } from "react-icons/rx";
import PaginationFile from "@/components/admin/pagination/PaginationFile";
import Datepicker from "react-tailwindcss-datepicker";
import { postRequest, deleteRequest, getRequest, patchRequest } from "../../../services/backendAPIsServices";
import { useForm } from "react-hook-form";
import Modal from "@/components/common/Modal";
import useModal from "@/hooks/useModal";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

function PublisherListTable() {
    const [status, setStatus] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentRecords, setCurrentRecords] = useState([]);
    const [modalMessage, setModalMessage] = useState("");
    const [selectedAction, setSelectedAction] = useState("");
    const [showAddWebsiteModal, setShowAddWebsiteModal] = useState(false);
    const [updatedDate, setUpdatedDate] = useState(null);
    const [isCheck, setIsCheck] = useState(false);
    const [data, setData] = useState([]);
    const [searchByName, setSearchByName] = useState("");
    const { openModal, closeModal } = useModal();
    const [endIndex, setEndIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCustomFields, setShowCustomFields] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    const [selectedAllowCategories, setSelectedAllowCategories] = useState([]);
    const [selectedDisallowCategories, setSelectedDisallowCategories] = useState([]);
    const { handleSubmit, register, reset, formState: { errors } } = useForm();
    const [sortOrder, setSortOrder] = useState({ amount: 'asc', adType: 'asc' });
    const [sortedData, setSortedData] = useState(data);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);

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
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        getData();
    }, [status, updatedDate]);

    const addWebsite = async (formData) => {
        const data = {
            ...formData,
            selectcategory: Array.isArray(formData.selectcategory) ? formData.selectcategory : [formData.selectcategory],
            allowcategory: selectedAllowCategories,
            disallowcategory: selectedDisallowCategories,
        };

        try {
            setSubmitting(true);
            let payload = {};
            if (data?.selectcategory[0] === "all") {
                payload = { ...data, disallowcategory: [], allowcategory: [] };
            } else {
                payload = data;
            }
            if (data?.selectcategory[0] === "custom" && selectedAllowCategories?.length !== 0 && selectedDisallowCategories?.length !== 0) {
                const response = await postRequest("/api/publisher/addwebsite", payload);

                if (response.message === "Website Added Successfully!") {
                    toast.success("Website Added Successfully!", {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                    closeModalAndReset();
                    getData();
                }
            } else {
                if (data?.selectcategory[0] === "all") {
                    const response = await postRequest("/api/publisher/addwebsite", payload);

                    if (response.message === "Website Added Successfully!") {
                        toast.success("Website Added Successfully!", {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 3000,
                        });
                        closeModalAndReset();
                        getData();
                    }
                } else {
                    if (selectedAllowCategories.length === 0 && selectedDisallowCategories.length !== 0) {
                        toast.error("Select at least one allow category")
                    } else if (selectedDisallowCategories.length === 0 && selectedAllowCategories.length !== 0) {
                        toast.error("Select at least one disallow category")
                    } else {
                        toast.error("Add Allow Categoires and Disallow categories")
                    }
                }
            }

        } catch (err) {
            if (err.response && err.response.data.message === "Website URL already exists!") {
                toast.error("Website URL already exists!", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            } else {
                toast.error("An error occurred. Please try again.", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            }
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setIsCheck(true);
            setSelectedRows(currentRecords?.map((record) => record.website_id));
        } else {
            setIsCheck(false);
            setSelectedRows([]);
        }
    };

    const handleSelectAllData = () => {
        setIsCheck(true);
        setSelectedRows(data?.map((record) => record.website_id));
    };

    const handleSelectRow = (website_id) => {
        if (selectedRows.includes(website_id)) {
            setSelectedRows(selectedRows.filter((row) => row !== website_id));
        } else {
            setSelectedRows([...selectedRows, website_id]);
        }
    };

    const closeModalAndReset = () => {
        setShowAddWebsiteModal(false);
        reset();
        setShowCustomFields(false);
        setSelectedAllowCategories([]);
        setSelectedDisallowCategories([]);
    };

    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === 'custom') {
            setShowCustomFields(true);
            fetchCategories();
        } else {
            setShowCustomFields(false);
        }
    };

    const handleAllowCategoryChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setSelectedAllowCategories(selectedValues);
    };

    const handleDisallowCategoryChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setSelectedDisallowCategories(selectedValues);
    };

    const getFilteredAllowCategories = () => {
        return categoryData.filter(item => !selectedDisallowCategories.includes(item.value));
    };

    const getFilteredDisallowCategories = () => {
        return categoryData.filter(item => !selectedAllowCategories.includes(item.value));
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
            openModal("AdvertiserAdsViewModal", { row });
        } else if (action === "Preview") {
            openModal("ImagePreviewModal", { row });
        } else {
            setModalMessage(modalContentString);
            setSelectedAction(action);
            setSelectedRows(row);
            setSelectedAction(action.toLowerCase());
            openModal("ActionConfirmationModal", { action });
        }
    };

    const handleConfirmAction = async () => {
        try {
            let website_ids = [];
            if (selectedRows.length > 0) {
                website_ids = selectedRows;
            } else if (selectedRows?.website_id) {
                website_ids = [selectedRows?.website_id];
            }
            if (!Array.isArray(website_ids) || website_ids.length === 0) {
                toast.error("No Ads Selected for Action.");
                return;
            }
            if (selectedAction === "delete") {
                const data = { website_ids };
                await deleteRequest("/api/publisher/deletewebsite", data);
                toast.success("Ads Deleted Successfully.");
            } else if (selectedAction === "approve" || selectedAction === "decline") {
                const permissionStatus =
                    selectedAction === "approve" ? "approved" : "decline";
                const data = {
                    website_ids,
                    permission: permissionStatus,
                };
                await patchRequest("/api/publisher/updateadpermission", data);
                toast.success(`Ads ${permissionStatus} Successfully.`);
            } else {
                const data = {
                    website_ids,
                    action: selectedAction.toLowerCase(),
                };
                await patchRequest("/api/publisher/updatewebsitesatatus", data);
                toast.success(`${selectedAction} Action Successfully`);
            }

            setSelectedRows([]);
            getData();
            closeModal();
        } catch (error) {
            console.error("Error performing action:", error);
            toast.error(`Failed to ${selectedAction} the Websites`);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getRequest("/api/advertiser/selected-data");
            if (response?.category) {
                const formattedCategories = response.category.map((category) => ({
                    label: category,
                    value: category.toLowerCase(),
                }));
                setCategoryData(formattedCategories);
            }
        } catch (error) {
            console.error("Failed to fetch category data:", error);
        }
    };

    const handlePageChange = useCallback((pageData, value) => {
        setCurrentRecords(pageData);
        setEndIndex(value)
    }, []);

    const closeAddWebsiteModal = () => {
        setShowAddWebsiteModal(false);
        reset();
    };

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

    const sortData = (field, order) => {
        const sorted = [...data].sort((a, b) => {
            if (field === 'totalRevenue') {
                return order === 'asc' ? a.ad_budget - b.ad_budget : b.ad_budget - a.ad_budget;
            } else if (field === 'total_clicks') {
                return order === 'asc' ? a.total_clicks.localeCompare(b.total_clicks) : b.total_clicks.localeCompare(a.total_clicks);
            }
            return 0;
        });
        setSortedData(sorted);
    };

    const handleSortRevenueClick = () => {
        const newOrder = sortOrder.totalRevenue === 'asc' ? 'desc' : 'asc';
        setSortOrder((prev) => ({ ...prev, totalRevenue: newOrder }));
        sortData('totalRevenue', newOrder);
    };

    const handleSortClicks = () => {
        const newOrder = sortOrder.total_clicks === 'asc' ? 'desc' : 'asc';
        setSortOrder((prev) => ({ ...prev, total_clicks: newOrder }));
        sortData('total_clicks', newOrder);
    };

    const handleCategoryClick = (categories) => {
        setSelectedCategories(categories);
        setShowCategoryModal(true);
    };

    return (
        <div>
            <div className="min-h-screen bg-gray-100 p-4 lg:p-2">
                <div className="w-full lg:p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-lg lg:text-lg font-bold text-[#444444]">Website Details</h1>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition" onClick={() => setShowAddWebsiteModal(true)}>
                            Add Website
                        </button>
                    </div>

                    {showAddWebsiteModal && (
                        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 md:mt-14">
                            <div className="absolute inset-0 bg-gray-400 bg-opacity-50 backdrop-blur-sm"></div>
                            <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl sm:text-2xl font-semibold">Add Website</h2>
                                    <button onClick={closeModalAndReset} className="text-gray-500 text-lg sm:text-xl">
                                        <RxCross1 />
                                    </button>
                                </div>
                                <form className="space-y-4" onSubmit={handleSubmit(addWebsite)}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Website Name<span className="text-red-500">*</span></label>
                                        <input type="text" className="mt-1 p-2 border border-gray-300 rounded-lg w-full" placeholder="Enter Website Name" {...register("websitename", { required: "Website Name is required" })} />
                                        {errors.websitename && <p className="text-red-500 text-sm">{errors.websitename.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Website URL<span className="text-red-500">*</span></label>
                                        <input type="text" className="mt-1 p-2 border border-gray-300 rounded-lg w-full" placeholder="Enter Website URL" {...register("website", {
                                            required: "Website URL is required",
                                            pattern: {
                                                value: /^https:\/\/.+/,
                                                message: "URL must start with https://"
                                            }
                                        })} />
                                        {errors.website && <p className="text-red-500 text-sm">{errors.website.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Category<span className="text-red-500">*</span></label>
                                        <select
                                            className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                            {...register("selectcategory", { required: "Please select a category" })}
                                            onChange={handleCategoryChange}
                                        >
                                            <option value="">Select Category</option>
                                            <option value="all">All Category</option>
                                            <option value="custom">Custom Category</option>
                                        </select>
                                        {errors.selectcategory && <p className="text-red-500 text-sm">{errors.selectcategory.message}</p>}
                                    </div>
                                    {showCustomFields && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Allow Category<span className="text-red-500">*</span>
                                                </label>
                                                <Select
                                                    isMulti
                                                    options={getFilteredAllowCategories()}
                                                    value={categoryData.filter(option => selectedAllowCategories.includes(option.value))}
                                                    onChange={handleAllowCategoryChange}
                                                    placeholder="Select Allowed Category"
                                                />
                                                {errors.allowcategory && <p className="text-red-500 text-sm">{errors.allowcategory.message}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Disallow Category<span className="text-red-500">*</span>
                                                </label>
                                                <Select
                                                    isMulti
                                                    options={getFilteredDisallowCategories()}
                                                    value={categoryData.filter(option => selectedDisallowCategories.includes(option.value))}
                                                    onChange={handleDisallowCategoryChange}
                                                    placeholder="Select Disallowed Category"
                                                />
                                                {errors.disallowcategory && <p className="text-red-500 text-sm">{errors.disallowcategory.message}</p>}
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Choose position for Ads<span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    value="right_sidebar"
                                                    {...register("adPositions")}
                                                    className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded"
                                                />
                                                <span className="text-gray-700">Right Side Bar</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    value="left_sidebar"
                                                    {...register("adPositions")}
                                                    className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded"
                                                />
                                                <span className="text-gray-700">Left Side Bar</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    value="top_bar"
                                                    {...register("adPositions")}
                                                    className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded"
                                                />
                                                <span className="text-gray-700">Top of the Bar</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    value="bottom_page"
                                                    {...register("adPositions")}
                                                    className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded"
                                                />
                                                <span className="text-gray-700">Bottom of the Page</span>
                                            </label>
                                        </div>
                                        {errors.adPositions && <p className="text-red-500 text-sm">{errors.adPositions.message}</p>}
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            className={`bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-md shadow hover:bg-blue-600 transition ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={submitting}
                                        >
                                            {submitting ? "Adding..." : "Add"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

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
                                <div className="relative w-full lg:w-auto ">
                                    <select
                                        onChange={(e) => setStatus(e.target.value)}
                                        value={status}
                                        className="bg-white dark:bg-slate-800 py-3 px-2 pr-7 border rounded-xl text-gray-400 dark:text-[#CBD5E1] focus:outline-none appearance-none w-full lg:w-auto"
                                    >
                                        <option value="">Verification</option>
                                        <option value="active">Verified</option>
                                        <option value="inactive">Unverified</option>
                                    </select>
                                    <MdKeyboardArrowDown className="absolute top-1/2 right-1 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                                </div>

                                {
                                    searchByName === "" &&
                                        status === "" ? (
                                        ""
                                    ) : (
                                        <button onClick={handleClear} className="text-blue-600">
                                            Clear
                                        </button>
                                    )}
                            </div>

                            <div className="flex space-x-4 items-center w-full md:w-auto justify-end">
                                {selectedRows?.length > 0 && (
                                    <div className="flex space-x-4 justify-end mt-4 lg:mt-0">
                                        <div className="relative group">
                                            <button
                                                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#FF1F1F] text-[#FF1F1F] hover:bg-red-100 transition-all"
                                                onClick={() => handleActionChange("Delete", selectedRows)}
                                            >
                                                <AiFillDelete size={20} />
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
                                {
                                    (
                                        selectedRows?.length > 0) ? (
                                        <div className="text-center mb-1 text-sm font-semibold">
                                            {` All ${selectedRows?.length} ads on this page are selected. `}
                                            <button className="text-indigo-500" onClick={handleSelectAllData}>{`Select all ${data?.length} website`}</button>
                                        </div>
                                    ) : (
                                        ""
                                    )
                                }
                                <div className="overflow-x-auto">
                                    <table className="w-full bg-white rounded-lg">
                                        <thead>
                                            <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                                                <th className="px-4 py-4 whitespace-nowrap font-semibold text-sm">
                                                    <input
                                                        type="checkbox"
                                                        onChange={handleSelectAll}
                                                        checked={
                                                            (currentRecords.length > 0 && isCheck)
                                                        }
                                                    />
                                                </th>
                                                <th className="px-4 py-4 whitespace-nowrap">Sr. No.</th>
                                                <th className="px-4 py-4 whitespace-nowrap">Website Name </th>
                                                <th className="px-4 py-4 whitespace-nowrap">Website URL</th>
                                                <th className="px-4 py-4 whitespace-nowrap">Created Date and Time </th>
                                                <th className="px-4 py-4 whitespace-nowrap">Updated Date and Time </th>
                                                <th className="px-4 py-4 whitespace-nowrap">Category</th>
                                                <th className="px-4 py-4 whitespace-nowrap">Ad Position</th>
                                                <th className="px-4 py-4 whitespace-nowrap">
                                                    <span className="flex items-center justify-center">
                                                        Total Revenue
                                                        {sortOrder.totalRevenue === 'asc' ? (
                                                            <FaAngleUp className="pl-1 cursor-pointer" onClick={handleSortRevenueClick} />
                                                        ) : (
                                                            <FaAngleDown className="pl-1 cursor-pointer" onClick={handleSortRevenueClick} />
                                                        )}
                                                    </span>
                                                </th>
                                                <th className="px-4 py-4 whitespace-nowrap flex items-center justify-center">
                                                    <span className="flex items-center justify-center">
                                                        Clicks
                                                        {sortOrder.total_clicks === 'asc' ? (
                                                            <FaAngleUp className="pl-1 cursor-pointer" onClick={handleSortClicks} />
                                                        ) : (
                                                            <FaAngleDown className="pl-1 cursor-pointer" onClick={handleSortClicks} />
                                                        )}
                                                    </span>
                                                </th>
                                                <th className="px-4 py-4 whitespace-nowrap">Verification</th>
                                                <th className="px-4 py-4 whitespace-nowrap">Embed Code</th>
                                            </tr>
                                        </thead>
                                        {data?.length === 0 ? (
                                            <tbody>
                                                <tr>
                                                    <td colSpan="7" className="p-6 text-center">
                                                        <p className="text-gray-800 text-sm">No Data Found</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        ) : (
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
                                                        <tr key={index} className={`${selectedRows.includes(item.website_id) ? 'bg-[#E6EAEF]' : 'bg-white'} border-b text-center border-gray-300 hover:bg-gray-50`}>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRows.includes(item.website_id)}
                                                                    onChange={() => handleSelectRow(item.website_id)}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{endIndex + index + 1}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap capitalize">{item.website_name}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{item.website_url.replace(/^https?:\/\//, '')}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{new Date(item?.createdAt).toLocaleString()}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">sdfsdgsdg
                                                                {/* {item.categories[0]}
                                                                    {item.categories.length > 1 && (
                                                                    <span className="ml-2 text-sm font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full" onClick={() => handleCategoryClick(item.categories)}>
                                                                        +{item.categories.length - 1}
                                                                    </span>
                                                                )} */}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">Right, Top, Left</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{item.totalRevenue || 0}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{item.total_clicks}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                                {item.is_verified ? (
                                                                    <span className="flex items-center text-sm justify-center text-[#027A48] bg-[#ECFDF3] rounded-full w-24 h-8 mx-auto">
                                                                        <RiVerifiedBadgeLine className="mr-1" /> Verified
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center text-sm justify-center text-[#B42318] bg-[#FEF3F2] rounded-full w-32 h-8 mx-auto">
                                                                        <MdOutlineDoNotDisturb className="mr-1" /> Unverified
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap font-semibold cursor-pointer" onClick={() => openEmbedModal(item.website_id)}>
                                                                <RiLinkM className="text-blue-500 mx-auto" />
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>

                                        )}
                                    </table>
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
                        </div>
                    </div>
                </div>
            </div>
            {showCategoryModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-400 bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-xl lg:max-w-1xl w-full z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-semibold">Allowed Categories</h1>
                            <button onClick={() => setShowCategoryModal(false)}>
                                <RxCross1 size={20} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-10">
                            {selectedCategories.map((category, index) => (
                                <span key={index} className="bg-[#FFFFFF] text-[#444444] px-3 py-1 border border-gray-300 rounded-full">
                                    {category}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
            <Modal onConfirm={handleConfirmAction} />
        </div>
    );
}

export default PublisherListTable;