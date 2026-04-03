"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";

export async function signInWithGoogle() {
  try {
    await signIn("google", { redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=oauth");
    }
    throw error;
  }
}

export async function signInWithGitHub() {
  try {
    await signIn("github", { redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=oauth");
    }
    throw error;
  }
}

export async function signInWithCredentials(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=credentials");
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
