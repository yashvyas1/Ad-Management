import React, { useEffect, useState } from "react";
import { Field, Form, Formik } from "formik";
import Button from "@/components/ui/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Icons from "@/components/ui/Icon";
import useModal from "@/hooks/useModal";

function AddManualPayment({ data }) {
  
  const { closeModal } = useModal();
  const [paymentDate, setPaymentDate] = useState(null);

  const handlePaymentDateChange = (date) => {
    setPaymentDate(date);
  };

  return (
    <div className="flex items-center justify-center bg-opacity-50 z-50 mt-14">
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full z-10">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={closeModal}
        >
          <Icons icon="iconamoon:close-fill" width="24" height="24" />
        </button>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Advertiser Payment
        </h2>
        <Formik
          initialValues={{
            adName: "",
            advertiserName: "",
            categoryName: data?.row?.ad_category || "",
            updatedDateTime:
              new Date(data?.row?.updatedAt).toLocaleString() || "",
            amount: `₹ ${Number(data?.row?.ad_budget).toLocaleString()}` || "",
          }}
        >
          {() => (
            <Form>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Ad Name <span className="text-red-700">*</span>
                  </label>
                  <Field
                    name="adName"
                    className="border rounded-md p-2 w-full "
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Advertiser Name <span className="text-red-700">*</span>
                  </label>
                  <Field
                    name="advertiserName"
                    className="border rounded-md p-2 w-full "
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Select Payment Date and Time{" "}
                    <span className="text-red-700">*</span>
                  </label>
                  <DatePicker
                    selected={paymentDate}
                    onChange={handlePaymentDateChange}
                    showTimeSelect
                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                    placeholderText="Select Payment Date and Time"
                    dateFormat="d-MM-yyyy h:mm aa"
                    timeIntervals={15}
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium text-sm">
                    Amount <span className="text-red-700">*</span>
                  </label>
                  <Field
                    name="createDateTime"
                    className="border rounded-md p-2 w-full "
                    type="number"
                  />
                </div>
              </div>
              <div className="flex justify-end  gap-4 mt-6">
                <Button
                  type="button"
                  className="border text-blue-400 px-6 py-2 fw-bold rounded-md"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  className="bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600 transition"
                >
                  Add
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default AddManualPayment;
