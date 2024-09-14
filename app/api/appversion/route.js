import connectMongoDB from "../../../libs/mongodb";
import Versions from "../../../modules/appversion";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { Version, link } = await request.json();
    if (!Version) {
        return NextResponse.json({ message: "Please Enter Version", status: false }, { status: 400 });
    } else if (!link) {
        return NextResponse.json({ message: "Please Enter link", status: false }, { status: 400 });
    } else {
        await connectMongoDB();
        const topics = await Versions.findOne({});
        if (topics) {
            var logs = { Version: Version, link: link }
            console.log("🚀 ~ POST ~ logs:", logs)
            await Versions.findOneAndUpdate({ _id: topics._id }, logs);
            return NextResponse.json({ message: "Version Updated", status: true }, { status: 200 });
        } else {
            console.log({ Version: Version, link: link }, "{ Version: Version, link: link }")
            var datas = await Versions.create({ Version: Version, link: link });
            return NextResponse.json({ message: "Version Created", result: datas, status: true }, { status: 200 });
        }
    }
}

export async function GET() {
    await connectMongoDB();
    const topics = await Versions.findOne({});
    return NextResponse.json({ topics });
}
