import Modal from "@/components/common/Modal";
import useModal from "@/hooks/useModal";
import { getRequest, postRequest } from "@/services/backendAPIsServices";
import { Field, Form, Formik } from "formik";
import { PhoneNumberUtil } from "google-libphonenumber";
import { useEffect, useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";
import adminSignUp from "../../assets/adminSignup.svg";
import createAdLogo from "../../assets/images/logo/CreateAdLogo.png";
import "../../assets/scss/app.css";

const SignupSchema = Yup.object().shape({
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
  email: Yup.string()
    .trim()
    .lowercase()
    .matches(
      /^[a-z0-9]+(?:[._%+-]?[a-z0-9]+)*@[a-z0-9]+(?:\.[a-z0-9]+)*$/,
      "Invalid email address"
    )
    .required("Email ID is required"),
  password: Yup.string()
    .required("Password is required")
    .test(
      "password-length",
      "Use 8 or more characters with a mix of letters, numbers & symbols",
      (value) => {
        if (value) {
          return value.length >= 8 && value.length <= 15;
        }
        return true;
      }
    )
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/,
      "Password must include an uppercase letter, a lowercase letter, a number, and a special character."
    ),
});

const publisherValidationSchema = Yup.object().shape({
  websitename: Yup.string()
    .required("Website Name is required")
    .min(2, "Website Name must be at least 2 characters"),
  website: Yup.string()
    .required("Website URL is required")
    .url("Must be a valid URL"),
  category: Yup.string()
    .required("Category is required")
    .matches(
      /^[a-zA-Z0-9]+$/,
      "Invalid category - only alphanumeric characters are allowed"
    )
    .test(
      "single-word",
      "Invalid category - must be a single word",
      (value) => value && value.split(/\s+/).length === 1
    ),
  allowcategory: Yup.array().when("category", {
    is: "custom",
    then: Yup.array()
      .of(
        Yup.string()
          .required("Allowed Category is required")
      )
      .min(1, "At least one Allowed Category is required"),
    otherwise: Yup.array().notRequired(),
  }),
  disallowcategory: Yup.array().when("category", {
    is: "custom",
    then: Yup.array()
      .test(
        "no-overlap",
        "Disallowed Categories cannot be the same as Allowed Categories",
        function (disallowedCategories) {
          const { allowcategory } = this.parent;
          const intersection = disallowedCategories.filter((category) =>
            allowcategory.includes(category)
          );
          return intersection.length === 0;
        }
      ).test(
        "allowcategory-exists",
        "You need to add at least one allowed category",
        function () {
          const { allowcategory } = this.parent;
          return allowcategory && allowcategory.length > 0;
        }
      ),
    otherwise: Yup.array().notRequired(),
  }),
});

