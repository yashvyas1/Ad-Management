import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BiMinus, BiPlus } from 'react-icons/bi';
import { IoMdDownload } from "react-icons/io";
import { IoPrint } from "react-icons/io5";
import adManagmentLogopublisherbankdetail from "../../assets/adManagmentLogopublisherbankdetail.svg";

const PublisherInvoice = () => {
    const invoiceRef = useRef();
    const [zoomLevel, setZoomLevel] = useState(100);

    // Print functionality
    const handlePrint = useReactToPrint({
        content: () => invoiceRef.current,
    });

    // Download PDF functionality
    const handleDownloadPDF = async () => {
        const element = invoiceRef.current;
        const canvas = await html2canvas(element);
        const data = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('invoice.pdf');
    };

    // Zoom functionality
    const handleZoomOut = () => {
        setZoomLevel(prevZoom => Math.max(prevZoom - 10, 0));
    };

    const handleZoomIn = () => {
        setZoomLevel(prevZoom => Math.min(prevZoom + 10, 100));
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <div className="bg-blue-600 text-white w-full max-w-3xl rounded-t-lg flex justify-between items-center px-4 py-2">
                    <span className="text-lg font-semibold">Invoice</span>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="bg-blue-700 px-2 py-1 rounded text-center text-sm">1</div>
                        <div className="border-l border-blue-400 h-6"></div>
                        <BiMinus onClick={handleZoomOut} className="text-xl cursor-pointer hover:text-blue-300" />
                        <div className="bg-blue-700 px-2 py-1 rounded text-center text-sm">{zoomLevel}%</div>
                        <BiPlus onClick={handleZoomIn} className="text-xl cursor-pointer hover:text-blue-300" />
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                        <IoMdDownload onClick={handleDownloadPDF} className="text-2xl cursor-pointer hover:text-blue-300" />
                        <IoPrint onClick={handlePrint} className="text-2xl cursor-pointer hover:text-blue-300" />
                    </div>
                </div>
                <div ref={invoiceRef} className="bg-white rounded-b-lg shadow-lg p-10 mt-2" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top' }}>
                    <div className="flex justify-between items-start mb-10">
                        <div className="flex items-center">
                            <img src={adManagmentLogopublisherbankdetail} alt="AD Management Logo" className="w-16 h-16 mr-4" />
                            <div>
                                <h1 className="text-2xl font-bold text-[#5B6CFF]">AD MANAGEMENT</h1>
                                <p className="font-semibold text-base text-gray-500">November 4th, 2024</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-[#657488] uppercase tracking-wide">INVOICE NO : <span className="font-bold text-[#1F1F23]">1090</span></p>
                            <p className="font-semibold text-[#657488] uppercase tracking-wide">INVOICE DATE : <span className="font-bold text-[#1F1F23]">November 4th, 2024</span></p>
                        </div>
                    </div>

                    <div className="flex justify-between mb-8 text-sm">
                        <div>
                            <p className="font-semibold text-base text-gray-500">TO</p>
                            <p className="font-bold text-[#1F1F23]">
                                Aman Kurmi<br />
                                +91 9822969456<br />
                                amankurmi@gmail.com
                            </p>
                        </div>
                    </div>

                    {/* <div className="grid grid-cols-2 sm:grid-cols-5 gap-48 text-sm border-b border-gray-200 pb-6 mb-6">
                        <div>
                            <p className="text-gray-600">INVOICE NO</p>
                            <p className="font-medium text-gray-800">1090</p>
                        </div>
                        <div>
                            <p className="text-gray-600">DURATION</p>
                            <p className="font-medium text-gray-800">1st October - 31st October 2024</p>
                        </div>
                        <div>
                            <p className="text-gray-600">PAYMENT DATE</p>
                            <p className="font-medium text-gray-800">November 4th, 2024</p>
                        </div>
                        <div>
                            <p className="text-gray-600">BILLING CURRENCY</p>
                            <p className="font-medium text-gray-800">INR (Indian Rupee)</p>
                        </div>
                    </div> */}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-14 text-sm border-b border-gray-200 pb-6 mb-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice No</p>
                            <p className="font-medium text-gray-800 mt-2">1090</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</p>
                            <p className="font-medium text-gray-800 mt-2">1st October -<br />31st October 2024</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Date</p>
                            <p className="font-medium text-gray-800 mt-2">November 4th, 2024</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Billing Currency</p>
                            <p className="font-medium text-gray-800 mt-2">INR (Indian Rupee)</p>
                        </div>
                    </div>


                    <div className="text-right sm:text-left">
                        <p className="text-gray-600">AMOUNT</p>
                        <p className="font-medium text-gray-800">Rs 50,000.00</p>
                    </div>

                    <div className="text-right font-semibold text-xl text-gray-800 mb-10">
                        TOTAL AMOUNT DUE - <span className="text-blue-600">Rs 50,000.00</span>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-sm mb-10">
                        <h4 className="text-blue-600 font-semibold mb-2">PAYMENT INFORMATION</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-gray-600">BANK NAME</p>
                                <p className="font-medium text-gray-800">HDFC Bank</p>
                            </div>
                            <div>
                                <p className="text-gray-600">BRANCH NAME</p>
                                <p className="font-medium text-gray-800">Wakad, PUNE</p>
                            </div>
                            <div>
                                <p className="text-gray-600">ACCOUNT HOLDER NAME</p>
                                <p className="font-medium text-gray-800">Aman Kurmi</p>
                            </div>
                            <div>
                                <p className="text-gray-600">ACCOUNT NUMBER</p>
                                <p className="font-medium text-gray-800">09111134678950</p>
                            </div>
                            <div>
                                <p className="text-gray-600">IFSC CODE</p>
                                <p className="font-medium text-gray-800">HDFC0000189</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm mb-10">Thank you for your support.</p>

                    <div className="text-right">
                        <p className="text-gray-600">SIGNATURE</p>
                        <p className="font-cursive text-2xl text-gray-800">C. Kurmi</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublisherInvoice;