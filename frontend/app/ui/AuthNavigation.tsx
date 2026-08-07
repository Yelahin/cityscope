"use client";

import { useRouter } from "next/navigation";

import { OutlineButton } from "./OutlineButton";
import { PrimaryButtonLink } from "./PrimaryButton";
import { useAuth } from "./AuthContext";

export default function AuthNavigation() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  if (user === undefined) return null;

  if (user) {
    return (
      <>
        <PrimaryButtonLink href="/profile">Profile</PrimaryButtonLink>
        <OutlineButton onClick={handleLogout}>Logout</OutlineButton>
      </>
    );
  }

  return (
    <>
      <PrimaryButtonLink href="/sign-up">Sign Up</PrimaryButtonLink>
      <PrimaryButtonLink href="/login">Login</PrimaryButtonLink>
    </>
  );
}
