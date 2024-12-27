import Modal from "@/components/common/Modal";
import useModal from "@/hooks/useModal";
import { useState } from "react";
import { FaPen } from "react-icons/fa";

const Account = () => {
  const [publisherBankDetails, setPublisherBankDetails] = useState({
    bankName: "HDFC Bank",
    branchName: "Pune",
    accountHolder: "John Doe",
    ifscCode: "HDFC0000189",
    accountno: "09111134678950",
  });

  const { openModal } = useModal();

  const handleSave = (updatedData) => {
    setPublisherBankDetails(updatedData);
  };

  return (
    <div className="bg-white flex flex-col p-8 space-y-6 rounded-md shadow-md">
      <div className="flex w-full mb-4 gap-4">
        <div className="w-full md:w-1/3 font-semibold">Country</div>
        <div className="border border-gray-200 w-36 p-2 text-gray-400 rounded-md">
          India
        </div>
      </div>

      <div className="flex gap-4 flex-wrap md:flex-nowrap">
        <div className="w-full md:w-1/3 font-semibold">Payment Information</div>
        <div className="flex flex-col w-full md:w-2/3">
          <div
            className="ml-auto flex items-center"
            onClick={() => openModal("PublisherBankDetailsModal")}
          >
            <div className="text-blue-500 cursor-pointer">Edit</div>
            <FaPen className="text-blue-500 ml-2 cursor-pointer" />
          </div>

          <div className="flex flex-col gap-8 w-full">
            <div className="flex gap-8 items-center justify-between flex-wrap md:flex-nowrap">
              <div className="flex flex-col gap-2 w-full">
                <label className="font-medium">Bank Name</label>
                <div className="border border-gray-300 rounded-md p-2 w-full">
                  {publisherBankDetails.bankName}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="font-medium">Branch Name</label>
                <div className="border border-gray-300 rounded-md p-2 w-full">
                  {publisherBankDetails.branchName}
                </div>
              </div>
            </div>
            <div className="flex gap-8 items-center justify-between flex-wrap md:flex-nowrap">
              <div className="flex flex-col gap-2 w-full">
                <label className="font-medium">Account Holder Name</label>
                <div className="border w-full border-gray-300 rounded-md p-2">
                  {publisherBankDetails.accountHolder}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="font-medium">IFSC Code</label>
                <div className="border w-full border-gray-300 rounded-md p-2">
                  {publisherBankDetails.ifscCode}
                </div>
              </div>
            </div>
            <div className="flex gap-8 items-center justify-between flex-wrap md:flex-nowrap">
              <div className="flex flex-col gap-2 w-full md:pr-8">
                <label className="font-medium">Account No</label>
                <div className="border w-full md:w-1/2 border-gray-300 rounded-md p-2 md:max-w-[465px]">
                  {publisherBankDetails.accountno}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal data={publisherBankDetails} onSave={handleSave} />
    </div>
  );
};

export default Account;
