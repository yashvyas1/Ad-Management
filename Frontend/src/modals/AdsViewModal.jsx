import React, { useEffect, useRef } from "react";
import { Field, Form, Formik } from "formik";
import Button from "@/components/ui/Button";
import Icons from "@/components/ui/Icon";
import useModal from "@/hooks/useModal";

function AdsViewModal({ data }) {
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
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          View AD List
        </h2>
        <Formik
          initialValues={{
            adName: data?.row?.ad_name || "",
            advertiserName: data?.row?.Advertiser?.User?.name || "",
            categoryName: data?.row?.ad_category || "",
            status: data?.row?.status || "",
            createDateTime:
              new Date(data?.row?.createdAt).toLocaleString() || "",
            updatedDateTime:
              new Date(data?.row?.updatedAt).toLocaleString() || "",
            startDateTime:
              new Date(data?.row?.start_date).toLocaleString() || "",
            endDateTime: new Date(data?.row?.end_date).toLocaleString() || "",
            type: data?.row?.ad_type || "",
            budget: `₹ ${Number(data?.row?.ad_budget).toLocaleString()}` || "",
          }}
        >
          {() => (
            <Form>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Ad Name
                  </label>
                  <Field
                    name="adName"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Advertiser Name
                  </label>
                  <Field
                    name="advertiserName"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Category Name
                  </label>
                  <Field
                    name="categoryName"
                    className="border rounded-md p-2 w-full capitalize"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Status
                  </label>
                  <Field
                    name="status"
                    className={`border rounded-md p-2 w-full capitalize text-sm ${data?.row?.status === "active"
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Create Date & Time
                  </label>
                  <Field
                    name="createDateTime"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Updated Date & Time
                  </label>
                  <Field
                    name="updatedDateTime"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Start Date & Time
                  </label>
                  <Field
                    name="startDateTime"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    End Date & Time
                  </label>
                  <Field
                    name="endDateTime"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Type
                  </label>
                  <Field
                    name="type"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    AD Budget
                  </label>
                  <Field
                    name="budget"
                    className="border rounded-md p-2 w-full"
                    readOnly
                  />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default AdsViewModal;

