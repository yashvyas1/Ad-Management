import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import useModal from "@/hooks/useModal";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import forgotPass from "../assets/images/icon/forgotpass.svg";
import { useNavigate } from "react-router-dom";
import { getRequest } from "@/services/backendAPIsServices";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .lowercase()
    .matches(
      /^[a-z0-9]+(?:[._%+-]?[a-z0-9]+)*@[a-z0-9]+(?:\.[a-z0-9]+)+$/,
      "Email address format is incorrect"
    )
    .required("Email ID is required")
    .email("Email address format is incorrect"),
});

const ForgetPasswordModal = () => {
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login");
    closeModal();
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setBackendError("");
    setLoading(true); // Start loading animation
    setSubmitting(true);
    const email = values.email;
    try {
      if (email) {
        const response = await getRequest(
          `/api/auth/verifyemail?email=${encodeURIComponent(
            email
          )}&type=forgot-password`
        );
        const otp = response?.OTP;
        openModal("VerifyModal", { email, otp });
      }
      resetForm();
    } catch (error) {
      console.error("There was an error!", error);
      if (error?.response && error?.response?.data) {
        const errorMessage =
          error?.response?.data?.message || "An unexpected error occurred.";
        setBackendError(errorMessage);
      } else {
        setBackendError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
      setLoading(false); // Stop loading animation
    }
  };

  return (
    <div className="flex items-center justify-center bg-opacity-50 z-50">
      <div className="w-full max-w-[20rem] sm:max-w-[24rem] md:max-w-[36rem] bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 mx-2 sm:mx-4 md:mx-10 relative max-h-[90vh] overflow-y-auto ">
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src={forgotPass}
              alt="forgot password"
              className="h-[6.3rem] w-[6.3rem]"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Forgot Your Password
          </h1>
          <p className="font-normal text-gray-500 mt-2 sm:text-xs md:text-sm">
            Please enter the email address associated with your account to reset
            your password.
          </p>
        </div>
        {backendError && (
          <div className="text-red-500 text-sm text-center">{backendError}</div>
        )}
        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, errors, touched }) => (
            <Form className="mt-6">
              <div className="mb-4">
                <label className="mb-1 text-[#666666] font-semibold text-sm block">
                  Email ID<span className="text-red-500"> *</span>
                </label>
                <Field
                  name="email"
                  type="email"
                  className="w-full h-12 px-4 py-2 mt-1 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400 text-base"
                  placeholder="Email ID"
                  onChange={(e) => {
                    const { value } = e.target;
                    const sanitizedValue = value
                      .replace(/[^a-z0-9@.]/g, "")
                      .toLowerCase();
                    setFieldValue("email", sanitizedValue);
                  }}
                />
                {touched.email && errors.email ? (
                  <div className="text-red-500 text-sm mt-2">
                    {errors.email}
                  </div>
                ) : null}
              </div>
              <button
                type="submit"
                className={`w-full h-10 sm:h-12 mt-4 text-white bg-blue-500 hover:bg-blue-700 font-medium text-sm sm:text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  loading ? "animate-pulse" : ""
                }`}
                disabled={loading} // Disable button when loading
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
              <div className="flex items-center justify-center mt-4">
                <button
                  type="button"
                  className="text-sm text-[#657488] font-semibold hover:underline text-center relative"
                  onClick={handleClick}
                >
                  <MdOutlineKeyboardArrowLeft className="text-lg absolute -left-5" />
                  Back
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgetPasswordModal;
