import React, { useState } from "react";
import PublisherAnalyticsTable from "@/components/publisher/table/PublisherAnalyticsTable";

function PublisherWebsiteAnalytics() {

  return (
    <div>
      <div className="dark:bg-slate-800">
        <PublisherAnalyticsTable />
      </div>
    </div>
  );
}

export default PublisherWebsiteAnalytics;