import connectMongoDB from "../../../libs/mongodb";
import Userss from "../../../modules/users";
import { NextResponse } from "next/server";
const bcrypt = require('bcryptjs');

export async function POST(request) {
    const { email, password } = await request.json();
    if (!email) {
        return NextResponse.json({ message: "Please Enter email", status: false }, { status: 400 });
    } else if (!password) {
        return NextResponse.json({ message: "Please Enter password", status: false }, { status: 400 });
    } else {
        await connectMongoDB();
        const Users = await Userss.findOne({ Email: email });
        if (Users) {
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);

            // Hash the password
            const hashedPassword = bcrypt.hashSync(password, salt);
            var logs = { Password: hashedPassword }
            await Userss.findOneAndUpdate({ _id: Users._id }, logs);
            return NextResponse.json({ message: "Updated Successfully", status: true }, { status: 200 });
        } else {
            return NextResponse.json({ message: "User Not Found", status: false }, { status: 400 });
        }
    }
}