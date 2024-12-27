
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { RiArrowDownSLine, RiArrowUpSLine, RiPlayCircleLine } from "react-icons/ri";
import { IoInformationCircleOutline } from "react-icons/io5";
import countryList from "react-select-country-list";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getRequest, postRequestAds } from "@/services/backendAPIsServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useModal from "@/hooks/useModal";
import Modal from "@/components/common/Modal";

const deviceTypes = ["Desktop", "Mobile", "Tablet"];

const adTypeOption = [
  { label: "Banner", value: "Banner" },
  { label: "Video", value: "Video" },
]

const CountryDropdown = ({
  options,
  placeholder,
  onChange = () => { },
  label,
  error,
  name,
  value,
  setValue,
  infoIcon = false,
  tooltipMessage = "",
}) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const toggleActive = () => setIsActive(!isActive);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsActive(false);
    onChange(option.value);
    setValue(name, option.value);
  };

  const handleClickOutside = (event) => {
    if (!dropdownRef.current?.contains(event.target)) {
      setIsActive(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedOption(options.find((opt) => opt.value === value) || null);
  }, [value, options]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-base text-[#40485D] font-semibold">
          {label}
          <span className="text-red-500"> *</span>
        </label>
        {infoIcon && (
          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <IoInformationCircleOutline
              className="ml-2 text-[#444]"
              size={20}
            />
            {isHovered && (
              <div className="absolute right-0 bottom-full mt-2 flex items-center bg-gray-800 text-white text-sm rounded-lg shadow-lg px-4 py-2 z-10 whitespace-nowrap">
                {tooltipMessage}
                <div className="absolute bottom-1.5 left-4 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className="flex w-full items-center justify-between gap-2 mt-2 border bg-white px-4 py-2 rounded-lg cursor-pointer"
        onClick={toggleActive}
      >
        <div
          className={`font-normal text-base ${selectedOption ? "text-black" : "text-gray-400"
            }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <div>{isActive ? <RiArrowUpSLine /> : <RiArrowDownSLine />}</div>
      </div>
      {isActive && (
        <div className="w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search Country"
            className="w-full px-4 py-2 border-b"
          />
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};

const Dropdown = ({
  options,
  placeholder,
  onChange = () => { },
  label,
  error,
  name,
  value,
  setValue,
  infoIcon = false,
  tooltipMessage = "",
}) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value);
  const dropdownRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const toggleActive = () => setIsActive(!isActive);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsActive(false);
    onChange(option.value);
    setValue(name, option.value);
  };

  const handleClickOutside = (event) => {
    if (!dropdownRef.current?.contains(event.target)) {
      setIsActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedOption(options.find((opt) => opt.value === value) || null);
  }, [value, options]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-base text-[#40485D] font-semibold">
          {label}
          <span className="text-red-500"> *</span>
        </label>
        {infoIcon && (
          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <IoInformationCircleOutline
              className="ml-2 text-[#444]"
              size={20}
            />
            {isHovered && (
              <div className="absolute right-0 bottom-full mt-2 flex items-center bg-gray-800 text-white text-sm rounded-lg shadow-lg px-4 py-2 z-10 whitespace-nowrap">
                {tooltipMessage}
                <div className="absolute bottom-1.5 left-4 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className="flex w-full items-center justify-between gap-2 mt-2 border bg-white px-4 py-2 rounded-lg cursor-pointer"
        onClick={toggleActive}
      >
        <div
          className={`font-normal text-base ${selectedOption ? "text-black" : "text-gray-400"
            }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <div>{isActive ? <RiArrowUpSLine /> : <RiArrowDownSLine />}</div>
      </div>
      {isActive && (
        <div className="w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};

const MultiSelectDropdown = ({
  options,
  placeholder,
  onChange = () => { },
  label,
  error,
  name,
  setValue,
  infoIcon = false,
  tooltipMessage = "",
  selectedOptions,
  setSelectedOptions,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef(null);

  const toggleActive = () => setIsActive(!isActive);

  const handleOptionClick = (option) => {
    let updatedOptions;

    if (selectedOptions.includes(option.value)) {
      updatedOptions = selectedOptions.filter((item) => item !== option.value);
    } else {
      updatedOptions = [...selectedOptions, option.value];
    }

    setSelectedOptions(updatedOptions);
    setValue(name, updatedOptions);
    onChange(updatedOptions);
  };

  const handleClickOutside = (event) => {
    if (!dropdownRef.current?.contains(event.target)) {
      setIsActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-base text-[#40485D] font-semibold">
          {label}
          <span className="text-red-500"> *</span>
        </label>
        {infoIcon && (
          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <IoInformationCircleOutline
              className="ml-2 text-[#444]"
              size={20}
            />
            {isHovered && (
              <div className="absolute right-0 bottom-full mt-2 flex items-center bg-gray-800 text-white text-sm rounded-lg shadow-lg px-4 py-2 z-10 whitespace-nowrap">
                {tooltipMessage}
                <div className="absolute bottom-1.5 left-4 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className="flex w-full items-center justify-between gap-2 mt-2 border bg-white px-4 py-2 rounded-lg cursor-pointer"
        onClick={toggleActive}
      >
        <div
          className={`font-normal text-base ${selectedOptions.length ? "text-black" : "text-gray-400"
            }`}
        >
          {selectedOptions.length
            ? selectedOptions
              .map((option) => options.find((o) => o.value === option)?.label)
              .join(", ")
            : placeholder}
        </div>
        <div>{isActive ? <RiArrowUpSLine /> : <RiArrowDownSLine />}</div>
      </div>
      {isActive && (
        <div className="w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-black ${selectedOptions.includes(option.value) ? "bg-blue-100" : ""
                }`}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};

const TextField = ({
  name,
  placeholder,
  type = "text",
  label,
  register,
  errors,
  infoIcon = false,
  validation = {},
  tooltipMessage = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between">
        <label className="text-base text-[#40485D] font-semibold">
          {label}
          <span className="text-red-500"> *</span>
        </label>
        {infoIcon && (
          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <IoInformationCircleOutline
              className="ml-2 text-[#444]"
              size={20}
            />
            {isHovered && (
              <div className="absolute right-0 bottom-full mt-2 flex items-center bg-gray-800 text-white text-sm rounded-lg shadow-lg px-4 py-2 z-10 whitespace-nowrap">
                {tooltipMessage}
                <div className="absolute bottom-1.5 left-4 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <input
        type={type}
        {...register(name, validation)}
        className="w-full px-3 py-2 mt-2 text-[#939393] font-normal text-base border rounded-md focus:outline-none"
        placeholder={placeholder}
      />
      {errors[name] && (
        <div className="text-red-500 text-sm">{errors[name].message}</div>
      )}
    </div>
  );
};

const DateField = ({
  labelFrom,
  labelTo,
  error,
  setValue,
  infoIcon = false,
  tooltipMessage = "",
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setValue("startDate", date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setValue("endDate", date);
  };

  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return currentDate.getTime() < selectedDate.getTime();
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between">
        <label className="text-base text-[#40485D] font-semibold">
          {labelFrom}
          <span className="text-red-500"> *</span>
        </label>
        {infoIcon && (
          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <IoInformationCircleOutline
              className="ml-2 text-[#444]"
              size={20}
            />
            {isHovered && (
              <div className="absolute right-0 bottom-full mt-2 flex items-center bg-gray-800 text-white text-sm rounded-lg shadow-lg px-4 py-2 z-10 whitespace-nowrap">
                {tooltipMessage}
                <div className="absolute bottom-1.5 left-4 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 w-full">
        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          showTimeSelect
          className="border rounded-md p-2 w-full focus:outline-none"
          placeholderText="Select From Date & Time"
          dateFormat="d-MM-yyyy h:mm aa"
          minDate={new Date()}
          timeIntervals={1}
          filterTime={filterPassedTime}
        />
      </div>
      <div className="mt-4"></div>
      <label className="text-base text-[#40485D] font-semibold mt-4">
        {labelTo}
        <span className="text-red-500"> *</span>
      </label>
      <div className="mt-2 w-full">
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          showTimeSelect
          className="border rounded-md p-2 w-full focus:outline-none"
          placeholderText="Select To Date & Time"
          dateFormat="d-MM-yyyy h:mm aa"
          minDate={new Date()}
          timeIntervals={1}
          filterTime={filterPassedTime}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};

const GalleryPreview = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClick = (e) => {
    const { clientX, currentTarget } = e;
    const boundingRect = currentTarget.getBoundingClientRect();
    const clickX = clientX - boundingRect.left;
    const clickRegion = boundingRect.width / 2;

    setCurrentIndex((prevIndex) => {
      if (clickX < clickRegion) {
        return prevIndex > 0 ? prevIndex - 1 : prevIndex;
      } else {
        return prevIndex < images.length - 1 ? prevIndex + 1 : prevIndex;
      }
    });
  };

  const currentMedia = images[currentIndex];

  return (
    <div className="relative">
      <div className="flex justify-center items-center bg-gray-50" onClick={handleClick}>
        {currentMedia.endsWith(".mp4") ? (
          <video
            src={currentMedia}
            controls
            poster="/path/to/video-poster.jpg"
            className="object-contain h-60"
          />
        ) : (
          <img
            src={currentMedia}
            alt={`Image ${currentIndex + 1}`}
            className="object-contain h-60"
          />
        )}
      </div>
      <div className="absolute top-2 right-2 bg-[#000] text-white px-2 py-1 rounded-lg text-sm">
        {currentIndex + 1}/{images.length}
      </div>
    </div>
  );
};

const CreateAd = () => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm();
  const [selectedAdType, setSelectedAdType] = useState(null);
  const [selectCategory, setSelectCategory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDeviceTypes, setSelectedDeviceTypes] = useState([]);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const locations = countryList().getData();
  const [resetKey, setResetKey] = useState(0);
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openModal, closeModal } = useModal();
  const [selectedImages, setSelectedImages] = useState([]);

  const handleAdTypeChange = (value) => {
    setSelectedAdType(value);
    setValue("adType", value);
    if (value) clearErrors("adType");
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getRequest("/api/advertiser/selected-data");
        if (response?.category) {
          const formattedCategories = response?.category.map((option) => ({
            label: option,
            value: option,
          }));
          setCategoryData(formattedCategories);
        }
      } catch (err) {
        console.error("Failed to fetch category data:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (value) => {
    setSelectCategory(value);
    setValue("category", value);
    if (value) clearErrors("category");
  }

  const handleSelectedImages = (images) => {
    setSelectedImages(images.map(image => ({
      file: image.src,
      id: image.id,
      mediaType: image.mediaType,
    })));
    closeModal();
  };

  const handleDeviceTypesChange = (selectedOptions) => {
    setSelectedDeviceTypes(selectedOptions);
    setValue("devices", selectedOptions);
    if (selectedOptions.length > 0) clearErrors("devices");
  };

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    setValue("country", value);
    if (value) clearErrors("country");
  };

  const getFormattedDate = (data) => {
    const date = new Date(data);
    const formattedDate = date
      .toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/");

    const formattedTime = date
      .toLocaleString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(" ", "");

    return "startDate", `${formattedDate} ${formattedTime}`;
  };

  const handleResetForm = () => {
    reset();
    setSelectedAdType(null);
    setSelectedImage(null);
    setSelectedDeviceTypes([]);
    setSelectCategory(null);
    setStartDate(null);
    setEndDate(null);
    setSelectedFile(null);
    setSelectedOptions([]);
    setSelectedCountry("");
    setValue("adType", "");
    setValue("country", "");
    setResetKey((prev) => prev + 1);
    navigate('/advertiser/advertisement')
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("adName", data.adName);
    formData.append("adType", selectedAdType);
    formData.append("targetURL", data.targetURL);
    formData.append("category", selectCategory);
    formData.append("devices", JSON.stringify(selectedDeviceTypes));
    formData.append("country", data.country);
    formData.append("startDate", getFormattedDate(data.startDate));
    formData.append("endDate", getFormattedDate(data.endDate));
    formData.append("budget", data.budget);

    if (selectedImage && selectedImage.file) {
      const fileName = selectedImage.file.name;
      formData.append("adFile", selectedImage.file);
    }

    try {
      const response = await postRequestAds("/api/advertiser/create-ad", formData);
      toast.success(response?.message);
      handleResetForm();
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage = err.response?.data?.message;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <div>
      <p className="text-[#444] text-2xl text-left font-semibold">Create Ad</p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-[35%_65%] gap-8 w-full mt-4"
      >
        <div className="flex flex-col gap-4">
          <TextField
            name="adName"
            label="Enter AD Name"
            placeholder="Enter AD Name"
            register={register}
            errors={errors}
            infoIcon={true}
            validation={{
              required: "AD Name is required",
            }}
            tooltipMessage="Enter your AD Name."
          />
          <Dropdown
            key={resetKey}
            name="adType"
            label="Select AD Type"
            value={selectedAdType}
            options={adTypeOption}
            placeholder="Select AD Type"
            onChange={handleAdTypeChange}
            error={errors.adType}
            infoIcon={true}
            tooltipMessage="Select your AD Type."
            register={register("adType", {
              required: "Ad Type is required",
            })}
          />
          <div className="border border-[#E6EAEF] bg-[#FFF] p-4 rounded-lg">
            <p className="text-[#444] font-semibold text-sm mb-1">Upload Image</p>
            <div className="bg-[#F1F5F9] pt-4 pb-2 px-2 rounded-lg">
              <div className="flex gap-2 overflow-x-auto w-full">
                {selectedImages.map((img, index) => (
                  <div key={index} className="w-20 h-20 overflow-hidden rounded-md">
                    {img.mediaType === "video" ? (
                      <div className="flex items-center justify-center w-full h-full bg-gray-200">
                        <RiPlayCircleLine className="h-6 w-6 text-gray-700" />
                      </div>
                    ) : (
                      <img
                        src={img.src}
                        alt={`Selected ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[#939393] text-center mt-2">Click to select from gallery</p>
              <div className="flex items-center justify-center py-2">
                <button className="bg-[#5F59FF] text-[#FFF] text-sm py-2 px-8 rounded-md"
                  onClick={() => openModal("GalleryModal", { setSelectedImages: handleSelectedImages, preSelectedImages: selectedImages, })}
                >Upload</button>
              </div>
            </div>
          </div>
          <TextField
            name="targetURL"
            label="Enter Target URL"
            placeholder="Enter Target URL"
            register={register}
            errors={errors}
            infoIcon={true}
            validation={{
              required: "Target URL is required",
              pattern: {
                value: /^https:\/\/.+/,
                message: "URL must start with https://",
              },
            }}
            tooltipMessage="Please provide a valid URL for the AD."
          />
          <Dropdown
            key={resetKey}
            name="category"
            label="Select Category"
            options={categoryData}
            placeholder="Select Category"
            onChange={handleCategoryChange}
            error={errors.category}
            infoIcon={true}
            tooltipMessage="Select the category for AD."
            register={register("category", {
              required: "Category is required",
            })}
          />
          <MultiSelectDropdown
            name="devices"
            label="Select Device"
            options={deviceTypes.map((device) => ({
              label: device,
              value: device,
            }))}
            placeholder="Select Device"
            setValue={setValue}
            error={errors.devices}
            onChange={handleDeviceTypesChange}
            infoIcon={true}
            tooltipMessage="Select target device for AD."
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            register={register("devices", {
              required: "Target Device is required",
            })}

          />
          <CountryDropdown
            name="country"
            label="Select Target Location"
            options={locations}
            placeholder="Select Target Location"
            value={selectedCountry}
            onChange={handleCountryChange}
            setValue={setValue}
            error={errors.country}
            infoIcon={true}
            tooltipMessage="Select target locations to display AD."
            register={register("country", {
              required: "Target Location is required",
            })}
          />
          <DateField
            labelFrom="Select From Date & Time"
            labelTo="Select To Date & Time"
            error={errors.date}
            setValue={setValue}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            infoIcon={true}
            tooltipMessage="Select the dates & time to schedule AD."
          />
          <TextField
            name="budget"
            label="Enter Daily AD Budget"
            placeholder="Enter Daily AD Budget"
            register={register}
            errors={errors}
            infoIcon={true}
            validation={{
              required: "AD Budget is required",
            }}
            tooltipMessage="Enter your Daily AD budget for AD."
          />
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="w-[10rem] p-2 border border-blue-500 rounded-lg bg-blue-500 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Review"}
            </button>
          </div>
        </div>
        <div className="w-full px-8 mt-8">
          <p className="text-[#444] text-lg text-center font-semibold pb-2">Preview</p>
          <div className="border rounded-lg border-gray-300 h-[65vh] flex items-center justify-center bg-gray-50 relative">
            {selectedImages.length > 0 ? (
              <GalleryPreview images={selectedImages.map(img => img.file)} />
            ) : (
              <p>No Gallery selected</p>
            )}
          </div>
        </div>
      </form>
      <Modal />
    </div>
  );
};

export default CreateAd;