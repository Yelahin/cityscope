import { useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import Link from "next/link";
import "leaflet.markercluster";
import type {Place} from "../lib/api/types";


export default function MapController ({places, markersRef}: {
    places: Place[], 
    markersRef: React.RefObject<Record<number, L.Marker>>
  }) {
  const map = useMap();

  function createClusterCustomIcon (cluster: L.MarkerCluster) {
    const count = cluster.getChildCount();

    const tiers: [number, string, number][] = [
        [10000, "#BE1A1A", 75],
        [5000, "#5E244E", 70],
        [2000, "#D0311E", 67.5],
        [1000, "#4274D9", 65],
        [750, "#659287", 62.5],
        [500, "#FF6A1C", 60],
        [250, "#FF97D0", 57.5],
        [200, "#0D530E", 55],
        [150, "#E4D329", 52.5],
        [100, "#95CCDD", 50],
        [75, "#723EC3", 47.5],
        [50, "#1E93AB", 45],
        [40, "#FF0066", 42.5],
        [30, "#253900", 40],
        [20, "#40534C", 37.5],
        [10, "#8494FF", 35],
        [5, "#DF6D2D", 32.5],
        [3, "#FFEDFA", 30],
    ];

    const [, color, size] = tiers.find(([threshold]) => count > threshold) ?? [, "#9929EA", 25]


    return L.divIcon({
      html: `
        <div style="background-color: ${color}80">
          <span style="background-color: ${color}99; color: black;">${cluster.getChildCount()}</span>
        </div>
      `,
      className: "custom-marker-cluster",
      iconSize: L.point(size, size, true),
    });
  }

  useEffect(() => {
    if (places.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(
      places.map((place: Place) => [place.latitude, place.longitude])
    );
    map.flyToBounds(bounds, {
      maxZoom: 14, 
      duration: 2,
      padding: [100, 100]
    });
  }, [places, map])

    return (
        <MarkerClusterGroup
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={100}
          spiderfyOnMaxZoom={true}
          polygonOptions={{
            fillColor: '#ffffff',
            color: '#f00800',
            weight: 5,
            opacity: 0,
            fillOpacity: 0.8,
          }}
          showCoverageOnHover={false}
        >
          {places && places.map((place: Place) => {
            const address = <p>Address: {place.address}</p>
            const distance = <p>Distance: {place?.distance}</p>
            const rating = <p>Rating: {place?.rating}</p>
            const price_level = <p>Price Level: {place?.price_level}</p>

            return (
              <Marker 
                key={place.id} 
                position={[place.latitude, place.longitude]}
                ref={(el) => {
                  if (el) markersRef.current[place.id] = el;
                }}
              >
                <Popup>
                  <p>Name: {place.name}</p>
                  {place.address && address}
                  <p>City: {place.city.name}</p>
                  <p>Category: {place.category.name}</p>
                  {place?.distance && distance}
                  {place?.rating && rating}
                  {place?.price_level && price_level}
                  <p>Latitude: {place.latitude}</p>
                  <p>Longitude: {place.longitude}</p>
                  <Link href={`/places/${place.id}`}>View details</Link>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
    )
}
