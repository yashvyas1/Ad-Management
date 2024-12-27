import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import useModal from "../hooks/useModal";
import verifyPass from "../assets/images/icon/verifypass.svg";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { getRequest, patchRequest } from "../services/backendAPIsServices";
import { toast } from "react-toastify";

const RegisterOTPVerificationModal = ({ data }) => {
  const [timer, setTimer] = useState(60);
  const { closeModal } = useModal();
  const navigate = useNavigate();
  const [otpError, setOtpError] = useState("");
  const { email, userId, onVerify } = data;
  const [otpFromBackend, setOtpFromBackend] = useState(data.otpFromBackend);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSubmitOTP = async (values, { resetForm }) => {
    const enteredOTP = values?.otp.join("");

    try {
      setLoading(true);
      if (enteredOTP === String(otpFromBackend)) {
        const response = await patchRequest(
          `/api/auth/updateisverified?userId=${userId}`,
          {
            isVerified: true,
          }
        );
        if (response) {
          const token = response.token;
          const role = getRoleFromToken(token);
          const userId = response.userId || "";
          localStorage.setItem("token", token);
          localStorage.setItem("userid", response.userId);
          localStorage.setItem("role", role);
          toast.success("OTP verified successfully!");
          onVerify();
          closeModal();
        } else {
          setOtpError("Invalid OTP. Please try again.");
          resetForm();
        }
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      setOtpError("An error occurred during OTP verification.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleFromToken = (token) => {
    try {
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid JWT token");
      }
      const decodedPayload = atob(tokenParts[1]);
      const payloadObject = JSON.parse(decodedPayload);
      return payloadObject.role;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const resendOTP = async () => {
    try {
      const response = await getRequest("/api/auth/verifyemail", {
        email: email,
        type: "signup",
      });
      if (response?.OTP) {
        setOtpFromBackend(response.OTP);
        toast.success("A new OTP has been sent to your email.");
        setTimer(60);
        setOtpError("");
      } else {
        setOtpError("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error while resending OTP:", error);
      setOtpError("Error occurred while resending OTP.");
    }
  };

  const initialValues = {
    otp: ["", "", "", "", "", ""],
  };

  const handleClick = () => {
    closeModal();
  };

  return (
    <div className="flex items-center justify-center bg-opacity-50 z-50">
      <div className="w-full max-w-[20rem] sm:max-w-[24rem] md:max-w-[36rem] bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 mx-2 sm:mx-4 md:mx-10 relative max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src={verifyPass}
              alt="verify password"
              className="h-[5rem] w-[5rem] sm:h-[6.3rem] sm:w-[6.3rem]"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#334168]">
            Please Verify Your Account
          </h1>
          <p className="font-normal text-gray-500 mt-2 text-xs sm:text-sm text-center px-4 sm:px-8">
            Check your email inbox or spam for OTP. Your given Email ID is
            <strong> {email}</strong>
          </p>
        </div>
        <Formik
          initialValues={initialValues}
          validate={(values) => {
            const errors = {};
            const enteredOTP = values.otp.join("");

            if (enteredOTP.trim().length === 0) {
              errors.otp = "Please provide OTP";
            } else if (enteredOTP.length < 6) {
              errors.otp = "Invalid OTP";
              setOtpError("");
            }

            return errors;
          }}
          onSubmit={(values, actions) => handleSubmitOTP(values, actions)}
        >

          {({ errors, touched, setFieldValue }) => (
            <Form className="mt-4 sm:mt-6">
              <div className="flex justify-between items-center mt-2 sm:mt-4 space-x-1 sm:space-x-2">
                {initialValues.otp.map((_, index) => (
                  <Field name={`otp[${index}]`} key={index}>
                    {({ field }) => (
                      <input
                        {...field}
                        type="text"
                        maxLength="1"
                        className="w-[2.5rem] h-[2.5rem] sm:w-[4rem] sm:h-[4rem] text-center text-xl sm:text-2xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[0-9]$/.test(value)) {
                            setFieldValue(`otp[${index}]`, value);
                            if (index < 5 && value) {
                              document
                                .getElementById(`otp-${index + 1}`)
                                .focus();
                            }
                          } else {
                            setFieldValue(`otp[${index}]`, "");
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !field.value) {
                            if (index > 0) {
                              document
                                .getElementById(`otp-${index - 1}`)
                                .focus();
                              setFieldValue(`otp[${index - 1}]`, "");
                            }
                          }
                        }}
                        id={`otp-${index}`}
                      />
                    )}
                  </Field>
                ))}
              </div>
              {(errors.otp && touched.otp) ? (
                <div className="text-red-500 text-xs sm:text-base text-center mt-2">
                  {errors.otp}
                </div>
              ) : otpError ? (<div className="text-red-500 text-xs sm:text-base text-center mt-2">
                {otpError}
              </div>) : null}

              <p className="text-gray-500 mt-4 text-center text-xs sm:text-sm">
                {timer > 0
                  ? `00:${timer < 10 ? `0${timer}` : timer} Sec`
                  : "Expired"}
              </p>
              <button
                type="submit"
                className="w-full h-10 sm:h-12 mt-4 text-white bg-blue-500 hover:bg-blue-700 font-medium text-sm sm:text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <div className="mt-4 font-normal flex flex-col items-center justify-center text-xs sm:text-sm text-gray-600">
                <p>
                  Haven't received OTP?{" "}
                  <button
                    type="button"
                    className={`${
                      timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"
                    }`}
                    onClick={resendOTP}
                    disabled={timer > 0}
                  >
                    Resend OTP
                  </button>
                </p>
                <button
                  type="button"
                  className="text-sm sm:text-base text-[#657488] mt-6 font-normal hover:underline text-center relative"
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

export default RegisterOTPVerificationModal;
