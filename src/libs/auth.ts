import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		accessToken: string;
		refreshToken: string;
		user: {
			id: string;
			name: string;
			email: string;
			role: string;
		};
	}

	interface User {
		access_token: string;
		refresh_token: string;
		id: string;
		name: string;
		email: string;
		role: string;
	}
}

export const authOptions: NextAuthOptions = {
	pages: {
		signIn: "/login",
	},
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
	},

	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "text", placeholder: "Jhondoe" },
				password: { label: "Password", type: "password" },
				username: { label: "Username", type: "text", placeholder: "Jhon Doe" },
			},

			async authorize(credentials): Promise<any> {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Please enter an email or password");
				}

				const res = await fetch(
					`http://localhost:8000/api/auth/users/login`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							email: credentials.email,
							password: credentials.password,
						}),
					}
				);
				const data = await res.json();
				console.log(data);

				if (!data || !data.success) {
					throw new Error("No user found");
				}

				const user = data.data.user;

				return {
					access_token: data.data.accessToken,
					refresh_token: data.data.refreshToken,
					id: user._id,
					name: user.fullName,
					email: user.email,
					role: user.role,
				};
			},
		}),
	],

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.accessToken = user.access_token;
				token.refreshToken = user.refresh_token;
				token.role = user.role;
			}
			return token;
		},

		async session({ session, token }) {
			if (session?.user) {
				session.accessToken = token.accessToken as string;
				session.refreshToken = token.refreshToken as string;
				session.user.role = token.role;
			}
			return session;
		},
	},
};

export const getAuthSession = async () => {
	return getServerSession(authOptions);
};

// Function to fetch subscription status
async function fetchSubscriptionStatus(accessToken: string) {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND}/api/billing_status`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`, // Use appropriate authorization method
		},
	});

	if (!res.ok) {
		throw new Error("Failed to fetch subscription status");
	}

	const data = await res.json();
	console.log("Subscription Status:", data);
	return data;
}
