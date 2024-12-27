import { FaPaypal, FaStripe } from "react-icons/fa";
import { SiRazorpay } from "react-icons/si";

const Account = () => {
  return (
    <div className="bg-white flex flex-col p-8 space-y-6 rounded-md shadow-md">
      <div className="flex w-full mb-4 gap-4">
        <div className="w-full md:w-1/3 font-semibold">Country</div>
        <div className="border border-gray-200 w-36 p-2 text-gray-400 rounded-md">
          India
        </div>
      </div>

      <div className="flex justify-between gap-4 flex-wrap md:flex-nowrap">
        <div className="w-full md:w-1/3 font-semibold">Payment Information</div>
        <div className="flex flex-col w-full md:w-2/3 space-y-4">
          <div className="font-semibold mb-4">Payment Methods</div>
          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg w-32 cursor-default bg-[#F3F4FE]">
              <div className="relative">
                <FaPaypal className="text-blue-600 text-4xl bg-[#BFE6EF] p-2 rounded-full" />
              </div>
              <span className="mt-2 text-gray-700">Paypal</span>
            </div>

            <div className="flex flex-col items-center p-4 rounded-lg w-32 cursor-default bg-[#F3F4FE]">
              <div className="relative">
                <SiRazorpay className="text-blue-500 text-4xl bg-[#BFE6EF] p-2 rounded-full" />
              </div>
              <span className="mt-2 text-gray-700">Razorpay</span>
            </div>

            <div className="flex flex-col items-center p-4 rounded-lg w-32 cursor-default bg-[#F3F4FE]">
              <div className="relative">
                <FaStripe className="text-purple-600 text-4xl bg-[#BFE6EF] p-2 rounded-full" />
              </div>
              <span className="mt-2 text-gray-700">Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
