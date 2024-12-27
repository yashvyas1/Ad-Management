import React, { useEffect, useRef } from "react";
import { Field, Form, Formik } from "formik";
import Button from "@/components/ui/Button";
import Icons from "@/components/ui/Icon";
import * as Yup from "yup";
import { PhoneNumberUtil } from "google-libphonenumber";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "../assets/scss/app.css";
import useModal from "@/hooks/useModal";
import { getName } from "country-list";

const ValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Full Name is too short")
    .max(25, "Full Name is too long")
    .required("Full Name is required")
    .matches(
      /^[A-Z][a-zA-Z]*\s[A-Z][a-zA-Z]*$/,
      "Both First Name & Last Name should start with a capital letter."
    ),
  mobileno: Yup.string()
    .required("Mobile Number is required")
    .test("is-valid-phone", "Contact is not valid", (value) =>
      value ? isPhoneValid(value) : true
    ),
});

const CustomPhoneInput = ({
  customClassName,
  field,
  form: { setFieldValue, setFieldTouched },
  value,
  onChange,
  onBlur,
  error,
}) => {
  return (
    <PhoneInput
      className={`${customClassName}`}
      defaultCountry="in"
      value={value}
      onChange={(phoneNumber, country) => {
        onChange(phoneNumber);
        setFieldValue(field.name, phoneNumber);
        setFieldValue("country", country.country.iso2.toUpperCase());
        const countryName = getName(country.country.iso2.toUpperCase()) || "";
        setFieldValue("countryName", countryName);
      }}
      onBlur={(e) => {
        onBlur(e);
        setFieldTouched(field.name, true);
      }}
      error={error}
    />
  );
};

const phoneUtil = PhoneNumberUtil.getInstance();
const isPhoneValid = (phone) => {
  if (!phone) {
    return false;
  }
  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch (error) {
    return false;
  }
};


function PublisherProfileSettingModal({ data, onSave }) {
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

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Edit User Details
        </h2>

        <Formik
          initialValues={{
            name: data.name,
            email: data.email,
            mobileno: data.mobileno,
            country: data.country,
            countryName: getName(data.country),
          }}
          validationSchema={ValidationSchema}
          onSubmit={handleFormSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col mb-4">
                  <label className="text-gray-600 font-medium text-sm">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="name"
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full outline-none"
                    placeholder="Full Name"
                  />
                  {errors.name && touched.name ? (
                    <div className="text-red-500 text-sm">{errors.name}</div>
                  ) : null}
                </div>

                <div className="flex flex-col mb-4">
                  <label className="text-[#93939340] font-medium text-sm">
                    Email ID
                  </label>
                  <Field
                    name="email"
                    className="border border-gray-300 rounded-md p-2 w-full outline-none text-[#93939340] cursor-not-allowed"
                    placeholder="Email ID"
                    readOnly
                  />
                </div>

                <div className="flex flex-col mb-4">
                  <label className="text-gray-600 font-medium text-sm">
                    Mobile Number<span className="text-red-500">*</span>
                  </label>
                  <Field name="mobileno">
                    {({ field, form }) => (
                      <CustomPhoneInput
                        customClassName="phone-input-two"
                        defaultCountry="in"
                        field={field}
                        form={form}
                        value={field.value}
                        onChange={(phoneNumber, country) => {
                          setFieldValue("mobileno", phoneNumber);
                          setFieldValue(
                            "country",
                            country?.country?.iso2.toUpperCase()
                          );
                        }}
                        onBlur={() => {
                          setFieldTouched("mobileno", true);
                          setFieldTouched("country", true);
                        }}
                      />
                    )}
                  </Field>
                  {errors.mobileno && touched.mobileno ? (
                    <div className="text-red-500 text-sm">
                      {errors.mobileno}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col mb-4">
                  <label className="text-[#93939340] font-medium text-sm">
                    Country
                  </label>
                  <Field
                    name="countryName"
                    className="border border-gray-300 rounded-md p-2 w-full outline-none text-[#93939340] cursor-not-allowed"
                    placeholder="Country"
                    readOnly
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
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

export default PublisherProfileSettingModal;
