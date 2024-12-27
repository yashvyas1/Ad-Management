import Icons from "@/components/ui/Icon";
import useModal from "@/hooks/useModal";
import { Field, Form, Formik } from "formik";
import { useEffect, useRef } from "react";
import moment from "moment";

function AdvertiserAdsViewModal({ data }) {
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

  const formatCurrency = (value) => {
    return "₹ " + value.toLocaleString();
  };

  return (
    <div className="flex items-center justify-center bg-opacity-50 z-50 mt-14">
      <div
        ref={modalRef}
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-lg shadow-xl p-6 sm:p-8 mx-2 relative mt-8 mb-4 max-h-[80vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={closeModal}
        >
          <Icons icon="iconamoon:close-fill" width="24" height="24" />
        </button>
        <h2 className="text-2xl font-semibold text-[#444] mb-4">
          View Advertisement
        </h2>
        <Formik
          initialValues={{
            adName: data?.row?.ad_name || "",
            advertiserName: data?.row?.Advertiser?.User?.name || "",
            categoryName: data?.row?.ad_category || "",
            status: data?.row?.status || "",
            createDateTime: moment(data?.row?.createdAt).format('DD/MM/YYYY hh:mm A') || "",
            updatedDateTime: moment(data?.row?.updatedAt).format('DD/MM/YYYY hh:mm A') || "",
            startDateTime: moment(data?.row?.start_date).format('DD/MM/YYYY hh:mm A') || "",
            endDateTime: moment(data?.row?.end_date).format('DD/MM/YYYY hh:mm A') || "",
            type: data?.row?.ad_type || "",
            budget: data?.row?.ad_budget || 0,
          }}
        >
          {({ values }) => (
            <Form>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#444] text-base">
                    Ad Name
                  </label>
                  <Field
                    name="adName"
                    className="border rounded-md p-2 w-full capitalize"
                    readOnly
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#444] text-base">
                    Category Name
                  </label>
                  <Field
                    name="categoryName"
                    className="border rounded-md p-2 w-full capitalize"
                    readOnly
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#444] text-base">
                    Ad Type
                  </label>
                  <Field
                    name="type"
                    className="border rounded-md p-2 w-full capitalize"
                    readOnly
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#444] text-base">
                    Status
                  </label>
                  <div className={`border rounded-md p-2 w-full capitalize ${values.status === "active" ? "text-green-600" : values.status === "inactive" ? "text-red-600" : "text-yellow-600"}`} readOnly>{values.status === "active" ? "Active" : values.status === "inactive" ? "Inactive" : "Pause"}</div>
                </div>
                <div>
                  <label className="font-semibold text-[#444] text-base">
                    Create Date & Time
                  </label>
                  <Field
                    name="createDateTime"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#444] text-base">
                    Updated Date & Time
                  </label>
                  <Field
                    name="updatedDateTime"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#444] text-base">
                    Start Date & Time
                  </label>
                  <Field
                    name="startDateTime"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#444] text-base">
                    End Date & Time
                  </label>
                  <Field
                    name="endDateTime"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#444] text-base">
                    Daily Budget
                  </label>
                  <div className="border rounded-md p-2 w-full">
                    {formatCurrency(values.budget)}
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default AdvertiserAdsViewModal;

