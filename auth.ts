import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { getExpectedCredentials } from "@/lib/auth-credentials";
import { credentialsSchema } from "@/lib/credentials-schema";
import { isStudioAdminIdentity } from "@/lib/admin-config";

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
    jwt({ token, user }) {
      if (user) {
        if (user.image) {
          token.picture = user.image;
        } else {
          delete token.picture;
        }
        if (user.email) {
          token.email = user.email;
        } else {
          delete token.email;
        }
        if (user.name) {
          token.name = user.name;
        }
      }
      const email = (typeof token.email === "string" ? token.email : null) ?? null;
      const name = (typeof token.name === "string" ? token.name : null) ?? null;
      const id = (typeof token.sub === "string" ? token.sub : null) ?? null;
      token.role = isStudioAdminIdentity({ email, name, id }) ? "admin" : "user";
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.picture) {
          session.user.image = token.picture as string;
        } else {
          session.user.image = null;
        }
        if (token.email) {
          session.user.email = token.email as string;
        }
        session.user.role = token.role === "admin" ? "admin" : "user";
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
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
