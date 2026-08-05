import { Metadata } from "next";
import PlaceDetailsClient from "./PlaceDetailsClient";
import { Place } from "@/app/lib/api/types";
import fetchApi from "@/app/lib/api/client";

type Props = {
    params: Promise<{
        id: string
    }>
}

export async function generateMetadata ({params}: Props): Promise<Metadata> {
    try {
        const { id } = await params;

        const place: Place = await fetchApi(`places/${id}/`, undefined, true);

        return {
            title: place.name + " | CityScope"
        }
    } catch {
        return {
            title: "CityScope",
        }
    }
}

export default function PlaceDetails () {
    return <PlaceDetailsClient />;
}