"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

import fetchApi, {ApiError} from "../lib/api/client";
import type {User} from "../lib/api/types";
import {OutlineButton} from "./OutlineButton";
import {PrimaryButtonLink} from "./PrimaryButton";

export default function AuthNavigation() {
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const router = useRouter();

    useEffect(() => {
        fetchApi<User>("me/")
            .then(setUser)
            .catch((error) => {
                if (error instanceof ApiError && error.status === 401) {
                    setUser(null);
                    return;
                }
                setUser(null);
            });
    }, []);

    async function handleLogout() {
        await fetchApi("logout/", {method: "POST"});
        setUser(null);
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
