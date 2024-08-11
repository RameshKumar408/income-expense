import connectMongoDB from "../../../libs/mongodb";
import Income from "../../../modules/income";
import { NextResponse } from "next/server";


export async function POST(request) {
    const { Id } = await request.json();
    await connectMongoDB();
    const topics = await Income.findOne({ _id: Id });
    return NextResponse.json({ topics }, { status: 200 });
}

export async function PUT(request) {
    const { Id, Title, Amount, Type, Date } = await request.json();
    await connectMongoDB();
    await Income.findOneAndUpdate({ _id: Id }, { Title, Amount, Type, Date });
    return NextResponse.json({ message: "Updated Successfully" }, { status: 200 });
}