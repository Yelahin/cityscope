import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import fetchApi from "@/app/lib/api/client";
import MapController from "./MapController";
import UserMarker from "./UserMarker";

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
  const [places, setPlaces] = useState<Place[]>([]); 

  function handleSubmit (value: string): void {
    if (value !== "") {
      router.push(`?search=${value}`);
    }
  }

  useEffect(() => {
    if (!search) return;

    async function fetchPlaces () {
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
        return;

      }
      setPlaces(firstPage.results);
    }

    fetchPlaces();
  }, [search])

  return (
    <>
      <div className="fixed flex items-center z-1000 top-header right-0 w-full h-header sm:px-30 px-15 pointer-events-none transition-all duration-300">
          <SearchBar handleSubmit={handleSubmit} />
      </div>
      <MapContainer center={position ?? defaultPosition} minZoom={2} maxBounds={[[-90, -200], [90, 200]]} maxBoundsViscosity={1} zoom={zoom} className="h-main-content w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {position && <UserMarker position={position} />}
       <MapController places={places} />
      </MapContainer>
    </>
  )
}