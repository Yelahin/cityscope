"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import fetchApi, {ApiError, fetchAllPages} from "../lib/api/client";
import type {Place, SavedSearch, User} from "../lib/api/types";
import Spinner from "../ui/Spinner";

function getSearchQuery(params: SavedSearch["params"]) {
    let parsed: Record<string, unknown>;
    try {
        parsed = typeof params === "string" ? JSON.parse(params) : params;
    } catch {
        return "";
    }
    if (!parsed || Array.isArray(parsed)) return "";

    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(parsed)) {
        if (["string", "number", "boolean"].includes(typeof value)) {
            query.set(key, String(value));
        }
    }
    return query.toString();
}

export default function ProfileClient () {
    const [user, setUser] = useState<User | null>(null);
    const [favorites, setFavorites] = useState<Place[]>([]);
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        async function loadProfile() {
            try {
                const currentUser = await fetchApi<User>("me/");
                const [favoritePlaces, savedSearches] = await Promise.all([
                    fetchAllPages<Place>("places/favorite/"),
                    fetchAllPages<SavedSearch>("searches/"),
                ]);
                setUser(currentUser);
                setFavorites(favoritePlaces);
                setSearches(savedSearches);
            } catch (requestError) {
                if (requestError instanceof ApiError && requestError.status === 401) {
                    router.replace("/login?next=/profile");
                    return;
                }
                setError("Could not load your profile.");
            }
        }

        loadProfile();
    }, [router]);

    async function removeFavorite(place: Place) {
        try {
            await fetchApi(`places/${place.id}/favorite/`, undefined, undefined, {method: "DELETE"});
            setFavorites((current) => current.filter((item) => item.id !== place.id));
        } catch (requestError) {
            if (requestError instanceof ApiError && requestError.status === 401) {
                router.replace("/login?next=/profile");
                return;
            }
            setError("Could not remove this favorite.");
        }
    }

    async function deleteSearch(search: SavedSearch) {
        try {
            await fetchApi(`searches/${search.id}/`, undefined, undefined, {method: "DELETE"});
            setSearches((current) => current.filter((item) => item.id !== search.id));
        } catch (requestError) {
            if (requestError instanceof ApiError && requestError.status === 401) {
                router.replace("/login?next=/profile");
                return;
            }
            setError("Could not delete this saved search.");
        }
    }

    if (error) return <p className="mx-auto max-w-5xl px-5 py-12 text-red-400">{error}</p>;
    if (!user) return <div className="flex h-main-content items-center justify-center"><Spinner /></div>;

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-8">
            <header>
                <h1 className="text-3xl font-bold">{user.username}&apos;s profile</h1>
                {user.email && <p className="text-gray-400">{user.email}</p>}
            </header>

            <section>
                <h2 className="mb-4 text-2xl font-semibold">Favorite places</h2>
                {favorites.length === 0 ? (
                    <p className="text-gray-400">You have no favorite places yet.</p>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {favorites.map((place) => (
                            <li key={place.id} className="rounded-xl border border-border-primary bg-neutral-900 p-4">
                                <Link href={`/places/${place.id}`} className="text-lg font-semibold hover:text-primary">
                                    {place.name}
                                </Link>
                                <p className="text-sm text-gray-400">{place.category.name} • {place.city.name}</p>
                                <p className="mt-1 text-sm text-gray-400">{place.address ?? "Address not available"}</p>
                                <button type="button" onClick={() => removeFavorite(place)} className="mt-3 text-sm text-red-400 hover:underline">
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 className="mb-4 text-2xl font-semibold">Saved searches</h2>
                {searches.length === 0 ? (
                    <p className="text-gray-400">You have no saved searches yet.</p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {searches.map((search) => (
                            <li key={search.id} className="flex items-center justify-between gap-4 rounded-xl border border-border-primary bg-neutral-900 p-4">
                                <Link href={`/?${getSearchQuery(search.params)}`} className="font-semibold hover:text-primary">
                                    {search.name}
                                </Link>
                                <button type="button" onClick={() => deleteSearch(search)} className="text-sm text-red-400 hover:underline">
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
