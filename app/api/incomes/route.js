import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";
import { validateToken } from "../validateToken";
import { headers } from 'next/headers';

export async function POST(request) {
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        const { Title, Amount, Type, Date, TimeStamp } = await request.json();
        await connectMongoDB();
        await Income.create({ Title, Amount, Type, Date, TimeStamp, User_id: user?.userId });
        return NextResponse.json({ message: "Topic Created", status: true }, { status: 200 });
    } else {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 400 });
    }

}

export async function GET() {
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        await connectMongoDB();
        const topics = await Income.find({ User_id: user?.userId });
        return NextResponse.json({ topics });
    } else {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 400 });
    }

}

export async function DELETE(request) {
    const id = request.nextUrl.searchParams.get("id");
    await connectMongoDB();
    await Income.findByIdAndDelete(id);
    return NextResponse.json({ message: "Topic deleted" }, { status: 200 });
}