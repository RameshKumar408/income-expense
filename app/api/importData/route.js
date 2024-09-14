import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";
import { validateToken } from "../validateToken";
import { headers } from 'next/headers';

export async function POST(request) {
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        const datas = await request.json();
        if (datas?.length == 0) {
            return NextResponse.json({ message: "Please Enter Data", status: false }, { status: 400 });
        } else {
            await connectMongoDB();
            for (let i = 0; i < datas?.length; i++) {
                const element = datas[i];
                var already = await Income.findOne({ TimeStamp: element?.TimeStamp, Title: element?.Title, User_id: user?.userId, Amount: element?.Amount, Type: element?.Type });
                if (already) {
                    continue;
                } else {
                    const { Title, Description, Amount, Type, Date, TimeStamp } = element;
                    await Income.create({ Title, Amount, Type, Date, TimeStamp, User_id: user?.userId, Description });
                }
            }
            return NextResponse.json({ message: "Uploaded Successfully", status: true }, { status: 200 });
        }
    } else {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 400 });
    }
}