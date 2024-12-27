import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import useModal from "@/hooks/useModal";

const ActionConfirmationModal = ({ data, onConfirm }) => {
  const modalRef = useRef();
  const { closeModal } = useModal();
  const { action } = data;

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
    <div className="flex items-center justify-center bg-opacity-50 z-50">
      <div
        ref={modalRef}
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl bg-white rounded-lg shadow-xl p-6 sm:p-8 mx-2 relative mt-8 mb-4 max-h-[80vh] overflow-y-auto"
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center text-gray-800 mb-6 mt-6 ">
          <span className="capitalize">
            {`Are you sure you want to ${action.toLowerCase()} the advertisement?`}
          </span>{" "}
        </h2>
        <div className="flex justify-between gap-2 sm:gap-5 mt-5">
          <button
            type="button"
            onClick={closeModal}
            className="w-full sm:w-32 md:w-40 h-12 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none mt-16"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className=" w-full sm:w-32 md:w-40 h-12 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none mt-16"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmationModal;
