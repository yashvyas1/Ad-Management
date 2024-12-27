import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Collapse } from "react-collapse";
import Icon from "@/components/ui/Icon";
import { useDispatch } from "react-redux";
import useMobileMenu from "@/hooks/useMobileMenu";
import Submenu from "./Submenu";
import { IoClose } from "react-icons/io5";
import logoutImage from "@/assets/images/logout_image.jpg";
import useModal from "@/hooks/useModal";

const Navmenu = ({ menus }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // Track modal state
  const navigate = useNavigate();
  const location = useLocation();
  const locationName = location.pathname.replace("/", "");
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const [activeMultiMenu, setMultiMenu] = useState(null);
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const modalRef = useRef(null);

  const toggleSubmenu = (i) => {
    setActiveSubmenu(activeSubmenu === i ? null : i);
  };

  const toggleMultiMenu = (j) => {
    setMultiMenu(activeMultiMenu === j ? null : j);
  };

  const isLocationMatch = (targetLocation) => {
    return (
      locationName === targetLocation ||
      locationName.startsWith(`${targetLocation}/`)
    );
  };

  // Open modal when logout is initiated
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  // Perform logout actions on confirmation
  const handleConfirmLogout = () => {
    const role = localStorage.getItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userid");

    // Navigate based on role
    if (role === "admin") {
      navigate("/admin/login");
    } else {
      navigate("/login");
    }
    setIsLogoutModalOpen(false); // Close modal after logout
  };

  useEffect(() => {
    let submenuIndex = null;
    let multiMenuIndex = null;
    menus.forEach((item, i) => {
      if (isLocationMatch(item.link)) {
        submenuIndex = i;
      }

      if (item.child) {
        item.child.forEach((childItem, j) => {
          if (isLocationMatch(childItem.childlink)) {
            submenuIndex = i;
          }

          if (childItem.multi_menu) {
            childItem.multi_menu.forEach((nestedItem) => {
              if (isLocationMatch(nestedItem.multiLink)) {
                submenuIndex = i;
                multiMenuIndex = j;
              }
            });
          }
        });
      }
    });
    document.title = `Ads Management | 1XL `;

    setActiveSubmenu(submenuIndex);
    setMultiMenu(multiMenuIndex);
    if (mobileMenu) {
      setMobileMenu(false);
    }
  }, [location]);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [closeModal]);

  return (
    <>
      <ul>
        {menus.map((item, i) => (
          <li
            key={i}
            className={` single-sidebar-menu 
              ${item.child ? "item-has-children" : ""}
              ${activeSubmenu === i ? "open" : ""}
             ${item.link === "advertiser/advertisement" &&
                (location.pathname.includes("advertiser/advertisement") ||
                  location.pathname.includes("advertiser/ads-list"))
                ? "menu-item-active"
                : locationName === item.link
                  ? "menu-item-active"
                  : ""
              }`}
          >
            {/* Single menu with no children */}
            {!item.child && !item.isHeadr && (
              <NavLink className="menu-link" to={item.link}>
                <span className="menu-icon flex-grow-0">
                  <Icon icon={item.icon} />
                </span>
                <div className="text-box flex-grow">{item.title}</div>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </NavLink>
            )}
            {/* Only for menulabel */}
            {item.isHeadr && !item.child && (
              <div className="menulabel">{item.title}</div>
            )}
            {/* Submenu parent */}
            {item.child && (
              <div
                className={`menu-link ${activeSubmenu === i
                    ? "parent_active not-collapsed"
                    : "collapsed"
                  }`}
                onClick={() => toggleSubmenu(i)}
              >
                <div className="flex-1 flex items-start">
                  <span className="menu-icon">
                    <Icon icon={item.icon} />
                  </span>
                  <div className="text-box">{item.title}</div>
                </div>
                <div className="flex-0">
                  <div
                    className={`menu-arrow transform transition-all duration-300 ${activeSubmenu === i ? " rotate-90" : ""
                      }`}
                  >
                    <Icon icon="heroicons-outline:chevron-right" />
                  </div>
                </div>
              </div>
            )}

            <Submenu
              activeSubmenu={activeSubmenu}
              item={item}
              i={i}
              toggleMultiMenu={toggleMultiMenu}
              activeMultiMenu={activeMultiMenu}
            />
          </li>
        ))}

        {/* Logout option */}
        <li className="single-sidebar-menu">
          <div className="menu-link" onClick={handleLogout}>
            <div className="flex-1 flex items-start">
              <span className="menu-icon">
                <Icon icon="heroicons-outline:login" /> {/* Logout Icon */}
              </span>
              <div className="text-box">Logout</div>
            </div>
          </div>
        </li>
      </ul>

      {/* Logout confirmation modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-grey-600 bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 sm:p-4 mx-4 relative">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <IoClose size={24} />
            </button>
            <div className="flex justify-center mb-6">
              <img src={logoutImage} alt="Logout" className="w-24 h-24" />
            </div>
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
              Are you sure you want to log out?
            </h2>
            <p className="text-center text-gray-600 mb-6 sm:mb-4 text-sm">
              Once logged out, you'll need to re-enter your details to access
              the app.
            </p>
            <div className="flex sm:flex-row justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="w-full sm:w-40 h-12 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout} // Perform logout on confirmation
                className="w-full sm:w-40 h-12 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navmenu;
