import { Marker, Popup } from "react-leaflet";
import L from "leaflet";


export default function UserMarker ({position}: {position: [number, number]}) {
    const userIcon = L.divIcon({
        className: "user-marker",
        html: "<div className='user-marker-dot' data-testid='user-marker'></div>",
        iconSize: [20, 20]
    })

    return (
        <Marker icon={userIcon} position={position}>
            <Popup>
                <p>Latitude: {position[0].toFixed(7)}</p>
                <p>Longitude: {position[1].toFixed(7)}</p>
            </Popup>
        </Marker>
    )
}