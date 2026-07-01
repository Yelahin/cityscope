import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import SearchBar from "./SearchBar";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import fetchApi from "@/app/lib/api/client";
import MapController from "./MapController";
import UserMarker from "./UserMarker";
import MapList from "./MapList";

interface MapProps {
    position?: [number, number];
    zoom: number;
}

export interface Place {
  id: number,
  name: string,
  slug: string,
  address: string | null,
  latitude: number,
  longitude: number,
  rating: number | null,
  price_level: string | null,
  category: {id: number, name: string}
  city: {id: number, name: string},
  sourcerecord: number,
  distance?: number
}

interface FetchedData {
  count: number,
  next: string | null,
  previous: string | null,
  results: Place[]
}

const defaultPosition: [number, number] = [30, 0]

export default function Map(props: MapProps) {
  const { position, zoom } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({})

  function handleMapListPlaceClick (place: Place) {
    const map = mapRef.current;
    
    if (!map) return;

    map.flyTo([place.latitude, place.longitude], 18, {duration: 2});
    
    map.once("moveend", () => {
      const marker = markersRef.current?.[place.id];
      requestAnimationFrame(() => {
        marker.openPopup()
      })
    });
  }

  function handleSubmit (value: string): void {
    if (value !== "") {
      router.push(`?search=${value}`);
    }
  }

  useEffect(() => {
    if (!search) return;

    async function fetchPlaces () {
      setIsLoading(true);
      const firstPage: FetchedData = await fetchApi(`places/?search=${search}${position ? `&lat=${position[0]}&lon=${position[1]}` : ""}&page=1`);

      if (firstPage.next !== null) {

        const totalPageCount = Math.ceil(firstPage.count / firstPage.results.length);
        const remainingPages = Array.from(
          {length: totalPageCount - 1},
          (_, i) => i + 2
        )

        const results = await Promise.all(
          remainingPages.map((page) => {
            return fetchApi(`places/?search=${search}&page=${page}${position ? `&lat=${position[0]}&lon=${position[1]}` : ""}`).then((data: FetchedData) => data.results);
          })
        )

        setPlaces([...firstPage.results, ...results.flat()]);
        setIsLoading(false);
        return;

      }
      setPlaces(firstPage.results);
      setIsLoading(false);
    }

    fetchPlaces();
  }, [search, position])

  return (
    <>
      <div className="fixed flex items-center z-1000 left-0 w-75 h-header gap-2.5 p-2.5 pointer-events-none *:pointer-events-auto">
        <SearchBar handleSubmit={handleSubmit} className="max-w-90 w-full" />
        <MapList places={places} search={search} onPlaceClick={handleMapListPlaceClick} isLoading={isLoading}  />
      </div>
      <MapContainer ref={mapRef} attributionControl={false} center={position ?? defaultPosition} minZoom={2} maxBounds={[[-90, -200], [90, 200]]} maxBoundsViscosity={1} zoomControl={false} zoom={zoom} className="h-main-content w-full">
        <ZoomControl position="topright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {position && <UserMarker position={position} />}
       <MapController markersRef={markersRef} places={places} />
      </MapContainer>
    </>
  )
}