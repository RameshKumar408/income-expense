// pages/api/upload.js

const { google } = require('googleapis');
import { NextResponse } from "next/server";
const path = require('path');


export async function POST(request) {
    try {
        // Parse the form data
        const formData = await request.formData();
        const file = formData.get('file'); // Assuming your input name is "image"
        const name = formData.get('name')
        const Title = formData.get('Title')
        const folderId = formData.get('folderId')
        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
        }

        // Create a path for the uploaded file
        const uploadPath = path.join('public', 'uploads', file.name);

        // Convert the file to a buffer and save it
        const buffer = Buffer.from(await file.arrayBuffer());

        // Ensure the uploads directory exists
        const fs = require('fs');
        fs.mkdirSync(path.join('./public', 'uploads'), { recursive: true });

        // Write the file to the server
        fs.writeFileSync(uploadPath, buffer);

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
        const filename = `${name}.${file.name.split('.')[1]}`;
        console.log("🚀 ~ POST ~ filename:", filename)
        var fileMetaData = {
            name: filename,
            parents: [folderId] // A folder ID to which file will get uploaded
        }

        await drive.files.create({
            resource: fileMetaData,
            media: {
                body: fs.createReadStream(uploadPath), // files that will get uploaded
                mimeType: file?.type
            },
            fields: 'id'
        })
        setTimeout(() => {
            fs.unlinkSync(uploadPath);
        }, 2000);
        // Respond with a success message
        return new Response(JSON.stringify({ message: 'File uploaded successfully' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'An error occurred during file upload' }), { status: 500 });
    }
}
