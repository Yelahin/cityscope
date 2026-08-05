"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoHeart, IoHeartOutline } from "react-icons/io5";

import fetchApi, { ApiError } from "../../lib/api/client";
import type { Place, User } from "../../lib/api/types";
import Spinner from "../../ui/Spinner";
import StarRating from "../../ui/StarRatings";

const PlaceMap = dynamic(() => import("../../ui/PlaceMap"), { ssr: false });

export default function PlaceDetailsClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [href] = useState(() => {
    if (typeof window === "undefined") return "/";
    return sessionStorage.getItem("lastSearchUrl") || "/";
  });

  useEffect(() => {
    fetchApi<Place>(`places/${params.id}/`)
      .then(setPlace)
      .catch((requestError) => {
        if (requestError instanceof ApiError && requestError.status === 404) {
          setError("Place not found.");
          return;
        }
        setError("Could not load this place.");
      });

    fetchApi<User>("me/")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, [params.id]);

  async function toggleFavorite() {
    if (!place) return;
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/places/${place.id}`)}`);
      return;
    }

    setIsUpdating(true);
    try {
      await fetchApi(`places/${place.id}/favorite/`, undefined, undefined, {
        method: place.is_favorite ? "DELETE" : "POST",
      });
      setPlace({ ...place, is_favorite: !place.is_favorite });
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/places/${place.id}`)}`);
        return;
      }
      setError("Could not update favorites. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  if (error && !place) {
    return <p className="mx-auto max-w-5xl px-5 py-12 text-red-400">{error}</p>;
  }

  if (!place) {
    return (
      <div className="flex h-main-content items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const openingStatus =
    place.opening_status === "OPEN"
      ? "Open"
      : place.opening_status === "CLOSED"
        ? "Closed"
        : "Unknown";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-8">
      <Link href={href} className="w-fit text-sm text-primary hover:underline">
        ← Back to search
      </Link>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold">{place.name}</h1>
          <p className="mt-1 text-gray-400">{place.category.name}</p>
        </div>
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={isUpdating}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 transition hover:bg-blue-400 disabled:opacity-50"
        >
          {place.is_favorite ? <IoHeart /> : <IoHeartOutline />}
          {place.is_favorite ? "Remove from favorites" : "Add to favorites"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <dl className="grid gap-4 rounded-xl border border-border-primary bg-neutral-900 p-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-gray-400">Address</dt>
          <dd>{place.address ?? "Not available"}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">Category</dt>
          <dd>{place.category.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">Rating</dt>
          <dd className="flex items-center gap-2">
            {place.rating ?? "Not rated"}
            {place.rating != null && <StarRating rating={place.rating} />}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">Price level</dt>
          <dd>{place.price_level ?? "Not available"}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">Opening status</dt>
          <dd
            className={
              place.opening_status === "OPEN"
                ? "text-green-500"
                : place.opening_status === "CLOSED"
                  ? "text-red-500"
                  : ""
            }
          >
            {openingStatus}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">City</dt>
          <dd>{place.city.name}</dd>
        </div>
      </dl>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Location</h2>
        <PlaceMap
          name={place.name}
          position={[Number(place.latitude), Number(place.longitude)]}
        />
      </section>
    </div>
  );
}