const Dropdown = ({
  options,
  label,
  placeholder,
  onChange,
  name,
  value,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
}) => {
  const handleOptionClick = (option) => {
    onChange(name, option.value);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="font-medium text-gray-600">
        {label}
        <span className="text-red-500">*</span>
      </label>
      <div
        className="flex w-full mt-2 items-center justify-between gap-2 border border-gray-200 bg-white px-4 py-1.5 rounded-lg cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className={`${value ? "text-black" : "text-gray-400"}`}>
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
        </div>
        <div className="ml-auto">
          {isDropdownOpen ? (
            <MdOutlineKeyboardArrowUp className="text-lg" />
          ) : (
            <MdOutlineKeyboardArrowDown className="text-lg" />
          )}
        </div>
      </div>
      {isDropdownOpen && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg max-h-30 overflow-y-auto z-10">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

const Register = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [registerAs, setRegisterAs] = useState("advertiser");
  const [currentStep, setCurrentStep] = useState(1);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [termError, setTermError] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otpFromBackend, setOtpFromBackend] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const toggleTermChecked = () => {
    setIsTermsChecked(!isTermsChecked);
    setTermError("");
  };

  const passwordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const capitalizeFirstLetter = (str) => {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const toLowerCase = (str) => str.toLowerCase();

  const sanitizeEmail = (value) => {
    let sanitizedValue = value.replace(/[^a-z0-9@._%+-]/g, "");
    const atCount = (sanitizedValue.match(/@/g) || []).length;
    if (atCount > 1) {
      sanitizedValue = sanitizedValue.replace(/@/g, (match, offset, str) =>
        str.indexOf("@") === offset ? "@" : ""
      );
    }
    return sanitizedValue;
  };

  const goToNextStep = async (validateForm, setTouched, touched) => {
    if (!isTermsChecked) {
      setTermError("You must agree to the terms and conditions.");
      return;
    }

    const errors = await validateForm();
    setTouched({
      ...touched,
      ...Object.keys(errors).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      ),
    });
    if (Object.keys(errors).length === 0) {
      setCurrentStep(2);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleRegisterAsChange = (name, value) => {
    setRegisterAs(value);
    setIsDropdownOpen(false);
  };

  const handleCategoryChange = async (name, value) => {
    setCategoryType(value);
    setIsDropdownOpen(false);

    if (value === "custom") {
      try {
        const response = await getRequest("/api/advertiser/selected-data");
        if (response?.category) {
          const formattedCategories = response.category.map((category) => ({
            label: category,
            value: category.toLowerCase(),
          }));
          setCategoryData(formattedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { openModal, closeModal } = useModal();

  return (
    <div className="flex w-screen h-screen bg-gray-50">
      <div className="hidden md:flex md:w-1/2">
        <img
          src={adminSignUp}
          alt="Register side"
          className="w-full h-full bg-[#5B6CFF]"
        />
      </div>

      <div className="w-full md:w-1/2 p-8 md:p-[3.5rem] lg:p-[8rem] bg-white border-2 border-gray-200 flex flex-col justify-center overflow-y-auto">
      <h2 className="flex items-center text-2xl font-bold text-gray-800 mt-24">
              <span className="text-white rounded-full mr-2">
                <img
                  src={createAdLogo}
                  alt="AD Management Icon"
                  className="w-10 h-10"
                />
              </span>
              AD Management
            </h2>   {registerAs === "publisher" && (
          <>
           
            <div className="flex items-center mt-4 mb-2">
              <div className="flex-grow flex justify-between">
                <div className="w-1/2 h-3 bg-teal-500 rounded-full"></div>
                <div className="mx-1"></div>
                <div
                  className={`w-1/2 h-3 rounded-full ${currentStep === 1 ? "bg-gray-300" : "bg-teal-500"
                    }`}
                ></div>
              </div>
            </div>
            <div className="text-gray-500 text-sm">{currentStep} of 2</div>
          </>
        )}
        {currentStep !== 2 && (
          <div className="my-2">
            <h2 className="text-xl font-bold text-gray-800">
              Create Your Account
            </h2>
            <span className="text-xs mt-2 text-gray-500">
              Register for Ad Management
            </span>
          </div>
        )}

        <div className="flex flex-col w-full">
          <Formik
            initialValues={{
              name: "",
              mobileno: "",
              email: "",
              password: "",
              country: "",
              websitename: "",
              website: "",
              category: "",
              allowcategory: [],
              disallowcategory: [],
            }}
            validationSchema={
              currentStep === 1 ? SignupSchema : publisherValidationSchema
            }
            validateOnChange={true}
            validateOnBlur={true}
            onSubmit={async (values, { setSubmitting }) => {
              if (!isTermsChecked) {
                setTermError("You must agree to the terms and conditions.");
                setSubmitting(false);
                return;
              } else {
                setTermError("");
              }
              setLoading(true);
              try {
                if (registerAs === "advertiser") {
                  delete values.website;
                  delete values.websitename;
                  delete values.category;
                  delete values.allowcategory;
                  delete values.disallowcategory;
                }

                let response;
                if (registerAs === "advertiser") {
                  response = await postRequest(
                    `/api/auth/advertiser/signup`,
                    values,
                    {
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );
                }

                if (registerAs === "publisher") {
                  response = await postRequest(
                    `/api/auth/publisher/signup`,
                    values,
                    {
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );
                }

                if (response?.message) {
                  toast.success(response.message, { theme: "dark" });
                  setEmail(values.email);
                  setUserId(response?.userId);
                  setOtpFromBackend(response?.OTP);

                  openModal("RegisterOTPVerificationModal", {
                    email: values.email,
                    userId: response?.userId,
                    otpFromBackend: response?.OTP,
                    onVerify: () => {
                      if (registerAs === "advertiser") {
                        navigate("/advertiser/dashboard", {
                          state: { success: response.message },
                        });
                      }
                      if (registerAs === "publisher") {
                        navigate("/publisher/dashboard", {
                          state: { success: response.message },
                        });
                      }
                      closeModal();
                    },
                  });
                } else {
                  console.error("Unexpected response:", response);
                }
              } catch (error) {
                console.error("Error caught:", error);
                toast.error(error.response?.data?.message || error.message, {
                  theme: "dark",
                });
              } finally {
                setLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({
              values,
              setFieldValue,
              errors,
              touched,
              setFieldTouched,
              validateForm,
              setTouched,
              isSubmitting,
            }) => (
              <Form className="flex flex-col gap-2">
                {currentStep === 1 && (
                  <>
                    <div className="w-full pr-1 mb-3 md:mb-0">
                      <Dropdown
                        options={[
                          { value: "advertiser", label: "Advertiser" },
                          { value: "publisher", label: "Publisher" },
                        ]}
                        label="Register as"
                        placeholder="Please Select who you are"
                        onChange={handleRegisterAsChange}
                        name="registerAs"
                        value={registerAs}
                        isDropdownOpen={isDropdownOpen}
                        setIsDropdownOpen={setIsDropdownOpen}
                        dropdownRef={dropdownRef}
                      />
                    </div>
                    <div className="w-full pr-1 mb-3 md:mb-0">
                      <div className="mb-2 font-medium text-black dark:text-white">
                        Full Name<span className="text-red-500">*</span>
                      </div>
                      <Field
                        name="name"
                        type="text"
                        className="w-full rounded-lg border bg-white py-2 px-3 text-black outline-none focus-visible:shadow-none dark:text-white"
                        placeholder="Full Name"
                        onChange={(e) => {
                          let { value } = e.target;
                          value = value
                            .replace(/[^a-zA-Z\s]/g, "")
                            .slice(0, 25);
                          setFieldValue("name", capitalizeFirstLetter(value));
                        }}
                      />
                      {errors.name && touched.name ? (
                        <div className="text-red-500 text-sm">
                          {errors.name}
                        </div>
                      ) : null}
                    </div>

                    <div className="">
                      <div className="mb-2 font-medium text-black dark:text-white">
                        Email ID<span className="text-red-500">*</span>
                      </div>
                      <Field
                        name="email"
                        type="email"
                        className="w-full rounded-lg border bg-white py-2 px-3 text-black outline-none focus-visible:shadow-none dark:text-white"
                        placeholder="Email ID"
                        onChange={(e) => {
                          const { value } = e.target;
                          const sanitizedValue = sanitizeEmail(value);
                          setFieldValue("email", toLowerCase(sanitizedValue));
                        }}
                      />
                      {errors.email && touched.email ? (
                        <div className="text-red-500 text-sm">
                          {errors.email}
                        </div>
                      ) : null}
                    </div>

                    <div className="w-full pr-1 mb-3 md:mb-0">
                      <div className="mb-2 font-medium text-black dark:text-white">
                        Mobile Number<span className="text-red-500">*</span>
                      </div>
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

                    <div className="">
                      <div className="mb-2 font-medium text-black dark:text-white">
                        Password<span className="text-red-500">*</span>
                      </div>
                      <div className="flex relative">
                        <Field
                          name="password"
                          type={passwordVisible ? "text" : "password"}
                          className="w-full rounded-lg border bg-white py-2 px-3 text-black outline-none focus-visible:shadow-none dark:text-white"
                          placeholder="Password"
                          maxLength={15}
                        />
                        <button
                          type="button"
                          onClick={passwordVisibility}
                          className="text-gray-500 right-0 inset-y-2 pr-3 absolute focus:outline-none"
                        >
                          {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                      {errors.password && touched.password ? (
                        <div className="text-red-500 text-sm">
                          {errors.password}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={isTermsChecked}
                        onChange={toggleTermChecked}
                      />
                      <div className="text-xs sm:text-sm text-gray-600 flex">
                        <div>I agree to the</div>
                        <div
                          className="text-blue-500 hover:underline ml-2 cursor-pointer"
                          onClick={() => {
                            window.open("/privacy-policy", "_blank");
                          }}
                        >
                          terms and conditions
                        </div>
                      </div>
                    </div>
                    {termError && (
                      <div className="text-red-500 text-sm mt-1">
                        {termError}
                      </div>
                    )}

                    {registerAs === "publisher" ? (
                      <div className="my-2">
                        <button
                          type="button"
                          className="px-4 py-2 w-full text-sm mt-2 font-medium text-white bg-blue-500 rounded-md"
                          onClick={() =>
                            goToNextStep(validateForm, setTouched, touched)
                          }
                        >
                          Save and Next →
                        </button>
                      </div>
                    ) : (
                      <div className="my-2">
                        <button
                          type="submit"
                          className="px-4 py-2 w-full text-sm mt-2 font-medium text-white bg-blue-500 rounded-md"
                        >
                          {loading ? "Sending..." : "Send OTP"}
                        </button>
                      </div>
                    )}

                    <div className="text-[#002D74] text-center">
                      Already have an account?
                      <Link
                        to="/login"
                        className="text-blue-500 ml-1 hover:text-blue-700 font-semibold"
                      >
                        Log In
                      </Link>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="w-full pr-1 mt-2 mb-3 md:mb-0">
                      <div className="mb-2 font-medium text-black dark:text-white">
                        Website Name<span className="text-red-500">*</span>
                      </div>
                      <Field
                        name="websitename"
                        type="text"
                        className="w-full rounded-lg border bg-white py-2 px-3 text-black outline-none focus-visible:shadow-none dark:text-white"
                        placeholder="Website Name"
                      />
                      {errors.websitename && touched.websitename ? (
                        <div className="text-red-500 text-sm">
                          {errors.websitename}
                        </div>
                      ) : null}
                    </div>

                    <div className="w-full pr-1 mb-3 md:mb-0">
                      <div className="mb-2 font-medium text-black dark:text-white">
                        Website URL<span className="text-red-500">*</span>
                      </div>
                      <Field
                        name="website"
                        type="text"
                        className="w-full rounded-lg border bg-white py-2 px-3 text-black outline-none focus-visible:shadow-none dark:text-white"
                        placeholder="Website URL"
                      />
                      {errors.website && touched.website ? (
                        <div className="text-red-500 text-sm">
                          {errors.website}
                        </div>
                      ) : null}
                    </div>
                    <div className="w-full pr-1 mb-3 md:mb-0">
                      <Dropdown
                        options={[
                          { value: "all", label: "All Category" },
                          { value: "custom", label: "Custom Category" },
                        ]}
                        label="Category"
                        placeholder="Select Category"
                        onChange={(name, value) => {
                          handleCategoryChange(name, value);
                          setFieldValue("category", value);
                        }}
                        name="category"
                        value={values.category}
                        isDropdownOpen={isDropdownOpen}
                        setIsDropdownOpen={setIsDropdownOpen}
                        dropdownRef={dropdownRef}
                      />

                      {errors.category && touched.category && (
                        <div className="text-red-500 text-sm">
                          {errors.category}
                        </div>
                      )}
                    </div>
                    {categoryType === "custom" && (
                      <>
                        <div className="w-full pr-1 mb-3 md:mb-0">
                          <div className="mb-2 font-medium text-black dark:text-white">
                            Allow Category
                            <span className="text-red-500">*</span>
                          </div>
                          <Select
                            isMulti
                            name="allowcategory"
                            options={categoryData}
                            value={categoryData.filter((option) =>
                              (values.allowcategory || []).includes(
                                option.value
                              )
                            )}
                            onChange={(selectedOptions) => {
                              const selectedValues = selectedOptions
                                ? selectedOptions.map((option) => option.value)
                                : [];
                              const filteredDisallowed = (
                                values.disallowcategory || []
                              ).filter(
                                (disallow) => !selectedValues.includes(disallow)
                              );
                              if (selectedValues.length > 0 && errors.allowcategory) {
                                setFieldTouched("allowcategory", false);
                              }
                              setFieldValue("allowcategory", selectedValues);
                              setFieldValue(
                                "disallowcategory",
                                filteredDisallowed
                              );
                            }}
                            placeholder="Select Allowed Category"
                          />

                          {errors.allowcategory && touched.allowcategory && (
                            <div className="text-red-500 text-sm">
                              {errors.allowcategory}
                            </div>
                          )}
                        </div>

                        <div className="w-full pr-1 mb-3 md:mb-0">
                          <div className="mb-2 font-medium text-black dark:text-white">
                            Disallow Category
                          </div>
                          <Select
                            isMulti
                            name="disallowcategory"
                            options={categoryData.filter(
                              (option) =>
                                !(values.allowcategory || []).includes(
                                  option.value
                                )
                            )}
                            value={categoryData.filter((option) =>
                              (values.disallowcategory || []).includes(
                                option.value
                              )
                            )}
                            onChange={(selectedOptions) => {
                              const selectedValues = selectedOptions
                                ? selectedOptions.map((option) => option.value)
                                : [];
                              const filteredAllowed = (
                                values.allowcategory || []
                              ).filter(
                                (allow) => !selectedValues.includes(allow)
                              );
                              setFieldValue("disallowcategory", selectedValues);
                              setFieldValue("allowcategory", filteredAllowed);
                            }}
                            placeholder="Select Disallowed Category"
                          />
                        </div>
                      </>
                    )}
                    <div className="flex gap-2 items-center justify-between">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm mt-2 font-medium text-white bg-gray-500 rounded-md"
                        onClick={goToPreviousStep}
                      >
                        ← Back
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2 text-sm mt-2 font-medium text-white bg-blue-500 rounded-md"
                      >
                        {loading ? "Sending..." : "Send OTP"}
                      </button>
                    </div>
                  </>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <ToastContainer />
      <Modal />
    </div>
  );
};

export default Register;
