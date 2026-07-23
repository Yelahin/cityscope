import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import SearchBar from "./SearchBar";
import { useCallback, useEffect, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchAllPages } from "@/app/lib/api/client";
import MapController from "./MapController";
import UserMarker from "./UserMarker";
import MapList from "./MapList";
import Filters from "./Filters";
import type {Place} from "../lib/api/types";

interface MapProps {
    position?: [number, number];
    zoom: number;
}

const defaultPosition: [number, number] = [30, 0]

export default function Map(props: MapProps) {
  const { position, zoom } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});
  const pathName = usePathname();

  // Params
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const radius = searchParams.get("radius");
  const minRating = searchParams.get("rating_min");
  const maxRating = searchParams.get("rating_max");
  const priceLevel = searchParams.get("price_level");
  const openingStatus = searchParams.get("opening_status");

  const buildUrl = useCallback((searchValue: string, showPosition: boolean, page?: number) => {
    const parts = [
      searchValue ? `search=${searchValue}` : "",
      (showPosition && position) ? `lat=${position[0]}&lon=${position[1]}` : "",
      category ? `category=${category}` : "",
      city ? `city=${city}` : "",
      radius ? `radius=${radius}` : "",
      (minRating && maxRating) ? `rating_min=${minRating}` : "",
      (minRating && maxRating) ? `rating_max=${maxRating}` : "",
      priceLevel ? `price_level=${priceLevel}` : "",
      openingStatus ? `opening_status=${openingStatus}` : "",
      page ? `page=${page}` : ""
    ];
    return parts.filter((part) => part !== "").join("&");
  }, [position, category, city, radius, minRating, maxRating, priceLevel, openingStatus]);

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
    if ([value, city, category].some((element) => element !== null && element !== "")) {
      router.push("?" + buildUrl(value, false));
    } else {
      router.push(pathName);
    }
  }

  const shouldFetch = !!search || (!!category && !!city);

  useEffect(() => {
    if (!shouldFetch) {
      async function clearPlaces () {
        setPlaces([]);
        setLoadError(null);
      }
      clearPlaces();
      return;
    }

    async function fetchPlaces () {
      setIsLoading(true);
      setLoadError(null);
      try {
        const places = await fetchAllPages<Place>(
          "places/?" + buildUrl(search ?? "", true, 1),
          1000
        );

        setPlaces([...places]);
      } catch {
        setPlaces([]);
        setLoadError("Could not load places. Make sure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlaces();
  }, [search, category, city, buildUrl, shouldFetch])

  return (
    <>
      <div className="fixed flex items-center justify-between z-1000 left-0 w-full pointer-events-none *:pointer-events-auto">
        <div className="flex flex-col p-2.5 gap-2.5 w-full max-w-75">
          <div className="flex w-full gap-2.5">
            <SearchBar handleSubmit={handleSubmit} className="max-w-90 w-full rounded-xl" />
            <MapList
              places={places}
              onPlaceClick={handleMapListPlaceClick}
              isLoading={isLoading}
              error={loadError}
            />
          </div>
          <Filters position={position} />
        </div>
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
