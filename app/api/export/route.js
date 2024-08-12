import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";

import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';

export async function POST(request) {
    const { From, To } = await request.json();
    await connectMongoDB();
    const resp = await Income.find({
        TimeStamp: {
            $gte: From, // Greater than or equal to 18
            $lte: To
        }
    }, { _id: 0, Title: 1, Amount: 1, Type: 1, Date: 1 }).sort({ TimeStamp: 1 });
    if (resp?.length > 0) {
        var data = [
            { Title: 'Egg', Amount: 85, Type: 'Expense', Date: '2024-08-01' },
            {
                Title: 'Pre month savings',
                Amount: 13863,
                Type: 'Income',
                Date: '2024-08-01'
            },
            {
                Title: 'Ramesh recharge ',
                Amount: 579,
                Type: 'Expense',
                Date: '2024-08-03'
            },
            {
                Title: 'Mugunth hospital ',
                Amount: 178,
                Type: 'Expense',
                Date: '2024-08-03'
            },
            { Title: 'Oil', Amount: 712, Type: 'Expense', Date: '2024-08-03' },
            { Title: 'Anbu', Amount: 1500, Type: 'Income', Date: '2024-08-05' },
            {
                Title: 'Salary',
                Amount: 20000,
                Type: 'Income',
                Date: '2024-08-05'
            },
            { Title: 'Pandu', Amount: 300, Type: 'Expense', Date: '2024-08-05' },
            {
                Title: 'Antony food',
                Amount: 260,
                Type: 'Income',
                Date: '2024-08-06'
            },
            {
                Title: 'Jkans antony food',
                Amount: 581,
                Type: 'Expense',
                Date: '2024-08-06'
            },
            { Title: 'Rusk', Amount: 35, Type: 'Expense', Date: '2024-08-07' },
            {
                Title: 'Office gift',
                Amount: 100,
                Type: 'Expense',
                Date: '2024-08-08'
            },
            { Title: 'Sip', Amount: 2000, Type: 'Expense', Date: '2024-08-09' },
            {
                Title: 'Pani puri',
                Amount: 35,
                Type: 'Expense',
                Date: '2024-08-10'
            },
            {
                Title: 'Sasi and me food',
                Amount: 450,
                Type: 'Expense',
                Date: '2024-08-10'
            },
            {
                Title: 'Sasi extra amount 1700',
                Amount: 500,
                Type: 'Expense',
                Date: '2024-08-10'
            },
            {
                Title: 'Bike hypothecation termination ',
                Amount: 275,
                Type: 'Expense',
                Date: '2024-08-11'
            },
            {
                Title: 'Kulfi and KFC with friends ',
                Amount: 440,
                Type: 'Expense',
                Date: '2024-08-11'
            },
            { Title: 'Egg', Amount: 100, Type: 'Expense', Date: '2024-08-12' }
        ]
        console.log("🚀 ~ POST ~ resp:", resp)
        var resps = resp
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(resps);
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