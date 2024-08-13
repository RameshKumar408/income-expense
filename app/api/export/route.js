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
        // Set the response headers to indicate a file download
        const response = new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="income_data.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });

        return response;
    }
}