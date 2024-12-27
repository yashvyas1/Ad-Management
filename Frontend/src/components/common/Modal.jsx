import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import ForgetPasswordModal from "@/modals/ForgetPasswordModal";
import ResetPasswordModal from "@/modals/ResetPasswordModal";
import OTPVerificationModal from "@/modals/OTPVerificationModal";
import RegisterOTPVerificationModal from "@/modals/RegisterOTPVerificationModal";
import VerifyModal from "@/modals/VerifyModal";
import AdsViewModal from "@/modals/AdsViewModal";
import AdvertiserAdsViewModal from "@/modals/AdvertiserAdsViewModal";
import ImagePreviewModal from "@/modals/ImagePreviewModal";
import ActionConfirmationModal from "@/modals/ActionConfirmationModal";
import EmbedCodeModal from "../publisher/table/EmbedCodeModal";
import AdCategoryAdminModal from "@/modals/AdCategoryAdminModal";
import AddManualPayment from "@/modals/AddManualPayment";
import AddPublisherManualPayment from "@/modals/AddPublisherManualPayment";
import AdminProfileSettingModal from "@/modals/AdminProfileSettingModal";
import AdminUploadImageModal from "@/modals/AdminUploadImageModal";
import AdvertiserProfileSettingModal from "@/modals/AdvertiserProfileSettingModal";
import AdvertiserUploadImageModal from "@/modals/AdvertiserUploadImageModal";
import PublisherProfileSettingModal from "@/modals/PublisherProfileSettingModal";
import PublisherUploadImageModal from "@/modals/PublisherUploadImageModal";
import PublisherBankDetailsModal from "@/modals/PublisherBankDetailsModal";
import AdvertiserGalleryModal from "@/modals/AdvertiserGalleryModal";
import AdvertiserInsightViewModal from "@/modals/AdvertiserInsightViewModal";

const Modal = ({ onConfirm, onSave, data }) => {
  const { modal, isModalOpen } = useSelector((state) => state.modal);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isModalOpen]);

  const renderModal =
    modal.name === "ForgetPasswordModal" ? (
      <ForgetPasswordModal data={modal?.data} />
    ) : modal.name === "OTPVerificationModal" ? (
      <OTPVerificationModal data={modal?.data} />
    ) : modal.name === "RegisterOTPVerificationModal" ? (
      <RegisterOTPVerificationModal data={modal?.data} />
    ) : modal.name === "ResetPasswordModal" ? (
      <ResetPasswordModal data={modal?.data} />
    ) : modal.name === "VerifyModal" ? (
      <VerifyModal data={modal?.data} />
    ) : modal.name === "AdsViewModal" ? (
      <AdsViewModal data={modal?.data} />
    ) : modal.name === "AdvertiserAdsViewModal" ? (
      <AdvertiserAdsViewModal data={modal?.data} />
    ) : modal.name === "ImagePreviewModal" ? (
      <ImagePreviewModal data={modal?.data} />
    ) : modal.name === "ActionConfirmationModal" ? (
      <ActionConfirmationModal data={modal?.data} onConfirm={onConfirm} />
    ) : modal.name === "EmbedCodeModal" ? (
      <EmbedCodeModal data={modal?.data} />
    ) : modal.name === "AdCategoryAdminModal" ? (
      <AdCategoryAdminModal data={modal?.data} />
    ) : modal.name === "AddManualPayment" ? (
      <AddManualPayment data={modal?.data} />
    ) : modal.name === "AddPublisherManualPayment" ? (
      <AddPublisherManualPayment data={modal.data} />
    ) : modal.name === "AdminProfileSettingModal" ? (
      <AdminProfileSettingModal data={data} onSave={onSave} />
    ) : modal.name === "AdminUploadImageModal" ? (
      <AdminUploadImageModal data={modal.data} />
    ) : modal.name === "AdvertiserProfileSettingModal" ? (
      <AdvertiserProfileSettingModal data={data} onSave={onSave} />
    ) : modal.name === "AdvertiserUploadImageModal" ? (
      <AdvertiserUploadImageModal data={modal.data} />
    ) : modal.name === "PublisherProfileSettingModal" ? (
      <PublisherProfileSettingModal data={data} onSave={onSave} />
    ) : modal.name === "PublisherUploadImageModal" ? (
      <PublisherUploadImageModal data={modal.data} />
    ) : modal.name === "PublisherBankDetailsModal" ? (
      <PublisherBankDetailsModal data={data} onSave={onSave} />
    ) : modal.name === "GalleryModal" ? (
      <AdvertiserGalleryModal setSelectedImages={modal?.data?.setSelectedImages} />
    ) : modal.name === "AdvertiserInsightViewModal" ? (
      <AdvertiserInsightViewModal data={modal?.data} />
    ) : null;

  return (
    <>
      {isModalOpen && (
        <div className="relative z-50">
          <div
            className={`fixed inset-0 bg-gray-500 bg-opacity-15 transition-opacity duration-300 backdrop-blur-sm ${isModalOpen ? "opacity-100" : "opacity-0"
              }`}
          />
          <div className="fixed inset-0 overflow-y-auto sm:p-2">
            <div className="flex min-h-full items-center justify-center text-center">
              <div
                className={`transform rounded-[20px] text-left align-middle drop-shadow-lg transition-transform duration-300 relative ${isModalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
              >
                {renderModal}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
