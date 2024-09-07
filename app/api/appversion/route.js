import connectMongoDB from "../../../libs/mongodb";
import Versions from "../../../modules/appversion";
import { NextResponse } from "next/server";
import { validateToken } from "../validateToken";
import { headers } from 'next/headers';

export async function POST(request) {
    const { Version } = await request.json();
    if (!Version) {
        return NextResponse.json({ message: "Please Enter Version", status: false }, { status: 400 });
    } else {
        await connectMongoDB();
        const topics = await Versions.findOne({});
        if (topics) {
            await Versions.findOneAndUpdate({ _id: topics._id }, { Version });
            return NextResponse.json({ message: "Version Created", status: true }, { status: 200 });
        } else {
            await Versions.create({ Version: Version });
            return NextResponse.json({ message: "Version Updated", status: true }, { status: 200 });
        }
    }
}

export async function GET() {
    await connectMongoDB();
    const topics = await Versions.findOne({});
    console.log("🚀 ~ GET ~ topics:", topics)
    return NextResponse.json({ topics });
}
