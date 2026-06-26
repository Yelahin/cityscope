"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./ui/Map/Map"), {ssr: false})

export default function Home () {

    return (
        <div>
            <Map position={[48.85, 2.35]} zoom={13} />
        </div>
    )
}