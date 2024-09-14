import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";
import { validateToken } from "../validateToken";
import { headers } from 'next/headers';

export async function POST(request) {
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        const { Title, Description, Amount, Type, Date, TimeStamp } = await request.json();
        if (!Title) {
            return NextResponse.json({ message: "Please Enter Title", status: false }, { status: 400 });
        } else if (!Amount) {
            return NextResponse.json({ message: "Please Enter Amount", status: false }, { status: 400 });
        } else if (!Type) {
            return NextResponse.json({ message: "Please Enter Type", status: false }, { status: 400 });
        } else if (!Date) {
            return NextResponse.json({ message: "Please Enter Date", status: false }, { status: 400 });
        } else if (!TimeStamp) {
            return NextResponse.json({ message: "Please Enter TimeStamp", status: false }, { status: 400 });
        } else {
            await connectMongoDB();
            await Income.create({ Title: Title?.trimEnd(), Amount, Type, Date, TimeStamp, User_id: user?.userId, Description });
            return NextResponse.json({ message: "Topic Created", status: true }, { status: 200 });
        }
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
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        const url = new URL(request.url);

        // Get the 'id' query parameter
        const id = url.searchParams.get('id');
        console.log("🚀 ~ DELETE ~ id:", id)
        await connectMongoDB();
        var search = await Income.findOne({ _id: id, User_id: user?.userId })
        if (search) {
            await Income.findOneAndDelete({ _id: id, User_id: user?.userId });
            return NextResponse.json({ message: "Topic deleted", status: true }, { status: 200 });
        } else {
            return NextResponse.json({ message: "Data Not Found", status: false }, { status: 400 });
        }
    } else {
        return NextResponse.json({ message: "UnAuthorized", status: false }, { status: 400 });
    }
}