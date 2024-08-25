
import Users from "../../../modules/users";
import { NextResponse } from "next/server";
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import connectMongoDB from "../../../libs/mongodb";

export async function POST(request) {
    await connectMongoDB();
    const { Email, Password } = await request?.json();
    if (!Email) {
        return NextResponse.json({ password: "Please Enter Email", status: false }, { status: 200 });
    } else if (!Password) {
        return NextResponse.json({ password: "Please Enter Password", status: false }, { status: 200 });
    } else {
        const Already = await Users.findOne({ Email: Email }, { Email: 1, Password: 1, Name: 1 });
        if (Already) {
            const result = bcrypt.compareSync(Password, Already?.Password);
            if (result) {
                // Create a payload with the data you want to include in the token
                const payload = {
                    userId: Already?._id,
                    name: Already?.Name,
                    role: 'user',
                    email: Already?.Email
                };

                // Generate the token with a secret key
                const token = jwt.sign(payload, process.env.SECRET);
                console.log('Password is correct');

                return NextResponse.json({ message: "Login Successfully", result: token, status: true }, { status: 200 });
            } else {
                return NextResponse.json({ password: "Wrong Password", status: false }, { status: 200 });
            }

        } else {
            return NextResponse.json({ email: "Email Not Exist", status: false }, { status: 200 });

        }
    }

}
