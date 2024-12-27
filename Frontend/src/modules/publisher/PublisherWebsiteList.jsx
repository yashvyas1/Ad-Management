import React, { useState } from "react";
import PublisherListTable from "@/components/publisher/table/PublisherListTable";

function PublisherWebsiteList() {

  return (
    <div>
      <div className=" dark:bg-slate-800">
        <PublisherListTable />
      </div>
    </div>
  );
}

export default PublisherWebsiteList;