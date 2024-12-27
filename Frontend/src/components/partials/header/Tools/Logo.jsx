import React from "react";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useWidth from "@/hooks/useWidth";
import xlLogo2 from "../../../../assets/images/logo/1xlLogo2.png"
import xlLogo3 from "../../../../assets/images/logo/1xlLogo3.png"

import MainLogo from "@/assets/images/logo/logo.svg";
import LogoWhite from "@/assets/images/logo/logo-white.svg";
import MobileLogo from "@/assets/images/logo/logo-c.svg";
import MobileLogoWhite from "@/assets/images/logo/logo-c-white.svg";
const Logo = () => {
  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();

  return (
    <div>
      <Link to="#">
      
          <img src={xlLogo2} alt="" />
      
    
      </Link>
    </div>
  );
};

export default Logo;
