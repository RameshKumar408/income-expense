const { google } = require('googleapis');
import { NextResponse } from "next/server";



export async function POST(request) {
    console.log("logsss")
    const { Title } = await request.json();
    const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET
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
        const res = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.folder'",
            fields: 'nextPageToken, files(id, name)',
        });
        const folders = res.data.files;

        return NextResponse.json({ topics: folders });
    } catch (error) {
        console.log("🚀 ~ getAllFiles ~ error:", error)
    }
}
