// import React, { useEffect, useState } from 'react'
// import axios from "axios"
import { useEffect, useState } from 'react'

// 修正 for vercel
import { api } from "../api"; // 引入我們在 api.js 定義好的 axios instance


 const useFetch = (url) => {
    const [data, setData]=useState([]);
    const [loading,setLoading]=useState(false);
    const [error, setError] =useState("");

    useEffect(()=>{

    //    const fetchData =async()=>{ 
    //     setLoading(true);
    //     try{
    //         // const response = await axios.get(url)
    //         const response = await api.get(url); // 這裡改用 api 而不是 axios

    //         setData(response.data)
    //     }catch(err){
    //         // setError(err)
    //         setError(err.message || "Error fetching data");

    //     }
    //     setLoading(false);
    //    }
    //    fetchData()
    // },[url])

    if (!url) return;                                  // ADD: 沒有 url 不發請求
     const controller = new AbortController();          // ADD: 建立取消控制器
     setData([]);                                       // ADD: 切換 URL 先清空舊資料
     setError("");                                      // ADD
     setLoading(true);                                  // ADD

     const fetchData = async () => {
       try {
         const response = await api.get(url, { signal: controller.signal }); // CHANGE: 帶入 signal
         setData(response.data);
       } catch (err) {
         if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {  // ADD: 忽略被取消錯誤
           setError(err.message || "Error fetching data");
         }
       } finally {
         setLoading(false);
       }
     };

     fetchData();
     return () => controller.abort();                   // ADD: 卸載/URL變更時取消舊請求
   }, [url])                                            // 確保依賴只有 url

    return {data,loading, error}
}

export default useFetch

