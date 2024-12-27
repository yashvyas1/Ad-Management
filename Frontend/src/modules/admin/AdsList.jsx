import React, { useState } from "react";
import AdminAdListTable from "@/components/admin/table/AdminAdListTable";
import AdsInsightTable from "@/components/admin/table/AdsInsightTable";

function AdsList() {
  const [isFlag , setIsFlag] = useState(false)
  const [data,setData] = useState(null)

  const insightViewHandler=(value,item={})=>{
   if(value==="main"){
    setIsFlag(true)
    setData(item)
   }else{
    setIsFlag(false)
   }
   }

  return (
    <div>
      <div className=" dark:bg-slate-800">
      {isFlag?<AdsInsightTable insightViewHandler={insightViewHandler} data={data}/>:  <AdminAdListTable insightViewHandler={insightViewHandler} />}
      </div>
    </div>
  );
}

export default AdsList;
