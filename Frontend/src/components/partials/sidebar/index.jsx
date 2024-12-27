import React, { useRef, useEffect, useState } from "react";
import SidebarLogo from "./Logo";
import Navmenu from "./Navmenu";
import { menuItems, advertiserMenu, publisharMenu } from "@/constant/data";
import SimpleBar from "simplebar-react";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";

const Sidebar = () => {
  const scrollableNodeRef = useRef();
  const [scroll, setScroll] = useState(false);
  const [menu, setMenu] = useState(menuItems); 
  const role = localStorage.getItem("role");

  useEffect(() => {
      if (role === "advertiser") {
      setMenu(advertiserMenu);
    } else if (role === "publisher") {
      setMenu(publisharMenu);
    } else {
      setMenu(menuItems); 
    }

    const handleScroll = () => {
      if (scrollableNodeRef.current) {
        setScroll(scrollableNodeRef.current.scrollTop > 0);
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

  const [collapsed, setMenuCollapsed] = useSidebar();
  const [menuHover, setMenuHover] = useState(false);
  const [isSemiDark] = useSemiDark();
  const [skin] = useSkin();

  return (
    <div className={isSemiDark ? "dark" : ""}>
      <div
        className={`sidebar-wrapper bg-white dark:bg-slate-800 ${
          collapsed ? "w-[72px] close_sidebar" : "w-[248px]"
        } ${menuHover ? "sidebar-hovered" : ""} ${
          skin === "bordered"
            ? "border-r border-slate-200 dark:border-slate-700"
            : "shadow-base"
        }`}
        onMouseEnter={() => setMenuHover(true)}
        onMouseLeave={() => setMenuHover(false)}
      >
        <SidebarLogo menuHover={menuHover} />
        <div
          className={`h-[60px] absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
            scroll ? "opacity-100" : "opacity-0"
          }`}
        ></div>

        <SimpleBar
          className="sidebar-menu px-4 h-[calc(100%-80px)]"
          scrollableNodeProps={{ ref: scrollableNodeRef }}
        >
          <Navmenu menus={menu} />
        </SimpleBar>
      </div>
    </div>
  );
};

export default Sidebar;
