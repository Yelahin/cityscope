import { Marker } from "react-leaflet";
import L from "leaflet";


export default function UserMarker ({position}: {position: [number, number]}) {
    const userIcon = L.divIcon({
        className: "user-marker",
        html: "<div className='user-marker-dot'></div>",
        iconSize: [20, 20]
    })

    return (
        <Marker icon={userIcon} position={position} />
    )
}