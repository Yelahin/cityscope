import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import Input from "../Input/Input";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import fetchApi from "@/app/lib/api/client";

interface MapProps {
    position?: [number, number];
    zoom: number;
}

interface Place {
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
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const [fetchedData, setFetchedData] = useState<FetchedData>({count: 0, next: null, previous: null, results: []}); 

  function handleSubmit (): void {
    if (searchValue !== "") {
      router.push(`?search=${searchValue}`);
    }
  }

  useEffect(() => {
    if (!search) return;

    async function fetchPlaces () {
      const firstPage = await fetchApi(`places/?search=${search}${position ? `&lat=${position[0]}&lon=${position[1]}` : ""}&page=1`);

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

        setFetchedData({...firstPage, results: [...firstPage.results, ...results.flat()]});
        return;

      }
      setFetchedData(firstPage);
    }

    fetchPlaces();
  }, [search])

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

  return (
    <>
      <div className="fixed flex items-center z-1000 top-header right-0 w-full h-header sm:px-30 px-15 transition-all duration-300">
          <Input 
            placeholder="Search..." 
            value={searchValue} 
            onChange={(e) => setSearchValue(e.target.value) }
            onSubmit={handleSubmit}
          />
      </div>
      {}
      <MapContainer center={position ?? defaultPosition} minZoom={2} maxBounds={[[-90, -200], [90, 200]]} maxBoundsViscosity={1} zoom={zoom} className="h-main-content w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

        {position && <Marker position={position} />}
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
          {fetchedData.results && fetchedData.results.map((place) => {
            const address = <p>Address: {place.address}</p>
            const distance = <p>Distance: {place?.distance}</p>
            const rating = <p>Rating: {place?.rating}</p>
            const price_level = <p>Price Level: {place?.price_level}</p>


            return (
              <Marker key={place.id} position={[place.latitude, place.longitude]}>
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
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </>
  )
}