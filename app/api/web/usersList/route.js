import connectMongoDB from "../../../../libs/mongodb";
import Users from "../../../../modules/users";
import { NextResponse } from "next/server";
import { validateToken } from "../../validateToken";
import { headers } from 'next/headers';



export async function GET() {
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        if (user?.email == 'admin@admin.com') {
            await connectMongoDB();
            const topics = await Users.find({});
            return NextResponse.json({ result: topics });
        } else {
            return NextResponse.json({ message: "UnAuthorized" }, { status: 400 });
        }

    } else {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 400 });
    }
}