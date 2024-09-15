const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
import { NextResponse } from "next/server";



export async function POST(request) {
    console.log("logsss")
    const { Title } = await request.json();
    const CLIENT_ID = "389689030947-ptjknqqo8at8ge4panv2juqadffofrdk.apps.googleusercontent.com"
    const CLIENT_SECRET = "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"
    const REDIRECT_URI = "http://localhost:3000/authtoken"
    const REFRESH_TOKEN = Title
    // const REFRESH_TOKEN = window.localStorage.getItem('refresh_token')

    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI// Add this scope
    );

    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client
    });

    try {
        const response = await drive.files.list({
            pageSize: 10,
            fields: "nextPageToken, files(id, name)"
        })
        return NextResponse.json({ topics: response.data.files });
    } catch (error) {
        console.log("🚀 ~ getAllFiles ~ error:", error)
    }
}
