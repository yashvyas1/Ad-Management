import React, { useEffect, useRef, useState } from "react";
import useModal from "@/hooks/useModal";
import { IoClose } from "react-icons/io5";
import { postRequest } from "@/services/backendAPIsServices";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AdCategoryAdminModal = ({ data }) => {
  const modalRef = useRef();
  const { closeModal } = useModal();

  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  const handleClear = () => {
    setCategoryName("");
  };

  const handleSave = async() => {
    if (categoryName === "") {
      setError("Add Category Name");
    } else {
      try {
        const result = await postRequest("/api/admin/addcategory", {
          category: categoryName,
        });
       
        if (result) {
          toast.success(result?.message)   
    closeModal();
          setError("");
          setCategoryName("");
          data?.getData()
 
        }
      } catch (error) {
        console.error(error)
        toast.error(error?.response?.data?.message)
      }
    }

  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [closeModal]);

  return (
    <div className="flex items-center justify-center bg-opacity-50 z-50 mt-14">
      {" "}
      <div
        ref={modalRef}
        className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-2xl bg-white rounded-lg shadow-xl p-6 sm:p-8 mx-2 relative mt-8 mb-4 max-h-[80vh] overflow-y-auto"
      >
        {" "}
        <div className="flex justify-between items-center mb-4">
          {" "}
          <h2 className="text-lg md:text-xl font-semibold">
            Add Category
          </h2>{" "}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-500"
          >
            <IoClose size={24} />
          </button>
        </div>{" "}
        <div className="mb-4 mt-4">
          {" "}
          <label
            htmlFor="categoryName"
            className="text-sm font-medium text-gray-700 "
          >
            {" "}
            Category Name{" "}
          </label>{" "}
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Category Name"
          />{" "}
          <span className="text-xs text-red-600">{error}</span>
        </div>{" "}
        <div className="flex justify-between gap-2 sm:gap-5 mt-6">
          <button
            type="button"
            onClick={handleClear}
            className="w-full sm:w-32 md:w-40 h-12 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none "
          >
            Clear{" "}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className=" w-full sm:w-32 md:w-40 h-12 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none "
          >
            Save{" "}
          </button>
        </div>
      </div>{" "}
      {/* <ToastContainer /> */}
    </div>
  );
};

export default AdCategoryAdminModal;
