"use client";

import {FormEvent, useState} from "react";

import fetchApi, {ApiError} from "../lib/api/client";
import FormContainer from "../ui/FormContainer";
import Input from "../ui/Input";
import {PrimaryButton} from "../ui/PrimaryButton";

export default function LoginClient() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await fetchApi("token/", undefined, undefined, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password}),
            });
            const next = new URLSearchParams(window.location.search).get("next");
            const destination = next?.startsWith("/") && !next.startsWith("//")
                ? next
                : "/profile";
            window.location.assign(destination);
        } catch (requestError) {
            if (requestError instanceof ApiError && requestError.status === 401) {
                setError("Invalid username or password.");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex h-main-content w-full items-center justify-center px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-100">
                <FormContainer>
                    <h1 className="text-2xl font-bold">Login</h1>
                    <Input
                        placeholder="Username"
                        value={username}
                        isButton={false}
                        onChange={(event) => setUsername(event.target.value)}
                        className="rounded-lg"
                    />
                    <Input
                        placeholder="Password"
                        value={password}
                        isButton={false}
                        onChange={(event) => setPassword(event.target.value)}
                        className="rounded-lg"
                        type="password"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <PrimaryButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Logging in..." : "Login"}
                    </PrimaryButton>
                </FormContainer>
            </form>
        </div>
    );
}
