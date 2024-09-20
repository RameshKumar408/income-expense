const { google } = require('googleapis');
import { NextResponse } from "next/server";



export async function POST(request) {
    console.log("logsss")
    const { Title, id } = await request.json();
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
        await drive.files.delete({
            fileId: id
        });

        return NextResponse.json({ topics: "deleted successfully" });
    } catch (error) {
        console.log("🚀 ~ getAllFiles ~ error:", error)
    }
}
