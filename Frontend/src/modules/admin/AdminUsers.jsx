import React, { useState } from "react";
import AdminUsersTables from "@/components/admin/table/AdminUsersTables";
import PublisherWebsiteDetails from "@/components/admin/table/PublisherWebsiteDetails";

function AdminUsers() {
  
  const [isFlag, setIsFlag] = useState(false);
  const [data, setData] = useState(null);

  const insightViewHandler = (value, item = {}) => {
    if (value === "main") {
      setIsFlag(true);
      setData(item);
    } else {
      setIsFlag(false);
    }
  };

  return (
    <div>
      <div className=" dark:bg-slate-800">
        {isFlag ? (
          <PublisherWebsiteDetails
            insightViewHandler={insightViewHandler}
            data={data}
          />
        ) : (
          <AdminUsersTables insightViewHandler={insightViewHandler} />
        )}
      </div>
    </div>
  );
}
export default AdminUsers;

