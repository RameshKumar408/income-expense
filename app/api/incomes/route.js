// import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { Title, Amount, Type, Date, TimeStamp } = await request.json();
    // await connectMongoDB();
    await Income.create({ Title, Amount, Type, Date, TimeStamp });
    return NextResponse.json({ message: "Topic Created", status: true }, { status: 200 });
}

export async function GET() {
    // await connectMongoDB();
    const topics = await Income.find();
    return NextResponse.json({ topics });
}

export async function DELETE(request) {
    const id = request.nextUrl.searchParams.get("id");
    // await connectMongoDB();
    await Income.findByIdAndDelete(id);
    return NextResponse.json({ message: "Topic deleted" }, { status: 200 });
}