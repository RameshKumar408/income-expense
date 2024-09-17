'use client'

import { useEffect } from "react";
import axios from "axios";
import constant from "@/constant";

export default function Home() {

    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID
    const client_secret = process.env.NEXT_PUBLIC_CLIENT_SECRET

    const getAuthToken = async (code) => {
        try {
            const { data } = await axios.post('https://oauth2.googleapis.com/token', {
                code: code,
                redirect_uri: 'http://localhost:3000/authtoken',
                client_id: clientId,
                client_secret: client_secret,
                scope: '',
                grant_type: 'authorization_code'
            })
            if (data) {
                const res = await fetch(`${constant?.Live_url}/api/googleDrive/apikeys`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": window.localStorage.getItem("token")
                    },
                    body: JSON.stringify({
                        refreshtoken: data.refresh_token,
                        token: data.access_token
                    })
                });
                window.location.href = '/datassList'
            }

        } catch (error) {
            console.log("🚀 ~ getAuthToken ~ error:", error)
        }
    }

    const autht = async () => {
        try {
            const url = new URL(window.location.href);
            const code = url.searchParams.get('code');
            if (code) {
                getAuthToken(code)
            }
        } catch (error) {
            console.log("🚀 ~ autht ~ error:", error)
        }
    }

    useEffect(() => {
        autht()
    }, [])
    return (
        <>
            <div>ramesh</div>
        </>
    );
}
