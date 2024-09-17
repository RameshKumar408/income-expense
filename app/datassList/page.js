'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import constant from "@/constant";

export default function Home() {

    const [datas, setDatas] = useState([])
    const getAuthToken = async (id) => {
        try {
            const { data } = await axios.post(`${constant?.Live_url}/api/getdrivedata`, {
                Title: id
            })
            setDatas(data?.topics)
        } catch (error) {
            console.log("🚀 ~ getAuthToken ~ error:", error)
        }
    }

    const getDetaills = async () => {
        try {
            const res = await fetch(`${constant?.Live_url}/api/googleDrive/apikeys`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                    "authorization": window.localStorage.getItem("token")
                },
            });
            console.log(res, "res")
            if (res.status == 200) {
                var dts = await res.json()
                console.log("🚀 ~ getDetaills ~ dts:", dts?.result)
                getAuthToken(dts?.result?.refreshtoken)
            }

        } catch (error) {
            console.log("🚀 ~ getAuthToken ~ error:", error)
        }
    }

    useEffect(() => {
        getDetaills()
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
