import React, { useState, useEffect, useCallback } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import adminSignup from "../../assets/adminSignup.svg";
import useModal from "../../hooks/useModal";
import Modal from "@/components/common/Modal";
import { postRequest } from "../../services/backendAPIsServices";

const TextField = ({ label, name, type, placeholder, register, errors }) => (
  <div>
    <label className="text-sm text-gray-600">
      {label}
      <span className="text-red-500"> *</span>
    </label>{" "}
    <input
      {...register(name)}
      type={type}
      className="w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-opacity-40 focus:ring-blue-400 focus:border-blue-400 text-xs placeholder-gray-400"
      placeholder={placeholder}
    />
    {errors[name] && (
      <div className="text-red-500 text-sm">{errors[name]?.message}</div>
    )}
  </div>
);

const PasswordField = React.memo(
  ({ passwordVisible, toggleVisibility, fieldName, register, errors }) => (
    <div className="relative">
      <label className="text-sm text-gray capitalize">
        {fieldName}
        <span className="text-red-500"> *</span>
      </label>
      <div className="relative mt-2">
        <input
          {...register(fieldName)}
          type={passwordVisible ? "text" : "Password"}
          className="block w-full px-4 py-2 border rounded-md focus:ring focus:ring-opacity-40 focus:ring-blue-400 focus:border-blue-400 pr-10 text-xs placeholder-gray-400"
          placeholder="Password"
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 px-3 py-2 text-gray-600"
        >
          {passwordVisible ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
      {errors[fieldName] && (
        <div className="text-red-500 text-sm">{errors[fieldName]?.message}</div>
      )}
    </div>
  )
);

const Signin = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [check, setCheck] = useState(false);
  const [loginType, setLoginType] = useState("advertiser");
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  const navigate = useNavigate();
  const { openModal } = useModal();

  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible((prev) => !prev);
  }, []);

  const handleCheck = useCallback(() => {
    setCheck((prev) => !prev);
  }, []);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Email address format is incorrect")
      .required("Email ID is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters.")
      .matches(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        "Password must contain at least one letter, one number, and one special character"
      ),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe");
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (rememberMe === "true" && savedEmail && savedPassword) {
      setValue("email", savedEmail);
      setValue("password", savedPassword);
      setCheck(true);
    }
  }, [setValue]);

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

  const loginUser = async (values) => {
    try {
      const data = await postRequest("/api/auth/signin", values);

      if (data) {
        const token = data.token;
        const role = getRoleFromToken(token);
        const userId = data.user_id || "";

        localStorage.setItem("token", token);
        localStorage.setItem("userid", data.user_id);
        localStorage.setItem("role", role);
        

        if (data.message === "User Email not Verified.") {
          openModal("OTPVerificationModal", {
            email: values.email,
            // otp: data.OTP,
            userId: data?.user_id,
          });
          return;
        }

        handleRememberMe(values, check);
        handleRoleBasedNavigation(role, data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage, { theme: "dark" });
    }
  };

  const handleRoleBasedNavigation = (role, successMessage) => {
    if (role === "admin") {
      navigate("/admin/dashboard", { state: { success: successMessage } });
    } else if (role === "advertiser") {
      navigate("/advertiser/dashboard", { state: { success: successMessage } });
    } else if (role === "publisher") {
      navigate("/publisher/dashboard", { state: { success: successMessage } });
    }
  };

  const handleRememberMe = (values, check) => {
    if (check) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("email", values.email);
      localStorage.setItem("password", values.password);
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("email");
      localStorage.removeItem("password");
    }
  };

  useEffect(() => {
    const isAdmin = document.URL.includes("admin");
    if (isAdmin) {
      setLoginType("admin");
    } else {
      setLoginType("advertiser");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "advertiser") {
        navigate("/advertiser/dashboard", { replace: true });
      } else if (role === "publisher") {
        navigate("/publisher/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    const signupSuccess = localStorage.getItem("signupSuccess");
    if (signupSuccess === "true") {
      toast.success("User signed up successfully!", { theme: "dark" });
      localStorage.removeItem("signupSuccess");
    }
  }, []);

  return (
    <div className="flex w-screen h-screen bg-gray-50">
      <div className="max-md:hidden md:flex md:w-1/2 justify-center items-center">
        <img
          src={adminSignup}
          alt="Login side"
          className="w-full h-full bg-[#5B6CFF]"
        />
      </div>

      <div className="w-full md:w-1/2 p-8 md:p-[3.5rem] lg:p-[8rem] bg-white flex flex-col justify-center">
        <div className="border-2 border-gray-200 rounded-lg shadow-lg p-16">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {loginType === "admin" ? "Admin" : ""} Log In
          </h2>

          <p className="text-sm text-center text-gray-500 mt-2">
            Welcome back! Please enter your credentials to access your account
            securely.
          </p>

          <form onSubmit={handleSubmit(loginUser)} className="space-y-4 mt-6 ">
            <TextField
              label="Email ID"
              name="email"
              type="email"
              placeholder="Email ID"
              register={register}
              errors={errors}
            />

            <PasswordField
              passwordVisible={passwordVisible}
              toggleVisibility={togglePasswordVisibility}
              register={register}
              errors={errors}
              fieldName="password"
            />

            {loginType !== "admin" && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring focus:ring-opacity-40 focus:ring-blue-400"
                    onChange={handleCheck}
                    checked={check}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div>
                {loginType !== "admin" && (
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => openModal("ForgetPasswordModal")}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-2 mt-8 mb-6 text-sm font-medium text-white bg-[#5B6CFF] rounded-md hover:bg-[#1D4ED8] focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-[#5B6CFF]"
            >
              Log In
            </button>
          </form>
          {loginType !== "admin" && (
            <p className="text-sm text-center text-gray-500 mt-6">
              Don't have an account ?{" "}
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </p>
          )}
        </div>
      </div>
      <ToastContainer />
      <Modal/>
    </div>
  );
};

export default Signin;
