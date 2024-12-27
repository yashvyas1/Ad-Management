import Icons from "@/components/ui/Icon";
import useModal from "@/hooks/useModal";
import { useEffect, useRef, useState } from "react";
import { RiFolderUploadFill } from "react-icons/ri";

function AdminUploadImageModal() {
  const modalRef = useRef();
  const { closeModal } = useModal();
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef();

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  const handleImageSave = () => {};

  return (
    <div className="flex items-center justify-center bg-opacity-50 z-50">
      <div className="w-full max-w-[20rem] sm:max-w-[24rem] md:max-w-[36rem] bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 mx-2 sm:mx-4 md:mx-10 relative max-h-[90vh] overflow-y-auto ">
        <div className="flex items-center justify-between">
          <div className="text-gray-600 text-sm">Upload Photo</div>
          <div className="ml-auto">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <Icons icon="iconamoon:close-fill" width="20" height="20" />
            </button>
          </div>
        </div>
        <div className="text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <div className="flex flex-col items-center space-y-3 mt-2">
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-56 h-56 flex flex-col items-center justify-center border rounded-full cursor-pointer"
            >
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <>
                  <RiFolderUploadFill className="text-blue-500 w-36 h-36" />
                  <p className="text-gray-600 text-center text-sm">Upload</p>
                  <p className="text-gray-600 text-center text-sm">
                    image here.
                  </p>
                </>
              )}
            </div>
            <span className="text-gray-600 text-center text-sm">or</span>
            <div
              onClick={() => fileInputRef.current.click()}
              className="border border-gray-200 px-4 py-2 rounded-md cursor-pointer"
            >
              Upload A Photo
            </div>
          </div>

          <div className="border border-b-1 w-[496px] mt-4 border-[#939393]"></div>

          <div className="flex gap-4 w-full mt-6">
            <div
              onClick={closeModal}
              className="border border-gray-200 px-4 py-2 text-sm ml-auto font-medium text-gray-600 rounded-md hover:bg-gray-300 focus:outline-none cursor-pointer"
            >
              Cancel
            </div>
            <div
              className={`px-4 py-2 text-sm text-white font-medium rounded-md focus:outline-none ${
                uploadedImage
                  ? "bg-[#5B6CFF] hover:bg-[#5162fa] cursor-pointer"
                  : "bg-[#D1E9FF] cursor-not-allowed"
              }`}
              disabled={!uploadedImage}
              onClick={() => {
                if (uploadedImage) {
                  handleImageSave();
                }
              }}
            >
              Save
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUploadImageModal;
