import React, { useMemo } from "react";
const CampaignsTable = () => {
  const data = useMemo(
    () => [
      {
        campaign: "Digital Marketing",
        cost: "INR 560",
        clicks: 55,
        ctr: "02.25%",
      },
      { campaign: "SCO", cost: "INR 560", clicks: 44, ctr: "26.25%" },
      { campaign: "Remarketing", cost: "INR 560", clicks: 34, ctr: "29.25%" },
      {
        campaign: "PPC Management",
        cost: "INR 560",
        clicks: 45,
        ctr: "09.25%",
      },
      {
        campaign: "Social Media Marketing",
        cost: "INR 560",
        clicks: 54,
        ctr: "10.05%",
      },
      { campaign: "Remarketing", cost: "INR 560", clicks: 34, ctr: "29.25%" },
      {
        campaign: "PPC Management",
        cost: "INR 560",
        clicks: 45,
        ctr: "09.25%",
      },
      {
        campaign: "Social Media Marketing",
        cost: "INR 560",
        clicks: 54,
        ctr: "10.05%",
      },
    ],
    []
  );
  const headers = useMemo(
    () => [
      { key: "campaign", displayName: "Campaign Name" },
      { key: "cost", displayName: "Cost" },
      { key: "clicks", displayName: "Clicks" },
      { key: "ctr", displayName: "CTR (%)" },
    ],
    []
  );

  return (
    <div className="grid w-full grid-cols-1 bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <strong className="md:text-lg font-bold text-[#212227]  dark:text-[#CBD5E1]">Campaigns</strong>
        <button className="text-blue-600">View All</button>
      </div>
      <div className="overflow-x-auto">
        <div className="max-h-72 overflow-y-auto">
          <table className="min-w-full table-auto text-black border border-gray-200">
            <thead className="bg-gray-50   dark:bg-slate-800 sticky top-0 z-10 ">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="p-2 py-4 border-b font-semibold text-[#212227]  dark:text-[#CBD5E1] border-gray-200"
                  >
                    {header.displayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {headers.map((header, index) => (
                    <td
                      key={index}
                      className="p-4 text-center text-sm border-b border-gray-200"
                    >
                      {header.key === "ctr" ? `${row[header.key]}` : row[header.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignsTable;
