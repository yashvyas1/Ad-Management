import React, { useEffect, useMemo, useCallback } from "react";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

const PaginationFile = React.memo(
  ({ data, itemsPerPage, onPageChange, currentPage, setCurrentPage }) => {
    const totalPages = useMemo(() => {
      if (!Array.isArray(data) || data.length === 0 || !itemsPerPage) {
        return 0;
      }
      return Math.ceil(data.length / itemsPerPage);
    }, [data, itemsPerPage]);

    const startIndex = useMemo(
      () => (currentPage - 1) * itemsPerPage,
      [currentPage, itemsPerPage]
    );
    const endIndex = useMemo(
      () => startIndex + itemsPerPage,
      [startIndex, itemsPerPage]
    );

    const handlePageChange = useCallback(
      (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
      },
      [totalPages, setCurrentPage]
    );

    useEffect(() => {
      if (Array.isArray(data) && data.length > 0) {
        const slicedData = data.slice(startIndex, endIndex);
        onPageChange(slicedData, startIndex);
      } else {
        onPageChange([]);
      }
    }, [currentPage, data, startIndex, endIndex, onPageChange]);

    return (
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full space-y-4 md:space-y-0">
        <div className="flex justify-center md:justify-start w-full md:w-auto">
          <div>Total Records: {data?.length}</div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 w-full md:w-auto space-y-4 md:space-y-0">
          {data?.length > 0 && (
            <span className="text-sm md:text-base text-center md:text-left">
              Page:{" "}
              <span className="text-blue-500 font-semibold">{currentPage}</span>
              /{totalPages}
            </span>
          )}

          {data?.length > 0 && (
            <span className="text-sm md:text-base text-center md:text-left">
              Per page record: {itemsPerPage}
            </span>
          )}

          <div className="flex justify-center md:justify-start space-x-2">
            <div className="relative group">
              <button
                className="bg-blue-500 p-2 rounded-lg text-white font-bold"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || data?.length === 0}
                aria-label="Previous Page"
              >
                <GrFormPrevious />
              </button>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Previous
              </span>
            </div>

            <div className="relative group">
              <button
                className="bg-blue-500 p-2 rounded-lg text-white font-bold"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || data?.length === 0}
                aria-label="Next Page"
              >
                <GrFormNext />
              </button>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Next
              </span>
            </div>
          </div>
        </div>
      </div>

    );
  }
);

export default PaginationFile;