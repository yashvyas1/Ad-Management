import React, { useMemo } from "react";
import useModal from "@/hooks/useModal";
import Modal from "@/components/common/Modal";

const CampaignListTable = () => {
  const { isModalOpen, modalContent, openModal, closeModal } = useModal();

  const handleActionChange = (e, row) => {
    const action = e.target.value;
    if (action === "View") {
      openModal("CampaingViewModal", { row });
    }
  };

  const data = useMemo(
    () => [
      {
        srNo: "01",
        name: "My New Campaign",
        startDate: "21 June 2024",
        status: "Active",
        url: "ABCnewcampaign.in",
        clickCount: 24900,
        totalAds: 48900,
        budget: "1,24,900 ₹",
      },
      {
        srNo: "02",
        name: "My New Campaign",
        startDate: "21 June 2024",
        status: "Inactive",
        url: "ABCnewcampaign.in",
        clickCount: 24900,
        totalAds: 24900,
        budget: "1,24,900 ₹",
      },
    ],
    []
  );

  const headers = useMemo(
    () => [
      { key: "srNo", displayName: "Sr. No." },
      { key: "name", displayName: "Campaign Name" },
      { key: "startDate", displayName: "Start Date" },
      { key: "status", displayName: "Status" },
      { key: "url", displayName: "Website URL" },
      { key: "clickCount", displayName: "Click Count" },
      { key: "totalAds", displayName: "Total ADs" },
      { key: "budget", displayName: "Total Budget" },
      { key: "action", displayName: "Action" },
    ],
    []
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-blue-200 dark:bg-slate-700">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-b"
              >
                {header.displayName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={`${
                idx % 2 === 0
                  ? "bg-gray-50 dark:bg-slate-800"
                  : "bg-white dark:bg-slate-700"
              } hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors`}
            >
              {headers.map((header, index) => (
                <td
                  key={index}
                  className="p-3 text-sm text-gray-700 dark:text-gray-300 border-b text-center"
                >
                  {header.key === "status" ? (
                    <span
                      className={`font-semibold ${
                        row[header.key] === "Active"
                          ? "text-success-600 bg-green-200 p-1 rounded-full px-3"
                          : "text-warning-600 bg-red-200 p-1 rounded-full px-2"
                      }`}
                    >
                      {row[header.key]}
                    </span>
                  ) : header.key === "action" ? (
                    <select
                      className="border border-gray-300 rounded-md text-sm dark:bg-slate-700 dark:text-gray-300"
                      onChange={(e) => handleActionChange(e, row)}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        select
                      </option>
                      <option value="View">View</option>
                      <option value="Pause">Pause</option>
                      <option value="Stop">Stop</option>
                    </select>
                  ) : (
                    row[header.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Per page record: 10
        </span>
        <div className="flex space-x-2">
          <button className="p-2 text-sm text-gray-500 dark:text-gray-400">
            &lt;
          </button>
          <button className="p-2 text-sm text-gray-500 dark:text-gray-400">
            &gt;
          </button>
        </div>
      </div>

          <Modal isOpen={isModalOpen} modalContent={modalContent} closeModal={closeModal} />
    </div>
  );
};

export default CampaignListTable;
