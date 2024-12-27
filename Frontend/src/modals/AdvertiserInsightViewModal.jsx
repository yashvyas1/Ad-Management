import Icons from "@/components/ui/Icon";
import useModal from "@/hooks/useModal";
import { Field, Form, Formik } from "formik";
import { useEffect, useRef } from "react";
import moment from "moment";

function AdvertiserInsightViewModal({ data }) {
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

    const formatCurrency = (value) => {
        return "₹ " + value.toLocaleString();
    };

    return (
        <div className="flex items-center justify-center bg-opacity-50 z-50 mt-14">
            <div
                ref={modalRef}
                className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-lg shadow-xl p-6 sm:p-8 mx-2 relative mt-8 mb-4 max-h-[80vh] overflow-y-auto">
                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    onClick={closeModal}>
                    <Icons icon="iconamoon:close-fill" width="24" height="24" />
                </button>
                <h2 className="text-2xl font-semibold text-[#444] mb-4">
                    View Insight
                </h2>
                <Formik
                    initialValues={{
                        adName: data?.row?.ad_name || "",
                        type: data?.row?.ad_type || "",
                        visits: data?.row?.visits || "",
                        clicks: data?.row?.clicks || "",
                        ctr: data?.row?.ctr || "",
                        adCount: data?.row?.adCount || "",
                        createDateTime: moment(data?.row?.createdAt).format('DD/MM/YYYY hh:mm A') || "",
                        updatedDateTime: moment(data?.row?.updatedAt).format('DD/MM/YYYY hh:mm A') || "",
                        budget: data?.row?.ad_budget || 0,
                        location: data?.row?.location || 0,
                        device: data?.row?.device || 0,
                    }}
                >
                    {({ values }) => (
                        <Form>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        Ad Name
                                    </label>
                                    <Field
                                        name="adName"
                                        className="border rounded-md p-2 w-full capitalize"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        Ad Type
                                    </label>
                                    <Field
                                        name="type"
                                        className="border rounded-md p-2 w-full capitalize"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        Visits
                                    </label>
                                    <Field
                                        name="visits"
                                        className="border rounded-md p-2 w-full capitalize"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        Clicks
                                    </label>
                                    <Field
                                        name="clicks"
                                        className="border rounded-md p-2 w-full capitalize"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        CTR
                                    </label>
                                    <Field
                                        name="ctr"
                                        className="border rounded-md p-2 w-full capitalize"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        AD Count
                                    </label>
                                    <Field
                                        name="adCount"
                                        className="border rounded-md p-2 w-full capitalize"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        Create Date & Time
                                    </label>
                                    <Field
                                        name="createDateTime"
                                        className="border rounded-md p-2 w-full"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        Updated Date & Time
                                    </label>
                                    <Field
                                        name="updatedDateTime"
                                        className="border rounded-md p-2 w-full"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        Daily Budget
                                    </label>
                                    <div className="border rounded-md p-2 w-full">
                                        {formatCurrency(values.budget)}
                                    </div>
                                </div>
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        Geographic Location
                                    </label>
                                    <div className="border rounded-md p-2 w-full">
                                        India
                                    </div>
                                </div>
                                <div>
                                    <label className="font-semibold text-[#444] text-base">
                                        Device
                                    </label>
                                    <div className="border rounded-md p-2 w-full">
                                        Desktop
                                    </div>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default AdvertiserInsightViewModal;
