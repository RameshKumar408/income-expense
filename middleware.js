import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export function middleware(request) {
    console.log("middleware")
    const headerList = headers()
    const token = headerList.get("authorization")
    console.log(request.url, typeof (token), "url")
    if (token && token != "null") {
        console.log("inside next")
        return NextResponse.next();
    } else {
        console.log("inside middle")
        return NextResponse.json({ message: "UnAuthorized" }, { status: 400 });
    }
}

export const config = {
    matcher: ['/api/getDateRange', '/api/export', '/api/incomes', '/api/sendMail', '/api/getelementid'], // Protect the dashboard routes
};