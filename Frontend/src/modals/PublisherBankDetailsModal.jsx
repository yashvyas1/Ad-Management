import Icons from "@/components/ui/Icon";
import useModal from "@/hooks/useModal";
import { Field, Form, Formik } from "formik";
import { useEffect, useRef } from "react";

function PublisherBankDetailsModal({ data, onSave }) {
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

  const handleFormSubmit = (values) => {
    onSave(values);
    closeModal();
  };

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

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 mt-2">
          Edit Payment Information
        </h2>

        <Formik
          initialValues={{
            bankName: data.bankName,
            branchName: data.branchName,
            accountHolder: data.accountHolder,
            ifscCode: data.ifscCode,
            accountno: data.accountno,
          }}
          onSubmit={handleFormSubmit}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col mb-2">
                  <label className="font-medium text-sm mb-2">
                    Bank Name<span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="bankName"
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full outline-none"
                    placeholder="Bank Name"
                  />
                </div>

                <div className="flex flex-col mb-2">
                  <label className="font-medium text-sm mb-2">
                    Branch Name<span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="branchName"
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full outline-none"
                    placeholder="Branch Name"
                  />
                </div>

                <div className="flex flex-col mb-2">
                  <label className="font-medium text-sm mb-2">
                    Account Holder Name<span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="accountHolder"
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full outline-none"
                    placeholder="Account Holder Name"
                  />
                </div>

                <div className="flex flex-col mb-2">
                  <label className="font-medium text-sm mb-2">
                    IFSC Code<span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="ifscCode"
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full outline-none"
                    placeholder="IFSC Code"
                  />
                </div>

                <div className="flex flex-col mb-2">
                  <label className="font-medium text-sm mb-2">
                    Account No<span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="accountno"
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full outline-none"
                    placeholder="Account No"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-[#5B6CFF] text-white px-16 py-2 rounded-md hover:bg-[#4c5df8]"
                >
                  Save
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default PublisherBankDetailsModal;
