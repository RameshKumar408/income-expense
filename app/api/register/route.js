import connectMongoDB from "../../../libs/mongodb";
import Users from "../../../modules/users";
import { NextResponse } from "next/server";
const bcrypt = require('bcryptjs');

export async function POST(request) {
    const { Name, Email, Password } = await request.json();
    console.log("🚀 ~ POST ~ Name:", Name)
    if (!Name) {
        return NextResponse.json({ message: "Please Enter Name", status: false }, { status: 200 });
    } else if (!Email) {
        return NextResponse.json({ message: "Please Enter Email", status: false }, { status: 200 });
    } else if (!Password) {
        return NextResponse.json({ message: "Please Enter Password", status: false }, { status: 200 });
    } else {
        console.log("🚀 ~ POST ~ Email:", Email)
        await connectMongoDB();
        const Already = await Users.findOne({ Email: Email });
        console.log("🚀 ~ POST ~ Already:", Already)
        if (Already) {
            return NextResponse.json({ message: "Email Already Exist", status: false }, { status: 200 });
        } else {
            // Generate a salt
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);

            // Hash the password
            const hashedPassword = bcrypt.hashSync(Password, salt);

            await Users.create({ Name, Email, Password: hashedPassword });
            return NextResponse.json({ message: "Register Successfully", status: true }, { status: 200 });
        }
    }

}
