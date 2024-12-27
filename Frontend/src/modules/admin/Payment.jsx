import AdminPayment from "@/components/admin/table/AdminPayment";
import React, { useState } from "react";

function Payment() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { id: 0, label: "Payments" },
    { id: 1, label: "Manual Payments" },
  ];

  return (
    <>
      <AdminPayment />
    </>
  );
}

export default Payment;
