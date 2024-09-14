import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export function middleware(request) {
    console.log("middleware")
    const headerList = headers()
    const token = headerList.get("authorization")
    if (token && token != "null") {
        return NextResponse.next();
    } else {
        return NextResponse.json({ message: "UnAuthorized" }, { status: 400 });
    }
}

export const config = {
    matcher: ['/api/getDateRange', '/api/export', '/api/incomes', '/api/sendMail', '/api/getelementid', '/api/incomes/:path*'], // Protect the dashboard routes
};