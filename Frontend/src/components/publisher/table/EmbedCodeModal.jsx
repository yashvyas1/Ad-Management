import React, { useState, useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import { GrFormPrevious } from "react-icons/gr";
import { getRequest } from "@/services/backendAPIsServices";
import useModal from "@/hooks/useModal";

const scriptCode = `<script async src="http://localhost:3000/ad-script.js?publisherID=4"></script>`;
const divCode = `<div style="display: flex; justify-content:end; align-items: center; width:100%;height:750px;">
    <ins class="custom-ad" style="display:block;width:160px;height:400px;"></ins>
</div>`;

const EmbedCodeModal = ({ data }) => {

    const { closeModal } = useModal();
    const { website_id } = data;

    const [scriptCode, setScriptCode] = useState('');
    const [divCode, setDivCode] = useState('');

    const getData = async () => {
        try {
            const response = await getRequest(`/api/publisher/generatescript?website_id=${website_id}`);

            if (response) {
                const parts = response.split('</script>');

                const extractedScript = parts[0] + '</script>';
                const extractedDiv = parts[1]?.trim() || '';

                setScriptCode(extractedScript);
                setDivCode(extractedDiv);
            }
        } catch (err) {
            console.error(err)
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        alert('Embed code copied!');
    };

    const handelClose = () => {
        closeModal();
    }

    return (
        <div className="bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 h-full w-full sm:h-[34rem] sm:w-[34rem]">
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

            <div className="relative bg-[#2C2C2C] text-white w-full max-w-[90%] md:max-w-[42.5rem] p-6 rounded-lg max-h-[90%] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <GrFormPrevious className="text-xl cursor-pointer" />
                        <h2 className="text-lg text-white font-semibold">Copy embed code</h2>
                    </div>
                    <button className="text-2xl absolute right-6 top-4 focus:outline-none">
                        <RxCross1 onClick={handelClose} />
                    </button>
                </div>

                <div className="bg-[#383838] p-4 rounded-xl text-sm text-white mb-4 relative whitespace-pre-wrap break-all">
                    <pre className="whitespace-pre-wrap break-words">
                        <code>{scriptCode}</code>
                    </pre>
                    <div className="flex justify-end mt-2 space-x-4">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                            onClick={() => copyToClipboard(scriptCode)}
                        >
                            Copy
                        </button>
                    </div>
                </div>

                <div className="bg-[#383838] p-4 rounded-xl text-sm text-white relative whitespace-pre-wrap break-all">
                    <pre className="whitespace-pre-wrap break-words">
                        <code>{divCode}</code>
                    </pre>
                    <div className="flex justify-end mt-2 space-x-4">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                            onClick={() => copyToClipboard(divCode)}
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmbedCodeModal;