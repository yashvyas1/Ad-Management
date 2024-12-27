import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import PaginationFile from "../pagination/PaginationFile";
import { getRequest } from "@/services/backendAPIsServices";
import useModal from "@/hooks/useModal";
import Modal from "@/components/common/Modal";

const AdminCategoryList = () => {
  const { openModal } = useModal();
  const [currentRecords, setCurrentRecords] = useState([]);
  const [data, setData] = useState([]);
  const [endIndex, setEndIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = useCallback((pageData, endValue) => {
    setCurrentRecords(pageData);
    setEndIndex(endValue);
  }, []);

  const getData = async () => {
    const result = await getRequest("/api/admin/getcategory");
    try {
         if (result) {
        setData(result?.categoriesData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);
  const search = (e) => {
    const searchValue = e.target.value.toLowerCase();
    if (searchValue.length === 0) {
      getData();
    } else {
      const searchedAds = data?.filter((item) =>
        item.category.toLowerCase().includes(searchValue)
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

  const handleCategory = () => {
    openModal("AdCategoryAdminModal",{ getData});
  };
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 p-1 w-full">
        <div className="text-lg font-semibold">Category</div>
        <div>
          <button
            className="bg-blue-600 p-2 text-white rounded-md"
            onClick={()=>handleCategory()}
          >
            Add Category
          </button>
        </div>
      </div>
      <div className="bg-white rounded-md p-3 shadow-lg mt-3">
        <div className="flex items-center border border-gray-300 p-2 text-sm rounded-xl bg-white shadow-sm w-full lg:w-72">
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
        <div className="mx-auto mt-2">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="px-4 py-4 whitespace-nowrap">Sr. No.</th>
                  <th className="px-4 py-4 whitespace-nowrap">Category Name</th>
                  <th className="px-4 py-4 whitespace-nowrap">
                    Created Date and Time
                  </th>
                  <th className="px-4 py-4 whitespace-nowrap">
                    Updated Date and Time
                  </th>
                </tr>
              </thead>
              {
                data?.length === 0 ?<tbody>
                  <tr>
                  <td></td>
                    <td></td>
                    <td>
                    <p className="flex justify-center text-gray-800 text-sm p-4">
                            No Data Found
                          </p>
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>: <tbody>
                {currentRecords?.map((item, index) => (
                  <tr key={item.id} className="text-center border-b">
                    <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">
                      {endIndex+index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">
                      {item?.category}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">
                      {new Date(item?.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">
                      {new Date(item?.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              }
             
            </table>
          </div>
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
      </div>
      <Modal />
    </>
  );
};

export default AdminCategoryList;
