'use client'

import { useEffect } from "react";
import axios from "axios";

export default function Home() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const scope = url.searchParams.get('scope');
    const clientId = '389689030947-ptjknqqo8at8ge4panv2juqadffofrdk.apps.googleusercontent.com'
    const client_secret = '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'
    console.log(code, scope);

    const getAuthToken = async () => {
        try {
            const { data } = await axios.post('https://oauth2.googleapis.com/token', {
                code: code,
                redirect_uri: 'http://localhost:3000/authtoken',
                client_id: clientId,
                client_secret: client_secret,
                scope: '',
                grant_type: 'authorization_code'
            })
            window.localStorage.setItem('access_token', data.access_token)
            window.localStorage.setItem('refresh_token', data.refresh_token)
            window.location.href = '/datassList'
        } catch (error) {
            console.log("🚀 ~ getAuthToken ~ error:", error)
        }
    }

    useEffect(() => {
        console.log(code, scope, "scope")
        if (code) {
            getAuthToken()
        }
    }, [code, scope])
    return (
        <>
            <div>ramesh</div>
        </>
    );
}
