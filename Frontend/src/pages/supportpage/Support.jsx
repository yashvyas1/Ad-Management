import { FaTelegramPlane, FaUsers, FaWhatsapp } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import { RiBook2Line } from "react-icons/ri";
import { Link } from "react-router-dom";

const Support = () => {
  const sections = [
    {
      id: 1,
      icon: (
        <LuGraduationCap className="text-[#536DFE] text-6xl transform scale-x-[-1]" />
      ),
      title: "Tutorials",
      description:
        "Find tutorials from novice to expert to help you expand your skills",
    },
    {
      id: 2,
      icon: <RiBook2Line className="text-[#536DFE] text-6xl" />,
      title: "Written Guide",
      description:
        "Deepen your understanding with advanced techniques and optimization tips",
    },
    {
      id: 3,
      icon: (
        <LuGraduationCap className="text-[#536DFE] text-6xl transform scale-x-[-1]" />
      ),
      title: "FAQ",
      description:
        "Find tutorials from novice to expert to help you expand your skills",
    },
  ];
  return (
    <div className="flex flex-col w-full gap-8">
      <div className="bg-white flex flex-col items-center justify-center p-8 mx-4 gap-8 rounded-md">
        <div className="text-5xl text-[#334168] mb-4">How can we help?</div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap w-full gap-4 justify-center">
        {sections.map((item) => (
          <Link
            to={`/advertiser/${item.title.replace(/\s+/g, "-").toLowerCase()}`}
            key={item.id}
          >
            <div
              key={item.id}
              className="bg-white flex flex-col items-center h-auto justify-center mb-4 mr-4 p-12 gap-4 rounded-md shadow-md ml-4 w-full sm:w-auto"
            >
              <div className="h-16 w-16 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="text-[#334168] text-2xl font-semibold">
                {item.title.charAt(0).toUpperCase() + item.title.slice(1)}
              </div>
              <div className="text-[#444444] text-base text-center">
                {item.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex flex-col items-center bg-white p-8 mx-4 w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Need more help?
        </h2>
        <p className="text-gray-500 mb-6">Try this next steps</p>

        <div className="flex gap-8 w-full justify-center">
          <div className="flex items-center p-6 bg-white border border-gray-200 rounded-lg shadow-md w-1/3">
            <div className="text-blue-500 text-4xl mb-4">
              <FaUsers className="text-[#536DFE] text-6xl" />
            </div>
            <div className="flex flex-col w-full ml-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Join community
              </h3>
              <p className="text-gray-500 mb-2">
                Get answers from community members
              </p>
              <div className="flex">
                <FaWhatsapp className="text-green-500 text-3xl mr-2 cursor-pointer" />
                <FaTelegramPlane className="text-blue-500 text-3xl cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
