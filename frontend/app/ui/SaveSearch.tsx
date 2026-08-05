"use client";

import {FormEvent, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

import fetchApi, {ApiError} from "../lib/api/client";
import type {SavedSearch} from "../lib/api/types";
import {useAuth} from "./AuthContext";
import FormContainer from "./FormContainer";
import Input from "./Input";
import {OutlineButton} from "./OutlineButton";
import {PrimaryButton} from "./PrimaryButton";

export default function SaveSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wasSaved, setWasSaved] = useState(false);
    const {user} = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    function openForm() {
        setWasSaved(false);
        setError("");

        if (!user) {
            const query = searchParams.toString();
            const next = query ? `${pathname}?${query}` : pathname;
            router.push(`/login?next=${encodeURIComponent(next)}`);
            return;
        }

        setIsOpen(true);
    }

    function closeForm() {
        setIsOpen(false);
        setName("");
        setError("");
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Enter a name for this search.");
            return;
        }

        const params = Object.fromEntries(
            Array.from(searchParams.entries()).filter(
                ([key, value]) => key !== "page" && value !== "",
            ),
        );

        setError("");
        setIsSubmitting(true);

        try {
            await fetchApi<SavedSearch>("searches/", undefined, undefined, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name: trimmedName, params}),
            });
            setWasSaved(true);
            closeForm();
        } catch (requestError) {
            if (requestError instanceof ApiError && requestError.status === 401) {
                const query = searchParams.toString();
                const next = query ? `${pathname}?${query}` : pathname;
                router.push(`/login?next=${encodeURIComponent(next)}`);
                return;
            }
            setError("Could not save this search. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={openForm}
                disabled={user === undefined}
                className="flex items-center justify-center whitespace-nowrap rounded-full border border-white-500 bg-dark-primary px-2 text-sm text-primary hover:bg-[rgb(75,75,75)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="save-search-button"
            >
                {wasSaved ? "Saved" : "Save search"}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 px-4">
                    <form onSubmit={handleSubmit} className="w-full max-w-100">
                        <FormContainer className="min-h-0">
                            <h2 className="text-2xl font-bold">Save search</h2>
                            <Input
                                placeholder="Search name"
                                value={name}
                                isButton={false}
                                onChange={(event) => setName(event.target.value)}
                                className="rounded-lg"
                            />
                            {error && <p data-testid="saved-search-error" className="text-sm text-red-500">{error}</p>}
                            <div className="flex justify-end gap-3">
                                <OutlineButton onClick={closeForm}>Cancel</OutlineButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save"}
                                </PrimaryButton>
                            </div>
                        </FormContainer>
                    </form>
                </div>
            )}
        </>
    );
}
