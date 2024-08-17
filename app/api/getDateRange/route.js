import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";
import { validateToken } from "../validateToken";
import { headers } from 'next/headers';
import mongoose from "mongoose";

export async function POST(req) {
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        const { From, To, text } = await req?.json();
        console.log(text, "user?._id")
        await connectMongoDB();
        var resp
        if (text) {
            resp = await Income.find({
                User_id: user?.userId,
                Title: { $regex: text, $options: 'i' },
                TimeStamp: {
                    $gte: From, // Greater than or equal to 18
                    $lte: To
                }
            }).sort({ TimeStamp: 1 });
        } else {
            resp = await Income.find({
                User_id: user?.userId,
                TimeStamp: {
                    $gte: From, // Greater than or equal to 18
                    $lte: To
                }
            }).sort({ TimeStamp: 1 });
        }

        var payloads = [
            {
                $match: {
                    User_id: new mongoose.Types.ObjectId(user?.userId),
                }
            },
            {
                $match: {
                    TimeStamp: {
                        $gte: From, // Greater than or equal to 18
                        $lte: To
                    }
                }
            },
            {

                $group: {
                    _id: "$Type",
                    totalAmount: { $sum: "$Amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    type: "$_id",
                    totalAmount: 1,
                    count: 1
                }
            },
            {
                $group: {
                    _id: null,
                    income: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "Income"] }, "$totalAmount", 0]
                        }
                    },
                    expense: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "Expense"] }, "$totalAmount", 0]
                        }
                    },
                    incomeCount: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "Income"] }, "$count", 0]
                        }
                    },
                    expenseCount: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "Expense"] }, "$count", 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    netIncome: { $subtract: ["$income", "$expense"] },
                    totalIncome: "$income",
                    totalExpense: "$expense",
                    totalIncomeCount: "$incomeCount",
                    totalExpenseCount: "$expenseCount"
                }
            }
        ]
        if (text) {
            payloads = [{ $match: { Title: { $regex: text, $options: 'i' } } }, ...payloads]
        }
        const total = await Income.aggregate(payloads);
        return NextResponse.json({ topics: resp, totalCount: total }, { status: 200 });
    } else {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 400 });
    }
}