import { useRef } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

import video1 from "../../assets/videos/video1.mp4";
import video2 from "../../assets/videos/video2.mp4";
import video3 from "../../assets/videos/video3.mp4";
import video4 from "../../assets/videos/video4.mp4";

const Tutorials = () => {
  const videoRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const togglePlayPause = (index) => {
    const video = videoRefs[index].current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const videos = [
    { src: video1, title: "How to Create New Ad" },
    { src: video2, title: "How to Create Banner" },
    { src: video3, title: "How to Create Banner" },
    { src: video4, title: "How to Create New Ad" },
  ];

  return (
    <div className="flex flex-col bg-white p-4">
      <div className="flex gap-4 items-center p-2">
        <Link to={"/advertiser/support"}>
          <FaArrowLeftLong />
        </Link>
        <h1 className="text-xl">Tutorials</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-8">
        {videos.map((video, index) => (
          <div
            key={index}
            className="video-container bg-gray-100 p-8 rounded-md"
          >
            <video
              ref={videoRefs[index]}
              width="100%"
              controls={false}
              onClick={() => togglePlayPause(index)}
              className="rounded-md cursor-pointer"
            >
              <source src={video.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="mt-2 text-center font-semibold">{video.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutorials;
