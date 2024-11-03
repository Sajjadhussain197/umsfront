import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	async function middleware(req: NextRequestWithAuth) {
		const pathname = req.nextUrl?.pathname;
		const role = req.nextauth.token?.role;
		console.log(req.nextauth);

		// Redirect to login if no valid session
		if (!role) {
			return NextResponse.redirect(new URL("/login", req.url));
		}

		// Restrict access based on role
		if (pathname.includes("/admin") && role !== "admin") {
			return NextResponse.redirect(new URL("/user", req.url));
		}

		if (pathname.includes("/user") && role !== "user") {
			return NextResponse.redirect(new URL("/admin/dashboard", req.url));
		}

		return NextResponse.next();
	},
	{
		secret: process.env.NEXTAUTH_SECRET,
		callbacks: {
			authorized: (params) => {
				const { token } = params;
				return !!token; // Ensure token exists for authorization
			},
		},
	}
);

export const config = {
	matcher: ["/user/:path*", "/admin/:path*"],
};

// Ensure to include toast container in your main component
