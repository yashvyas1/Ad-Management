import React, { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import Icon from "@/components/ui/Icon";

const menuItems = {
  admin: [
    { link: "admin/dashboard", title: "Dashboard" },
    { link: "admin/campaigns", title: "Campaigns" },
  ],
  advertiser: [
    { link: "advertiser/dashboard", title: "Dashboard" },
    { link: "advertiser/ads", title: "Ads" },
  ],
  publisher: [
    { link: "publisher/dashboard", title: "Dashboard" },
    { link: "publisher/reports", title: "Reports" },
  ],
};

const Breadcrumbs = () => {
  const location = useLocation();
  const role = "admin"
  const pathnames = location.pathname.split("/").filter((x) => x);
  
  const [menu, setMenu] = useState([]);
  const [groupTitle, setGroupTitle] = useState("");

  useEffect(() => {
   
    switch (role) {
      case "admin":
        setMenu(menuItems.admin);
        break;
      case "advertiser":
        setMenu(menuItems.advertiser);
        break;
      case "publisher":
        setMenu(menuItems.publisher);
        break;
      default:
        setMenu([]); 
    }
  }, [role]);

  const findMenuItem = (link) => {
    return menu.find((item) => item.link.includes(link));
  };

  return (
    <div>
      {/* <ul className="breadcrumbs flex items-center">
        <li className="text-primary-500">
          <NavLink to={`/${role}/dashboard`} className="text-lg">
            <Icon icon="heroicons-outline:home" />
          </NavLink>
          <span className="breadcrumbs-icon rtl:transform rtl:rotate-180">
            <Icon icon="heroicons:chevron-right" />
          </span>
        </li>
        
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const menuItem = findMenuItem(routeTo);
          
          return isLast ? (
            <li key={name} className="capitalize text-slate-500 dark:text-slate-400">
              {menuItem?.title || name.replace("-", " ")}
            </li>
          ) : (
            <li key={name} className="text-primary-500">
            
            </li>
          );
        })}
      </ul> */}
    </div>
  );
};

export default Breadcrumbs;
