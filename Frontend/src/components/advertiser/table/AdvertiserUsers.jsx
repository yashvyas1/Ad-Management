import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from 'react-icons/ci';
import { RxCross1 } from "react-icons/rx";
import { BiSolidEdit } from "react-icons/bi";
import Datepicker from "react-tailwindcss-datepicker";
import { toast, ToastContainer } from "react-toastify";
import Modal from "@/components/common/Modal";
import useModal from "@/hooks/useModal";
import Icons from "@/components/ui/Icon";
import PaginationFile from "@/components/admin/pagination/PaginationFile";
import { postRequest, deleteRequest, getRequest, patchRequest } from "../../../services/backendAPIsServices";

const AdvertiserUsers = () => {

    const [status, setStatus] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentRecords, setCurrentRecords] = useState([]);
    const [modalMessage, setModalMessage] = useState("");
    const [selectedAction, setSelectedAction] = useState("");
    const [updatedDate, setUpdatedDate] = useState(null);
    const [isCheck, setIsCheck] = useState(false);
    const [data, setData] = useState([]);
    const { openModal, closeModal } = useModal();
    const [endIndex, setEndIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const getData = async () => {
        let query = "?";
        if (status) query += `status=${status}&`;
        if (updatedDate?.startDate)
            query += `updateDate=${updatedDate?.startDate?.toISOString().split("T")[0]}&`;

        query = query.slice(0, -1);
        try {
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
                toast.success("Ads Deleted Successfully.");
            }

            setSelectedRows([]);
            getData();
            closeModal();
        } catch (error) {
            console.error("Error performing action:", error);
            toast.error(`Failed to ${selectedAction} the Websites`);
        }
    };

    const handlePageChange = useCallback((pageData, value) => {
        setCurrentRecords(pageData);
        setEndIndex(value)
    }, []);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setShowAddUserModal(false);
        }, 1000);
    };

    const closeModalAndReset = () => {
        setShowAddUserModal(false);
    };

    return (
        <div>
            <div className="min-h-screen bg-gray-100 p-4 lg:p-2">
                <div className="w-full lg:p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-semibold text-[#444444]">Users</h1>
                        <button className="bg-blue-500 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-600 transition" onClick={() => setShowAddUserModal(true)}>
                            Add New User
                        </button>
                    </div>
                    {showAddUserModal && (
                        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                            <div className="absolute inset-0 bg-gray-400 bg-opacity-30 backdrop-blur-sm"></div>
                            <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl text-[#444] font-semibold">Add Users Details</h2>
                                    <button onClick={closeModalAndReset} className="text-gray-500 text-lg">
                                        <RxCross1 />
                                    </button>
                                </div>
                                <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                                    <div>
                                        <label className="text-base font-semibold text-[#444]">
                                            User ID<span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" className="mt-1 p-2 border border-[#E6EAEF] rounded-lg w-full" required />
                                    </div>
                                    <div>
                                        <label className="text-base font-semibold text-[#444]">
                                            User Name<span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" className="mt-1 p-2 border border-[#E6EAEF] rounded-lg w-full" required />
                                    </div>
                                    <div>
                                        <label className="text-base font-semibold text-[#444]">
                                            Email ID<span className="text-red-500">*</span>
                                        </label>
                                        <input type="email" className="mt-1 p-2 border border-[#E6EAEF] rounded-lg w-full" required />
                                    </div>
                                    <div>
                                        <label className="text-base font-semibold text-[#444]">
                                            Phone Number<span className="text-red-500">*</span>
                                        </label>
                                        <input type="tel" className="mt-1 p-2 border border-[#E6EAEF] rounded-lg w-full" required />
                                    </div>
                                    <div>
                                        <label className="text-base font-semibold text-[#444]">
                                            Joining Date<span className="text-red-500">*</span>
                                        </label>
                                        <input type="date" className="mt-1 p-2 border border-[#E6EAEF] rounded-lg w-full" required />
                                    </div>
                                    <div>
                                        <label className="text-base font-semibold text-[#444]">
                                            Role<span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" className="mt-1 p-2 border border-[#E6EAEF] rounded-lg w-full" required />
                                    </div>
                                    <div className="col-span-2 flex justify-end mt-4">
                                        <button
                                            type="submit"
                                            className={`bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600 transition ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={submitting}
                                        >
                                            {submitting ? "Adding..." : "Add User"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    <div className="w-full bg-white rounded-lg p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                            <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                                <div className="flex items-center border border-[#E6EAEF] p-2 rounded-xl w-[15rem] bg-white shadow-sm">
                                    <CiSearch className="text-gray-400 text-xl mx-2" />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="w-full focus:outline-none text-gray-600"
                                        onChange={(e) => { search(e) }}
                                    />
                                </div>
                                <div className="w-[12rem]">
                                    <div className="relative rounded-xl border border-[#E6EAEF] py-1 w-full">
                                        <Datepicker
                                            useRange={false}
                                            asSingle={true}
                                            value={updatedDate}
                                            placeholder="Updated Date"
                                            onChange={(newValue) => setUpdatedDate(newValue)}
                                            inputClassName="w-full p-1 text-gray-500 placeholder-gray-400 rounded-md focus:outline-none"
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
                            <div className="w-full bg-white rounded-lg">
                                {
                                    (
                                        selectedRows?.length > 0) ? (
                                        <div className="text-center mb-1 text-sm font-semibold">
                                            {`All ${selectedRows?.length} ads on this page are selected.`}
                                            <button className="text-indigo-500" onClick={handleSelectAllData}>{`Select all ${data?.length} website`}</button>
                                        </div>
                                    ) : (
                                        ""
                                    )
                                }
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg">
                                        <thead>
                                            <tr className="bg-[#5B6CFF] text-white text-center rounded-lg">
                                                <th className="p-3 whitespace-nowrap font-semibold text-sm">
                                                    <input
                                                        type="checkbox"
                                                        onChange={handleSelectAll}
                                                        checked={
                                                            (currentRecords.length > 0 && isCheck)
                                                        }
                                                    />
                                                </th>
                                                <th className="px-4 py-2 whitespace-nowrap text-sm">Sr. No.</th>
                                                <th className="px-4 py-2 whitespace-nowrap text-sm">User ID</th>
                                                <th className="px-4 py-2 whitespace-nowrap text-sm">User Name</th>
                                                <th className="px-4 py-2 whitespace-nowrap text-sm">Created Date and Time </th>
                                                <th className="px-4 py-2 whitespace-nowrap text-sm">Updated Date and Time </th>
                                                <th className="px-4 py-2 whitespace-nowrap text-sm">Email ID</th>
                                                <th className="px-4 py-2 whitespace-nowrap text-sm">Phone No</th>
                                                <th className="px-4 py-2 whitespace-nowrap text-sm">Joining Date</th>
                                                <th className="px-4 py-2 whitespace-nowrap text-sm">Roles</th>
                                                <th className="px-4 py-2 whitespace-nowrap text-sm">Action</th>
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
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRows.includes(item.website_id)}
                                                                    onChange={() => handleSelectRow(item.website_id)}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{endIndex + index + 1}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{item.website_id}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{item.website_name}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.createdAt).toLocaleString()}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">prajwaldeshmukh@1xl.com</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">0985632145</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item?.updatedAt).toLocaleString()}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                                                                {item.is_verified ? (
                                                                    <span className="flex items-center text-sm justify-center text-[#027A48] bg-[#ECFDF3] rounded-full w-24 h-8 mx-auto">
                                                                        Verified
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center text-sm justify-center text-[#B42318] bg-[#FEF3F2] rounded-full w-32 h-8 mx-auto">
                                                                        UnVerified
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap"><BiSolidEdit className="" /></td>
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
            <ToastContainer />
            <Modal onConfirm={handleConfirmAction} />
        </div>
    )
}

export default AdvertiserUsers