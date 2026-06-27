"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Map = dynamic(() => import("./ui/Map/Map"), {ssr: false})

interface Coordinates {
    latitude: number | null;
    longitude: number | null;
}

export default function Home () {
    const [userCoordinates, setUserCoordinates] = useState<Coordinates>({latitude: null, longitude: null})

    function getPosition (position: GeolocationPosition): void {
        setUserCoordinates({latitude: position.coords.latitude, longitude: position.coords.longitude})
    }

    function getLocation (): void {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getPosition);
        } else {
            console.log("Access to user coordinates denied!")
        }
    }

    useEffect(() => getLocation(), [])


    return (
        <div>
            {userCoordinates.latitude !== null && userCoordinates.longitude !== null 
            ? (<Map position={[userCoordinates.latitude, userCoordinates.longitude]} zoom={15} />) 
            : (<Map position={[30, 0]} zoom={0} />)}
    
        </div>
    )
}