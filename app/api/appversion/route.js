import connectMongoDB from "../../../libs/mongodb";
import Versions from "../../../modules/appversion";
import { NextResponse } from "next/server";
import { validateToken } from "../validateToken";
import { headers } from 'next/headers';

export async function POST(request) {
    const { Version, Link } = await request.json();
    if (!Version) {
        return NextResponse.json({ message: "Please Enter Version", status: false }, { status: 400 });
    } else if (!Link) {
        return NextResponse.json({ message: "Please Enter Link", status: false }, { status: 400 });
    } else {
        console.log(Link, "Link")
        await connectMongoDB();
        const topics = await Versions.findOne({});
        if (topics) {
            console.log(Link, "Link")
            var logs = { Version: Version, Link: Link }
            console.log("🚀 ~ POST ~ logs:", logs)
            await Versions.findOneAndUpdate({ _id: topics._id }, logs);
            return NextResponse.json({ message: "Version Updated", status: true }, { status: 200 });
        } else {
            console.log({ Version: Version, Link: Link }, "{ Version: Version, Link: Link }")
            var datas = await Versions.create({ Version: Version, Link: Link });
            return NextResponse.json({ message: "Version Created", result: datas, status: true }, { status: 200 });
        }
    }
}

export async function GET() {
    await connectMongoDB();
    const topics = await Versions.findOne({});
    console.log("🚀 ~ GET ~ topics:", topics)
    return NextResponse.json({ topics });
}
