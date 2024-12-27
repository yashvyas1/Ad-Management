import { getRequest } from '@/services/backendAPIsServices';
import React, { useState, useEffect } from 'react'
import { RiPlayCircleLine } from "react-icons/ri";

const DashboardTopAds = () => {
    const [ads, setAds] = useState();

    const getTopAds = async () => {
        try {
            const response = await getRequest("/api/advertiser/topads")
            if (response) {
                setAds(response?.topAds);
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        getTopAds()
    }, [])

    return (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 p-4 rounded-md shadow-md">
            <h2 className="text-lg font-semibold mb-4">Top Ads</h2>
            <ul className="space-y-2 overflow-y-auto pr-2 h-[25rem]">
                {ads && ads.length > 0 ? (
                    ads.map((topAd, index) => (
                        <li key={index} className="flex items-center justify-between pb-3">
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center justify-center border h-8 w-8 rounded-lg">
                                    {topAd?.file_path && /\.(gif|png|jpg|jpeg)$/i.test(topAd.file_path) ? (
                                        <img src={topAd.file_path} alt="Icon" className="h-full w-full" />
                                    ) : topAd?.file_path && /\.mp4$/i.test(topAd.file_path) ? (
                                        <RiPlayCircleLine className="h-6 w-6" />
                                    ) : null}
                                </div>
                                <span className="font-medium text-md capitalize">{topAd?.ad_name}</span>
                            </div>
                            <span className="text-gray-900 text-md dark:text-[#CBD5E1]">
                                {topAd?.total_click || 0}
                                <p className="text-xs text-gray-400 dark:text-[#CBD5E1]">Clicks</p>
                            </span>
                        </li>
                    ))
                ) : (
                    <li className="text-center text-gray-500">No data available</li>
                )}
            </ul>
        </div>
    )
}

export default DashboardTopAds