import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import resetPass from "../assets/images/icon/resetpass.svg";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import useModal from "../hooks/useModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { patchRequest } from "@/services/backendAPIsServices";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .required("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/,
      "Password must include an uppercase letter, a lowercase letter, a number, and a special character."
    )
    .test(
      "password-length",
      "Password must be at least 8 characters.",
      (value) => {
        if (value) {
          return value.length >= 8 && value.length <= 15;
        }
        return true;
      }
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const ResetPasswordModal = ({ data }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confPasswordVisible, setConfPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { closeModal } = useModal();
  const [email, setEmail] = useState(data?.email || "");
  const [backendError, setBackendError] = useState("");

  const passwordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const confPasswordVisibility = () => {
    setConfPasswordVisible(!confPasswordVisible);
  };

  const initialValues = {
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values) => {
    try {
      if (email) {
        const requestBody = {
          email: email,
          password: values.password,
        };
        const response = await patchRequest(
          "/api/auth/updatepassword",
          requestBody
        );
        if (response) {
          handleClick();
          toast.success(response?.message);
        }
      }
      resetForm();
    } catch (error) {
      setBackendError("Error verifying email. Please try again.");
    }
  };

  const handleClick = () => {
    navigate("/login");
    closeModal();
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <div className="w-full max-w-[20rem] sm:max-w-[24rem] md:max-w-[36rem] bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 mx-2 sm:mx-4 md:mx-10 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center mb-6">
          <img
            src={resetPass}
            alt="Reset password"
            className="h-[6.3rem] w-[6.3rem]"
          />
        </div>
        <h1 className="text-2xl font-semibold text-center text-[#334168] mb-2">
          Reset Password
        </h1>
        <p className="text-center text-[#637381] text-sm font-normal mb-8">
          Enter new password here.
        </p>
        <Formik
          initialValues={initialValues}
          validationSchema={ResetPasswordSchema}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
        >
          {({ errors, touched }) => (
            <Form className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="flex relative">
                  <Field
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    className="w-full h-12 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password"
                    maxLength={15}
                  />
                  <button
                    type="button"
                    onClick={passwordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                {errors.password && touched.password ? (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </div>
                ) : null}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="flex relative">
                  <Field
                    name="confirmPassword"
                    type={confPasswordVisible ? "text" : "password"}
                    className="w-full h-12 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={confPasswordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {confPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword ? (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </div>
                ) : null}
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full h-10 sm:h-12 mt-4 text-white bg-blue-500 hover:bg-blue-700 font-medium text-sm sm:text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Reset Password
                </button>
              </div>
            </Form>
          )}
        </Formik>
        <div className="mt-2 text-center">
          <button
            type="button"
            className="text-sm text-[#657488] mt-6 font-normal hover:underline text-center relative"
            onClick={handleClick}
          >
            <MdOutlineKeyboardArrowLeft className="text-lg absolute -left-5" />
            Back{" "}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ResetPasswordModal;
