import React, { useRef, useEffect, useState } from "react";
import Navmenu from "./Navmenu";
import { menuItems, advertiserMenu, publisharMenu } from "@/constant/data"; 
import SimpleBar from "simplebar-react";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useMobileMenu from "@/hooks/useMobileMenu";
import Icon from "@/components/ui/Icon";


import xlLogo2 from "../../../assets/images/logo/1xlLogo2.png"
import xlLogo3 from "../../../assets/images/logo/1xlLogo3.png"

const MobileMenu = ({ className = "custom-class" }) => {
  const scrollableNodeRef = useRef();
  const [scroll, setScroll] = useState(false);
  const [menu, setMenu] = useState(menuItems); 
  const role = localStorage.getItem("role");

  useEffect(() => {
    
    if (role === "advertiser") {
      setMenu(advertiserMenu&&advertiserMenu);
    } else if (role === "publisher") {
      setMenu(publisharMenu&&publisharMenu);
    } else {
      setMenu(menuItems&&menuItems); 
    }

    const handleScroll = () => {
      if (scrollableNodeRef.current) {
        if (scrollableNodeRef.current.scrollTop > 0) {
          setScroll(true);
        } else {
          setScroll(false);
        }
      }
    };

    if (scrollableNodeRef.current) {
      scrollableNodeRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollableNodeRef.current) {
        scrollableNodeRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [role]);

  const [isSemiDark] = useSemiDark();
  const [skin] = useSkin();
  const [isDark] = useDarkMode();
  const [mobileMenu, setMobileMenu] = useMobileMenu();

  return (
    <div
      className={`${className} fixed top-0 bg-white dark:bg-slate-800 shadow-lg h-full w-[248px]`}
    >
      <div className="logo-segment flex justify-between items-center bg-white dark:bg-slate-800 z-[9] h-[85px] px-4">
        <Link to="#">
          <div className="flex items-center space-x-4">
            <div className="logo-icon">
              {!isDark && !isSemiDark ? (
                <img src={xlLogo2} alt="Mobile Logo" />
              ) : (
                <img src={xlLogo3} alt="Mobile Logo White" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Ads Management
              </h1>
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenu(!mobileMenu)}
          className="cursor-pointer text-slate-900 dark:text-white text-2xl"
        >
          <Icon icon="heroicons:x-mark" />
        </button>
      </div>

      <div
        className={`h-[60px] absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
          scroll ? " opacity-100" : " opacity-0"
        }`}
      ></div>

      <SimpleBar
        className="-menu px-4 h-[calc(100%-80px)]"
        scrollableNodeProps={{ ref: scrollableNodeRef }}
      >
        <Navmenu menus={menu} /> 
      </SimpleBar>
    </div>
  );
};

export default MobileMenu;
