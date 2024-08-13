// import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";


export async function POST(request) {
    const { From, To } = await request.json();
    // await connectMongoDB();
    const resp = await Income.find({
        TimeStamp: {
            $gte: From, // Greater than or equal to 18
            $lte: To
        }
    }).sort({ TimeStamp: 1 });
    const total = await Income.aggregate([
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
    ]);
    return NextResponse.json({ topics: resp, totalCount: total }, { status: 200 });
}