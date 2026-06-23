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
        const query = user?.email == "admin@admin.com"
            ? { _id: Id }
            : { _id: Id, User_id: user?.userId };
        const topics = await Income.findOne(query);
        if (!topics) {
            return NextResponse.json({ message: "Record Not Found" }, { status: 404 });
        }
        return NextResponse.json({ topics }, { status: 200 });
    } else {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 401 });
    }
}

export async function PUT(request) {
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        const { Id, Title, Amount, Type, Date, TimeStamp, Description } = await request.json();
        await connectMongoDB();
        const query = user?.email == "admin@admin.com"
            ? { _id: Id }
            : { _id: Id, User_id: user?.userId };
        const topics = await Income.findOneAndUpdate(
            query,
            { Title, Amount, Type, Date, TimeStamp, Description },
            { new: true }
        );
        if (!topics) {
            return NextResponse.json({ message: "Record Not Found", status: false }, { status: 404 });
        }
        return NextResponse.json({ message: "Updated Successfully", status: true }, { status: 200 });
    } else {
        return NextResponse.json({ message: "UnAuthorized", status: false }, { status: 401 });
    }
}
