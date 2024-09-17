import connectMongoDB from "../../../../libs/mongodb";
import GoogleApi from "../../../../modules/googleApi";
import { NextResponse } from "next/server";
import { validateToken } from "../../validateToken";
import { headers } from 'next/headers';

export async function POST(request) {
    const headerList = headers()
    var { success, user } = await validateToken(headerList.get("authorization"))
    if (success) {
        const { refreshtoken, token } = await request.json();
        await connectMongoDB();

        var already = await GoogleApi.findOne({});
        console.log("🚀 ~ POST ~ already:", already)
        if (already) {
            await GoogleApi.findOneAndUpdate({ _id: already._id }, { refreshtoken, token });
            return NextResponse.json({ message: "Updated Successfully", status: true }, { status: 200 });
        } else {

            await GoogleApi.create({ refreshtoken, token });
            return NextResponse.json({ message: "Uploaded Successfully", status: true }, { status: 200 });
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
        const topics = await GoogleApi.findOne({});
        return NextResponse.json({ result: topics });
    } else {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 400 });
    }
}