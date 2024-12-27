import React from "react";
import adManagmentLogopublisherbankdetail from "../../assets/adManagmentLogopublisherbankdetail.svg";
import publisherBankdetail from "../../assets/publisherBankdetail.svg";
import adManagementLogo from "../../assets/adManagementLogo.svg";

const TextField = ({ label, name, type, placeholder }) => (
    <div className="mb-4">
        <label className="text-sm text-gray-600">
            {label}
            <span className="text-red-500"> *</span>
        </label>
        <input
            type={type}
            name={name}
            className="w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-opacity-40 focus:ring-blue-400 focus:border-blue-400 text-xs placeholder-gray-400"
            placeholder={placeholder}
        />
    </div>
);

const PublisherBankDetails = () => {
    return (
        <div className="flex w-screen h-screen">
            {/* Left Side - Logo, Image, and Text */}
            <div className="hidden md:flex md:w-1/2 justify-center items-center bg-[#5B6CFF] text-white flex-col">
                {/* Top Logo and Text */}
                <div className="flex items-center mb-16">
                    <img src={adManagmentLogopublisherbankdetail} alt="AD Management Logo" className="w-9 h-9 mr-2" />
                    <h2 className="text-3xl font-bold text-[#FFFFFF]">AD Management</h2>
                </div>

                {/* Central Large Logo */}
                <img src={publisherBankdetail} alt="Publisher Bank Detail Logo" className="w-1/2 mb-8 mt-4" />

                {/* Text */}
                <h2 className="text-2xl font-semibold mt-8 text-white">Lorem ipsum dolor sumit</h2>
                <p className="text-base mt-2 text-center font-normal opacity-60">
                    Lorem Ipsum is simply dummy text of the printing and <br /> typesetting.
                </p>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 p-8 md:p-16 bg-white flex flex-col justify-center">
                <div className="max-w-md mx-auto">
                    {/* Logo and Title */}
                    <div className="flex items-center mb-4">
                        <img src={adManagementLogo} alt="AD Management Logo" className="w-6 h-6 mr-2" />
                        <h2 className="text-2xl font-bold text-gray-800">AD Management</h2>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Bank Details</h3>

                    <form className="space-y-4">
                        <TextField label="Bank Name" name="bankName" type="text" placeholder="Bank Name" />
                        <TextField label="Branch Name" name="branchName" type="text" placeholder="Branch Name" />
                        <TextField label="Account Holder Name" name="accountHolderName" type="text" placeholder="Account Holder Name" />
                        <TextField label="IFSC Code" name="ifscCode" type="text" placeholder="IFSC Code" />
                        <TextField label="Account Number" name="accountNumber" type="text" placeholder="Account Number" />

                        <button
                            type="button"
                            className="w-full px-4 py-2 mt-8 text-sm font-medium text-white bg-[#5B6CFF] rounded-md hover:bg-[#1D4ED8] focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-[#5B6CFF]"
                        >
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PublisherBankDetails;