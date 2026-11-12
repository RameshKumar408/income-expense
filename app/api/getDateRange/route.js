import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";
import { validateToken } from "../validateToken";
import { headers } from "next/headers";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const headerList = headers();
    const authHeader =
      req.headers.get("authorization") || headerList.get("authorization");

    const { success, user } = await validateToken(authHeader);

    if (!success || !user) {
      return NextResponse.json({ message: "UnAuthorized" }, { status: 401 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid JSON body", status: false },
        { status: 400 },
      );
    }

    const { From, To, text, id } = body || {};

    if (!From) {
      return NextResponse.json(
        { message: "Please Select From", status: false },
        { status: 400 },
      );
    }
    if (!To) {
      return NextResponse.json(
        { message: "Please Select To", status: false },
        { status: 400 },
      );
    }

    const fromNum = Number(From);
    const toNum = Number(To);

    if (isNaN(fromNum) || isNaN(toNum)) {
      return NextResponse.json(
        { message: "Invalid From or To timestamps", status: false },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // Determine target User_id
    let targetUserId = null;
    if (user?.email === "admin@admin.com") {
      targetUserId = id ? id : user?.userId;
    } else {
      targetUserId = user?.userId;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { message: "User ID required", topics: [], totalCount: [] },
        { status: 200 },
      );
    }

    // Validate ObjectId before casting to prevent BSONError crashes
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { message: "Invalid User ID format", topics: [], totalCount: [] },
        { status: 400 },
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(targetUserId);

    // Build query filter
    const query = {
      User_id: userObjectId,
      TimeStamp: {
        $gte: fromNum,
        $lte: toNum,
      },
    };

    const trimmedText = typeof text === "string" ? text.trim() : "";
    if (trimmedText) {
      const escapedText = trimmedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = { $regex: escapedText, $options: "i" };
      query.$or = [{ Title: searchRegex }, { Description: searchRegex }];
    }

    const resp = await Income.find(query).sort({ TimeStamp: -1 }).lean();

    // Aggregation pipeline for totals
    const matchStages = [
      { User_id: userObjectId },
      { TimeStamp: { $gte: fromNum, $lte: toNum } },
    ];

    if (trimmedText) {
      const escapedText = trimmedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = { $regex: escapedText, $options: "i" };
      matchStages.push({
        $or: [{ Title: searchRegex }, { Description: searchRegex }],
      });
    }

    const payloads = [
      {
        $match: {
          $and: matchStages,
        },
      },
      {
        $group: {
          _id: "$Type",
          totalAmount: { $sum: "$Amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          totalAmount: 1,
          count: 1,
        },
      },
      {
        $group: {
          _id: null,
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "Income"] }, "$totalAmount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "Expense"] }, "$totalAmount", 0],
            },
          },
          incomeCount: {
            $sum: {
              $cond: [{ $eq: ["$type", "Income"] }, "$count", 0],
            },
          },
          expenseCount: {
            $sum: {
              $cond: [{ $eq: ["$type", "Expense"] }, "$count", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          netIncome: { $subtract: ["$income", "$expense"] },
          totalIncome: "$income",
          totalExpense: "$expense",
          totalIncomeCount: "$incomeCount",
          totalExpenseCount: "$expenseCount",
        },
      },
    ];

    const total = await Income.aggregate(payloads);

    return NextResponse.json(
      { topics: resp, totalCount: total },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in POST /api/getDateRange:", error);
    return NextResponse.json(
      {
        message: error?.message || "Internal Server Error",
        topics: [],
        totalCount: [],
      },
      { status: 500 },
    );
  }
}
