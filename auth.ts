import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getExpectedCredentials } from "@/lib/auth-credentials";
import { credentialsSchema } from "@/lib/credentials-schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/api/auth")) return true;
      if (pathname.startsWith("/dashboard")) return !!auth?.user;
      return true;
    },
  },
  providers: [
    Credentials({
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "your-username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "••••••••",
        },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse({
          username: credentials?.username,
          password: credentials?.password,
        });

        if (!parsed.success) {
          return null;
        }

        const { username, password } = parsed.data;
        const expected = getExpectedCredentials();

        if (!expected) {
          return null;
        }

        if (username !== expected.username || password !== expected.password) {
          return null;
        }

        return {
          id: username,
          name: username,
        };
      },
    }),
  ],
});
