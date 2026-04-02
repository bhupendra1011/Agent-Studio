"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";

export async function signInWithCredentials(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/?error=credentials");
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
