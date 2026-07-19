"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Loading from "./loading";
import { usePathname, useSearchParams } from 'next/navigation';

const Map = dynamic(() => import("./ui/Map"), {ssr: false})

interface Coordinates {
    latitude: number | null;
    longitude: number | null;
}

export default function Home () {
    const [userCoordinates, setUserCoordinates] = useState<Coordinates>({latitude: null, longitude: null});
    const [coordinatesReady, setCoordinatesReady] = useState(false);

    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation not supported!");
            Promise.resolve().then(() => setCoordinatesReady(true));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserCoordinates({latitude: position.coords.latitude, longitude: position.coords.longitude});
                setCoordinatesReady(true);
            },
            () => {
                console.log("Access denied!");
                setCoordinatesReady(true);
            }
        )
    }, []);

    useEffect (() => {
        sessionStorage.setItem("lastSearchUrl", `${pathname}?${searchParams}`)
    }, [pathname, searchParams]);

    if (!coordinatesReady) return <Loading />;

    return (
        <div>
            {userCoordinates.latitude !== null && userCoordinates.longitude !== null 
            ? (<Map position={[userCoordinates.latitude, userCoordinates.longitude]} zoom={15} />) 
            : (<Map zoom={0} />)}
        </div>
    )
}