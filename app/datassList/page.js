'use client'

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {

    const [datas, setDatas] = useState([])
    const getAuthToken = async () => {
        try {
            const { data } = await axios.post('http://localhost:3000/api/getdrivedata', {
                Title: window.localStorage.getItem('refresh_token')
            })
            setDatas(data?.topics)
        } catch (error) {
            console.log("🚀 ~ getAuthToken ~ error:", error)
        }
    }

    useEffect(() => {
        getAuthToken()
    }, [])
    return (
        <>
            {
                datas?.map((data, index) => {
                    return (
                        <>
                            <div key={index}>{data.id}  ............ {data.name}</div>
                        </>
                    )
                })
            }
        </>
    );
}
