import React, { useEffect, useState } from 'react'
import axios from "axios"

// 修正 for vercel
import { api } from "../api"; // 引入我們在 api.js 定義好的 axios instance


 const useFetch = (url) => {
    const [data, setData]=useState([]);
    const [loading,setLoading]=useState(false);
    const [error, setError] =useState("");

    useEffect(()=>{
       const fetchData =async()=>{ 
        setLoading(true);
        try{
            // const response = await axios.get(url)
            const response = await api.get(url); // 這裡改用 api 而不是 axios

            setData(response.data)
        }catch(err){
            // setError(err)
            setError(err.message || "Error fetching data");

        }
        setLoading(false);
       }
       fetchData()
    },[url])
    return {data,loading, error}
}

export default useFetch

