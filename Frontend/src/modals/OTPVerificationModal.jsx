import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import useModal from "../hooks/useModal";
import verifyPass from "../assets/images/icon/verifypass.svg";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { getRequest, patchRequest } from "../services/backendAPIsServices";

const OTPVerificationSchema = Yup.object().shape({
  otp: Yup.array()
    .of(
      Yup.string()
        .matches(/^[0-9]$/, "Must be a number")
        .required("Required")
    )
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits"),
});

const OTPVerificationModal = ({ data }) => {
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

  const [timer, setTimer] = useState(59);
  const { closeModal } = useModal();
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState();
  const [otpError, setOtpError] = useState("");
  const [email, setEmail] = useState(data?.email || "");
  const { onVerify } = data;
  const [loading, setLoading] = useState(false); // Added loading state

  const handleVerifyEmail = async (setValues = () => {}) => {
    if (email) {
      await getRequest(
        `api/auth/verifyemail?email=${email}&type=forgot-password`
      )
        .then((response) => {
          setOtp(response?.OTP);
          setValues({ otp: ["", "", "", "", "", ""] });
          setTimer(59);
          setOtpError("");
        })
        .catch((err) => {
          setOtp("");
          console.error(err);
        });
    }
  };

  useEffect(() => {
    if (timer === 0) {
      setOtpSent(false);
    }
  }, [timer]);

  useEffect(() => {
    handleVerifyEmail();
    const countdown = setInterval(() => {
      setTimer((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const Id = localStorage.getItem("userid");

  const handleSubmitOTP = async (values, { setValues }) => {
    const enteredOTP = values?.otp.join("");
    const userId = data?.userId;

    if (!enteredOTP) {
      setOtpError("Please enter OTP");
      return;
    }

    setLoading(true); // Start loading animation
    if (enteredOTP == otp) {
      try {
        const patchResponse = await patchRequest(
          `/api/auth/updateisverified?userId=${userId}`,
          {
            isVerified: true,
          }
        );

        const token = patchResponse?.token;
        const role = getRoleFromToken(patchResponse.token);

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        if (token) {
          if (role === "advertiser") navigate("/advertiser/dashboard");
          closeModal();
        }
        if (role === "publisher") {
          navigate("/publisher/dashboard");
          closeModal();
        }
      } catch (error) {
        console.error("Error during PATCH request:", error);
        setOtpError("An error occurred during verification.");
      }
    } else {
      setOtpError("Invalid OTP. Re-enter OTP");
      setValues({ otp: ["", "", "", "", "", ""] });
    }
    setLoading(false); // Stop loading animation
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
            Check your email inbox or spam for OTP.Your given OTP is{" "}
            <strong>{email}</strong>
          </p>
        </div>
        <Formik
          initialValues={initialValues}
          validate={(values) => {
            const errors = {};
            const enteredOTP = values.otp.join("");

            if (enteredOTP.trim().length === 0) {
              errors.otp = "Please enter OTP";
            } else if (enteredOTP.length < 6) {
              errors.otp = "Invalid OTP";
              setOtpError("");
            }

            return errors;
          }}
          onSubmit={(values, actions) => handleSubmitOTP(values, actions)}
        >
          {({ errors, touched, setFieldValue, values, setValues }) => (
            <Form className="mt-4 sm:mt-6">
              <div className="flex justify-between items-center mt-2 sm:mt-4 space-x-1 sm:space-x-2">
                {values.otp.map((_, index) => (
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
              {(errors.otp && touched.otp) || otpError ? (
                <div className="text-red-500 text-xs sm:text-base text-center mt-2">
                  {otpError || errors.otp}
                </div>
              ) : null}
              <p className="text-gray-500 mt-4 text-center text-xs sm:text-sm">
                {timer > 0
                  ? `00:${timer < 10 ? `0${timer}` : timer} Sec`
                  : "Expired"}
              </p>
              <button
                type="submit"
                className={`w-full h-10 sm:h-12 mt-4 text-white bg-blue-500 hover:bg-blue-700 font-medium text-sm sm:text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  loading ? "animate-pulse" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <div className="mt-4 font-normal flex flex-col items-center justify-center text-xs sm:text-sm text-gray-600">
                <p>
                  Haven't received OTP?{" "}
                  <button
                    type="button"
                    className={`${
                      timer > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:underline"
                    }`}
                    onClick={() => handleVerifyEmail(setValues)}
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
                  Back{" "}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
