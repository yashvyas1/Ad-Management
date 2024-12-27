import Icons from "@/components/ui/Icon";
import { getRequest } from "@/services/backendAPIsServices";
import React, { useCallback, useEffect, useState } from "react";
import PaginationFile from "../pagination/PaginationFile";

function AdsInsightTable({ insightViewHandler, data }) {
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
        <button onClick={() => insightViewHandler("insight")}>
          <Icons icon="ion:arrow-back-outline" width="24" height="24" />
        </button>{" "}
        <p className="font-semibold text-lg ">
          Ads Insights
          <div className="text-gray-700 text-sm capitalize">
            {data?.ad_name},{" "}
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
              <th className="px-4 py-4 whitespace-nowrap">Publisher Name</th>
              <th className="px-4 py-4 whitespace-nowrap">Website URL</th>
              <th className="px-4 py-4 whitespace-nowrap">
                Create Date and Time
              </th>
              <th className="px-4 py-4 whitespace-nowrap">
                Update Date and Time
              </th>
              <th className="px-4 py-4 whitespace-nowrap">Visits</th>
              <th className="px-4 py-4 whitespace-nowrap">Clicks</th>
              <th className="px-4 py-4 whitespace-nowrap">
                Start Date and Time
              </th>
              <th className="px-4 py-4 whitespace-nowrap">End Date and Time</th>
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
                  <td className="p-4 text-sm">{row?.website_url}</td>
                  <td className="p-4 text-sm">
                    {new Date(row?.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(row?.updatedAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-center text-sm">
                    {row?.total_visits}
                  </td>
                  <td className="p-4 text-center text-sm">
                    {row?.total_clicks}
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(row?.start_date).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(row?.end_date).toLocaleString()}
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

export default AdsInsightTable;
