import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next"; // Step 1: Import useTranslation
import Usa from "@/assets/images/flags/usa.png";
import It from "@/assets/images/flags/it.png"; // Update Italian flag

// Define the language options
const languages = [
  { code: "en", name: "English", image: Usa },
  { code: "it", name: "Italian", image: It }, // Change to Italian
];

const Language = () => {
  const { i18n } = useTranslation(); // Step 2: Destructure i18n for language change
  const [selected, setSelected] = useState(languages[0]);

  // Step 3: Update selected language and change i18n language
  const handleChange = (lang) => {
    setSelected(lang);
    i18n.changeLanguage(lang.code);
  };

  return (
    <div>
      <Listbox value={selected} onChange={handleChange}>
        <div className="relative z-[22]">
          <Listbox.Button className="relative w-full flex items-center cursor-pointer space-x-[6px] rtl:space-x-reverse">
            <span className="inline-block md:h-6 md:w-6 w-4 h-4 rounded-full">
              <img
                src={selected.image}
                alt=""
                className="h-full w-full object-cover rounded-full"
              />
            </span>
            <span className="text-sm md:block hidden font-medium text-slate-600 dark:text-slate-300">
              {selected.name}
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute min-w-[100px] ltr:right-0 rtl:left-0 md:top-[50px] top-[38px] w-auto max-h-60 overflow-auto border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 mt-1 ">
              {languages.map((item, i) => (
                <Listbox.Option key={i} value={item} as={Fragment}>
                  {({ active }) => (
                    <li
                      className={`w-full border-b border-b-gray-500 border-opacity-10 px-2 py-2 last:border-none last:mb-0 cursor-pointer first:rounded-t last:rounded-b
                        ${
                          active
                            ? "bg-slate-100 dark:bg-slate-700 dark:bg-opacity-70 bg-opacity-50 dark:text-white "
                            : "text-slate-600 dark:text-slate-300"
                        }
                        `}
                    >
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="flex-none">
                          <span className="lg:w-6 lg:h-6 w-4 h-4 rounded-full inline-block">
                            <img
                              src={item.image}
                              alt=""
                              className="w-full h-full object-cover relative top-1 rounded-full"
                            />
                          </span>
                        </span>
                        <span className="flex-1 lg:text-base text-sm capitalize">
                          {item.name}
                        </span>
                      </div>
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default Language;
