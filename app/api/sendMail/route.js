import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";

import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';

export async function POST(request) {
    const { From, To } = await request.json();
    await connectMongoDB();
    const respss = await Income.find({
        TimeStamp: {
            $gte: From, // Greater than or equal to 18
            $lte: To
        }
    }, { _id: 0, Title: 1, Amount: 1, Type: 1, Date: 1 }).sort({ TimeStamp: 1 });
    if (respss?.length > 0) {
        var resps = JSON.stringify(respss)
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(JSON.parse(resps));
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Generate buffer from workbook
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // Set up nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: process.env.HOST, // Replace with your SMTP server
            port: process.env.PORT, // Replace with your SMTP port
            auth: {
                user: process.env.USER, // Replace with your email
                pass: process.env.PASS, // Replace with your email password
            },
        });

        // Send email with attachment
        const mailOptions = {
            from: 'ckramesh0006@gmail.com',
            to: 'kathiresan6435@gmail.com',
            subject: 'Excel File Attachment',
            text: 'Please find the attached Excel file.',
            attachments: [
                {
                    filename: 'data.xlsx',
                    content: buffer,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            ],
        };

        try {
            await transporter.sendMail(mailOptions);
            return NextResponse.json({ message: 'Email sent successfully!' });
        } catch (error) {
            return NextResponse.json({ error: 'Error sending email: ' + error.message });
        }

        return response;
    }
}