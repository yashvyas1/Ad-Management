import Icons from "@/components/ui/Icon";
import { getRequest } from "@/services/backendAPIsServices";
import React, { useCallback, useEffect, useState } from "react";
import PaginationFile from "../pagination/PaginationFile";
import { RiVerifiedBadgeLine } from "react-icons/ri";
import { MdOutlineDoNotDisturb } from "react-icons/md";

function PublisherWebsiteDetails({ insightViewHandler, data }) {
  const [insightData, setInsightData] = useState([]);
  const [currentRecords, setCurrentRecords] = useState([]);
  const [endIndex, setEndIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = useCallback((pageData, endValue) => {
    setCurrentRecords(pageData);
    setEndIndex(endValue);
  }, []);
  
  const getData = async () => {
    try {
      const result = await getRequest(
        `/api/admin/getAdInsight?ad_id=${data?.ad_id}`
      );
      setInsightData(result?.data);
    } catch (error) {}
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div className="flex gap-2">
        <button onClick={() => insightViewHandler("Website Details")}>
          <Icons icon="ion:arrow-back-outline" width="24" height="24" />
        </button>{" "}
        <p className="font-semibold text-lg ">
          Website Details
          <div className="text-gray-700 text-sm capitalize">
            <span className="text-gray-400 text-sm capitalize">
              {data?.Advertiser?.User?.name}
            </span>
          </div>
        </p>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border-collapse table-auto rounded-md shadow-md p-3">
          <thead className="bg-blue-500 text-white ">
            <tr>
              <th className="px-4 py-4 whitespace-nowrap ">Sr. No.</th>
              <th className="px-4 py-4 whitespace-nowrap">Website Name</th>
              <th className="px-4 py-4 whitespace-nowrap">Website URL</th>
              <th className="px-4 py-4 whitespace-nowrap">
                Create Date and Time
              </th>
              <th className="px-4 py-4 whitespace-nowrap">
                Update Date and Time
              </th>
              <th className="px-4 py-4 whitespace-nowrap">Verification</th>
            </tr>
          </thead>
          {insightData?.length === 0 ? (
            <tbody>
              <tr className="bg-white  border-b hover:bg-gray-100">
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
              </tr>
            </tbody>
          ) : (
            <tbody>
              {currentRecords?.map((row, index) => (
                <tr
                  key={row.id}
                  className="bg-white  border-b hover:bg-gray-100"
                >
                  <td className="p-4 text-center text-sm">
                    {endIndex + index + 1}
                  </td>
                  <td>{row?.website_name}</td>
                  <td className="p-4 text-sm">{row?.publisher_name}</td>
                  <td className="p-4 text-sm">
                    {new Date(row?.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(row?.updatedAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-sm text-center">
                    {item.is_verified ? (
                      <span className="flex items-center text-sm justify-center text-[#027A48] bg-[#ECFDF3] rounded-full w-24 h-8 mx-auto">
                        <RiVerifiedBadgeLine className="mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-sm justify-center text-[#B42318] bg-[#FEF3F2] rounded-full w-32 h-8 mx-auto">
                        <MdOutlineDoNotDisturb className="mr-1" /> UnVerified
                      </span>
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
          data={insightData}
          itemsPerPage={10}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default PublisherWebsiteDetails;

