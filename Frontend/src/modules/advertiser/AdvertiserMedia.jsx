
import Icons from '@/components/ui/Icon';
import React, { useState, useEffect, useRef } from 'react';
import { CiSearch } from 'react-icons/ci';
import Datepicker from "react-tailwindcss-datepicker";
import Select from "react-select";
import { postRequest, getRequest } from '@/services/backendAPIsServices';

const AdvertiserMedia = () => {

    const [updatedDate, setUpdatedDate] = useState(null);
    const [type, setType] = useState("image");
    const [images, setImages] = useState([
        { id: 1, src: '/images/data-online-technology.jpg', title: 'Data online technology.jpg', orientation: "horizontal", mediaType: 'image', createdAt: "2024-10-23T12:04:23.084Z", },
        { id: 2, src: '/images/landscape.jpg', title: 'Landscape1.jpg', orientation: "vertical", mediaType: 'image', createdAt: "2024-10-12T12:04:23.084Z", },
        { id: 3, src: '/images/figma.png', title: 'figma.png', orientation: "horizontal", mediaType: 'image', createdAt: "2024-11-13T12:04:23.084Z", },
        { id: 4, src: '/images/new.png', title: 'new.png', orientation: "vertical", mediaType: 'image', createdAt: "2024-08-08T12:04:23.084Z", },
        { id: 5, src: '/videos/sample-video.mp4', orientation: "vertical", title: 'Sample Video.mp4', mediaType: 'video', createdAt: "2024-11-02T12:04:23.084Z", },
    ]);
    const [selectedImageIds, setSelectedImageIds] = useState([]);
    const [fileTypeError, setFileTypeError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const fileInputRef = useRef(null);
    const [uploadKey, setUploadKey] = useState(0);

    useEffect(() => {
        setFileTypeError(null);
        setSelectedImageIds([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploadKey(prevKey => prevKey + 1)
    }, [type]);

    const handleImageSelect = (id) => {
        setSelectedImageIds((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((imageId) => imageId !== id)
                : [...prevSelected, id]
        );
    };

    const typeOptions = [
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video' },
    ];

    const MAX_IMAGES = 10;

    const handleUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files && files.length > 0) {
            const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
            const allowedVideoTypes = ["video/mp4"];
            const createdAt = new Date().toISOString();

            if (type === "image") {
                if (images.length + files.length > MAX_IMAGES) {
                    setFileTypeError(
                        `You can only upload up to ${MAX_IMAGES} images. Currently, you have uploaded ${images.length}.`
                    );
                    return;
                }

                const uploadedFiles = [];
                const formData = new FormData();

                for (const file of files) {
                    if (allowedImageTypes.includes(file.type)) {
                        const img = new Image();
                        img.src = URL.createObjectURL(file);

                        await new Promise((resolve) => {
                            img.onload = () => {
                                const { width, height } = img;

                                let orientation = "";
                                if (width <= 300 && height <= 600) {
                                    orientation = "vertical";
                                } else if (width <= 600 && height <= 300) {
                                    orientation = "horizontal";
                                }

                                if (orientation === "") {
                                    setFileTypeError(
                                        "Image dimensions should be 300 x 600 or 600 x 300"
                                    );
                                    resolve();
                                    return;
                                }

                                const extendedFile = {
                                    title: file.name,
                                    orientation,
                                    mediaType: "image",
                                    createdAt,
                                };

                                uploadedFiles.push(extendedFile);
                                formData.append("files[]", file);
                                resolve();
                            };
                        });
                    } else {
                        setFileTypeError(
                            "Unsupported image file type. Please upload JPEG, PNG, or GIF files."
                        );
                    }
                }

                formData.append("mediaData", JSON.stringify(uploadedFiles));

                try {
                    const response = await postRequest("api/advertiser/uploadmedia", formData, {
                        headers: {
                            Authorization: `Bearer <YOUR_ACCESS_TOKEN>`,
                        },
                    });

                    if (response?.data?.uploadedFiles) {
                        const newImages = response.data.uploadedFiles.map((uploadedFile, index) => ({
                            id: images.length + 1 + index,
                            src: uploadedFile.url,
                            title: uploadedFile.name,
                            orientation: uploadedFile.orientation,
                            mediaType: "image",
                            createdAt,
                        }));

                        setImages((prev) => [...prev, ...newImages]);
                        setFileTypeError(null);
                    } else {
                        console.error("Upload failed:", response?.error || "Unknown error");
                    }
                } catch (error) {
                    console.error("Error uploading files:", error);
                }
            } else if (type === "video" && allowedVideoTypes.includes(files[0].type)) {
                const file = files[0];
                const formData = new FormData();
                formData.append("file", file);

                const videoData = {
                    id: images.length + 1,
                    title: file.name,
                    orientation: "horizontal",
                    mediaType: "video",
                    createdAt,
                };

                formData.append("mediaData", JSON.stringify([videoData]));

                try {
                    const response = await postRequest("api/advertiser/uploadmedia", formData, {
                        headers: {
                            Authorization: `Bearer <YOUR_ACCESS_TOKEN>`,
                        },
                    });

                    if (response?.data?.uploadedFile) {
                        const uploadedFile = response.data.uploadedFile;

                        const newVideo = {
                            id: images.length + 1,
                            src: uploadedFile.url,
                            title: uploadedFile.name,
                            orientation:
                                uploadedFile.videoWidth > uploadedFile.videoHeight
                                    ? "horizontal"
                                    : "vertical",
                            mediaType: "video",
                            createdAt,
                        };

                        setImages((prev) => [...prev, newVideo]);
                        setFileTypeError(null);
                    } else {
                        console.error("Upload failed:", response?.error || "Unknown error");
                    }
                } catch (error) {
                    console.error("Error uploading video:", error);
                }
            } else {
                setFileTypeError(
                    `Unsupported file type. Please upload a ${type === "image" ? "JPEG, PNG, GIF image" : "MP4 video"
                    }.`
                );
            }
        }
    };

    const handleImageDelete = () => {
        setSelectedImageIds([]);
    };

    const filteredImages = images
        .filter(image => type ? image.mediaType === type : true)
        .filter(image =>
            searchText ? image.title.toLowerCase().includes(searchText.toLowerCase()) : true
        )
        .filter(image =>
            updatedDate ? new Date(image.createdAt).toDateString() === new Date(updatedDate.startDate).toDateString() : true
        );

    return (
        <div><h2 className="text-2xl font-semibold text-[#444] mb-4">Media</h2>
            <div className="w-full bg-white rounded-lg shadow-xl p-4 mt-8 mb-4 overflow-y-auto">
                {selectedImageIds.length > 0 && (
                    <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                        <Icons
                            icon="mdi:delete-circle-outline"
                            width="36"
                            height="36"
                        />
                    </button>
                )}
                {selectedImageIds.length > 0 && (
                    <button
                        onClick={handleImageDelete}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        <Icons
                            icon="mdi:delete-circle-outline"
                            width="36"
                            height="36"
                        />
                    </button>
                )}
                <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto mb-4">
                    <div className="flex items-center border border-[#E6EAEF] p-2 rounded-xl w-[15rem] bg-white shadow-sm">
                        <CiSearch className="text-gray-400 text-xl mx-2" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full focus:outline-none text-gray-600"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <div className="w-[7rem]">
                        <div className="relative rounded-xl border border-[#E6EAEF] py-1 pl-2 w-full">
                            <Datepicker
                                useRange={false}
                                asSingle={true}
                                value={updatedDate}
                                placeholder="Date"
                                onChange={(newValue) => setUpdatedDate(newValue)}
                                inputClassName="w-full p-1 text-gray-500 placeholder-gray-400 rounded-md focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="w-[8rem]">
                        <Select
                            key={type}
                            onChange={(option) => setType(option.value)}
                            value={typeOptions.find(option => option.value === type)}
                            options={typeOptions}
                            placeholder="Select"
                            classNamePrefix="react-select"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: '12px',
                                    boxShadow: 'none',
                                    borderColor: '#D1D5DB',
                                    padding: '0.12rem',
                                }),
                                option: (base) => ({
                                    ...base,
                                    padding: '0.5rem 1rem',
                                    color: '#000',
                                    cursor: 'pointer',
                                }),
                                menu: (base) => ({
                                    ...base,
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                    borderRadius: '0.375rem',
                                    overflow: 'hidden',
                                    zIndex: 1000,
                                    maxHeight: '200px',
                                }),
                                indicatorSeparator: (base) => ({
                                    ...base,
                                    display: 'none',
                                }),
                            }}
                        />
                    </div>
                </div>
                <hr className='border-[#E6EAEF] py-2' />
                <div className="grid grid-cols-4 gap-4">
                    {filteredImages.map((image) => (
                        <div
                            key={image.id}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border shadow-sm ${type && image.mediaType !== type ? "opacity-50 pointer-events-none" : ""}`}
                            onClick={() => handleImageSelect(image.id)}
                        >
                            {image.mediaType === 'video' ? (
                                <video src={image.src} className="w-full h-32 object-cover" />
                            ) : (
                                <img src={image.src} alt={image.title} className="w-full h-32 object-cover" />
                            )}
                            <input
                                type="checkbox"
                                checked={selectedImageIds.includes(image.id)}
                                onChange={() => handleImageSelect(image.id)}
                                disabled={type && image.mediaType !== type}
                                className="absolute top-2 right-2 w-5 h-5 text-blue-500 bg-white border-2 rounded-full cursor-pointer"
                            />
                            <p className="text-center text-sm mt-1">{image.title}</p>
                        </div>
                    ))}
                    {type === 'image' ? (
                        <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg h-40 text-blue-500">
                            <input key={uploadKey} type="file" accept="image/*" multiple={type === 'image'} onChange={handleUpload} className="hidden" />
                            <p className='text-center w-28'>Click here to upload or drop images here</p>
                        </label>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg h-40 text-blue-500">
                            <input key={uploadKey} type="file" accept="video/mp4" onChange={handleUpload} className="hidden" />
                            <p className='text-center w-28'>Click here to upload or drop videos here</p>
                        </label>
                    )}
                </div>
                {fileTypeError && (
                    <p className="text-red-500 text-sm mt-2">
                        {fileTypeError}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdvertiserMedia;




