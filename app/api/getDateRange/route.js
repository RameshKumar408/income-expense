import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";


export async function POST(request) {
    const { From, To } = await request.json();
    await connectMongoDB();
    const resp = await Income.find({
        TimeStamp: {
            $gte: From, // Greater than or equal to 18
            $lte: To
        }
    });
    return NextResponse.json({ topics: resp }, { status: 200 });
}