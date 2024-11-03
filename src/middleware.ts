import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	async function middleware(req: NextRequestWithAuth) {
		const pathname = req.nextUrl?.pathname;
		const role = req.nextauth.token?.role;
		
		// Log the token information for debugging
		console.log("Token Info:", {
			role
		});

		if (typeof role === "undefined") {
			console.log("Role is undefined, proceeding to next response.");
			return NextResponse.next();
		}

		// Redirect to login if no valid role is found
		if (!role) {
			console.log("No valid role found, redirecting to login.");
			return NextResponse.redirect(new URL("/login", req.url));
		}

		// Role-based routing
		if (pathname.includes("/admin") && role !== "admin") {
			console.log("Non-admin role trying to access admin, redirecting to /user.");
			return NextResponse.redirect(new URL("/user", req.url));
		}

		if (pathname.includes("/user") && role !== "user") {
			console.log("Non-user role trying to access user, redirecting to /admin.");
			return NextResponse.redirect(new URL("/admin/dashboard", req.url));
		}

		// Allow access to /user if subscribed and billing status is valid
		if (pathname.includes("/user") ) {
		
				return NextResponse.next();
		
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: (params) => {
				const { token } = params;
				console.log("Authorization check, token exists:", !!token);
				return !!token; // Ensure token exists for authorization
			},
		},
	}
);

export const config = {
	matcher: ["/user/:path*", "/admin/:path*"],
};
