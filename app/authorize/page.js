"use client"

import constant from "@/constant"
import { useEffect } from "react"
import { useLoader } from '@/app/context/LoaderContext'

export default function Home() {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID
    const { showLoader, hideLoader } = useLoader()

    const getAuth = async () => {
        var url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:3000/authtoken&prompt=consent&response_type=code&client_id=${clientId}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&access_type=offline`
        window.location.replace(url)
    }

    const getAuths = async () => {
        try {
            showLoader()
            const res = await fetch(`${constant?.Live_url}/api/googleDrive/apikeys`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                    "authorization": window.localStorage.getItem("token")
                },
            });
            if (res?.status == 200) {
                var sts = await res.json()
                if (sts?.result) {
                    window.location.href = '/datassList'
                }
            }
        } catch (error) {
            console.log("🚀 ~ getAuths ~ error:", error)
        } finally {
            hideLoader()
        }
    }

    useEffect(() => {
        getAuths()
    }, [])
    return (
        <button onClick={() => { getAuth() }} >
            GoogleLogin
        </button>
    )
}