import { useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";

const faqList = [
  {
    que: "How can I track the performance of my ad?",
    ans: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    que: "Why is my ad not getting any impressions?",
    ans: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    que: "How can I improve my ad's CTR (Click-Through Rate)?",
    ans: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    que: "What factors affect the visibility of my ad?",
    ans: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    que: "What should I do if my ad gets disapproved?",
    ans: "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra.",
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex gap-4 items-center p-2">
        <Link to={"/advertiser/support"}>
          <FaArrowLeftLong />
        </Link>
        <h1 className="text-xl">FAQs</h1>
      </div>
      <div className="py-8 px-16 w-full bg-white">
        {faqList.map((item, index) => (
          <div
            key={index}
            className="py-4 px-8 cursor-pointer bg-blue-100/50 mb-4 rounded-md"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center p-4">
              <h3 className="text-2xl font-medium text-gray-800">{item.que}</h3>
              <span
                className={`text-blue-500 transition-transform duration-300 ${
                  openIndex === index ? "rotate-45" : "rotate-0"
                }`}
              >
                <FiPlus className="h-8 w-8" />
              </span>
            </div>
            <div
              className={`overflow-hidden transition-max-height duration-300 ease-in-out ${
                openIndex === index ? "max-h-40" : "max-h-0"
              }`}
            >
              <div className="px-4 pb-4 text-lg text-gray-600">{item.ans}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
