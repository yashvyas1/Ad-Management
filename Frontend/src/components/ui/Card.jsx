import React from "react";
import useSkin from "@/hooks/useSkin";

const Card = ({
  children,
  title,
  subtitle,
  headerslot,
  className = "custom-class",
  bodyClass = "p-6",
  noborder,
  titleClass = "custom-class",
}) => {
  const [skin] = useSkin();

  return (
    <div
      className={`
        card rounded-md bg-white dark:bg-slate-800 ${
          skin === "bordered"
            ? "border border-slate-200 dark:border-slate-700"
            : "shadow-base"
        }
        ${className} flex flex-col justify-center items-center
      `}
    >
      {(title || subtitle) && (
        <div className={`p-0 ${noborder ? "no-border" : ""} text-center`}>
          <div>
            {title && (
              <div className={`card-title ${titleClass} mb-0 mt-4`}>
                {title}
              </div>
            )}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {headerslot && <div className="card-header-slot">{headerslot}</div>}
        </div>
      )}
      {/* Card body centered */}
      <main
        className={`card-body ${bodyClass} flex justify-center items-center`}
      >
        {children}
      </main>
    </div>
  );
};

export default Card;
