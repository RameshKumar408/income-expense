
import Users from "../../../modules/users";
import { NextResponse } from "next/server";
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


export async function POST(request) {
    const { Email, Password } = await request.json();
    console.log("🚀 ~ POST ~ Email:", Email)
    const Already = await Users.findOne({ Email: Email }, { Email: 1, Password: 1, Name: 1 });
    console.log("🚀 ~ POST ~ Already:", Already)
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
