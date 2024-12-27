import React, { useEffect, useRef } from "react";
import Icons from "@/components/ui/Icon";
import useModal from "@/hooks/useModal";

const ImagePreviewModal = ({ data }) => {
  const modalRef = useRef();
  const { closeModal } = useModal();

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

  const isVideo = data?.row?.file_path?.endsWith(".mp4");

  return (
    <div className="flex items-center justify-center bg-opacity-50 z-50 mt-14">
      <div
        ref={modalRef}
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-lg shadow-xl p-6 sm:p-8 mx-2 relative mt-8 mb-4 max-h-[80vh] overflow-y-auto"
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={closeModal}
        >
          <Icons icon="iconamoon:close-fill" width="24" height="24" />
        </button>

        <div className="p-4">
          {isVideo ? (
            <video
              src={data?.row?.file_path}
              controls
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          ) : (
            <img
              src={data?.row?.file_path}
              alt="Ad Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
