import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";
import { validateToken } from "../validateToken";
import { headers } from 'next/headers';

export async function POST(request) {
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        const { Id } = await request.json();
        await connectMongoDB();
        const topics = await Income.findOne({ _id: Id, User_id: user?.userId });
        return NextResponse.json({ topics }, { status: 200 });
    } else {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 400 });
    }
}

export async function PUT(request) {
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        const { Id, Title, Amount, Type, Date, TimeStamp, Description } = await request.json();
        await connectMongoDB();
        await Income.findOneAndUpdate({ _id: Id, User_id: user?.userId }, { Title, Amount, Type, Date, TimeStamp, Description });
        return NextResponse.json({ message: "Updated Successfully", status: true }, { status: 200 });
    } else {
        return NextResponse.json({ message: "UnAuthorized", status: false }, { status: 400 });
    }
}