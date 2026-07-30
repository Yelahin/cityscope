import { useState } from "react";
import Link from "next/link";
import type {Place} from "../lib/api/types";
import { IoSearch } from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";
import StarRating from "./StarRatings";
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from "./Spinner";
import { useSearchParams } from "next/navigation";

export default function MapList ({places, onPlaceClick, isLoading, error}: {
    places: Place[], 
    onPlaceClick: (place: Place) => void,
    isLoading: boolean,
    error: string | null}) {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const itemsPerPage = 10;
    const [displayCount, setDisplayCount] = useState<number>(itemsPerPage);
    const displayedPlaces = places.slice(0, displayCount)
    const [prevPlaces, setPrevPlaces] = useState<Place[]>(places);
    const hasMore = displayCount < places.length
    const searchParams = useSearchParams();

    if (places !== prevPlaces) {
        setPrevPlaces(places);
        setDisplayCount(itemsPerPage);
    }

    function fetchMoreData () {
        setTimeout(() => {
            setDisplayCount(prev => prev + itemsPerPage)
        }, 500);
    }

    function displayPlacesList  () {
        if (searchParams.size === 0) {
            return (
                <div className="flex flex-col h-full w-full justify-center items-center gap-2 text-gray-500">
                    <IoSearch className="text-8xl" data-testid="start-search" />
                    <p className="text-xl">Start Searching!</p>
                </div>
            )
        } else if (isLoading) {
            return (
                <div className="flex flex-col h-full w-full justify-center items-center gap-2 text-gray-500">
                    <Spinner />
                    <p>Loading...</p>
                </div>
            )
        } else if (error) {
            return (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-gray-500">
                    <MdErrorOutline className="text-8xl" data-testid="error-state" />
                    <p className="text-center text-xl">{error}</p>
                </div>
            )
        } else if (places.length === 0) {
            return (
                <div className="flex flex-col h-full w-full justify-center items-center gap-2 text-gray-500">
                    <MdErrorOutline className="text-8xl" data-testid="empty-results" />
                    <p className="text-xl text-center">No results found</p>
                </div>
            )
        } else {
            return (
                <ul className="mt-24 w-full h-[calc(var(--height-main-content)-calc(var(--height-header)*1.75))] overflow-auto overscroll-contain">
                    <InfiniteScroll 
                        dataLength={displayCount} 
                        next={fetchMoreData} 
                        hasMore={hasMore} 
                        loader={<div className="flex justify-center mt-3"><Spinner /></div>}
                        data-testid="infinite-scroll"
                    >
                        {displayedPlaces.map((place: Place) => {
                            const priceLevel = <p className="text-gray-400 text-sm">{place?.price_level}</p>
                            const openingStatus = <p 
                                className={`text-sm ${place?.opening_status === "OPEN" ? "text-green-500" : "text-red-500"}`}>
                                {place?.opening_status}
                            </p>
                            const address = <p className="text-gray-400 text-sm">{place?.address}</p>
                            const distance = <p className="text-gray-400 text-sm">
                                Distance: {place.distance != null && (place.distance >= 1 ? `${place.distance}km` : `${place.distance * 1000}m`)}
                            </p>

                            return (
                                <li 
                                    key={place.id} 
                                    className="flex flex-col w-full p-2 border-border-primary border-t-[0.5px] border-b-[0.5px] cursor-pointer hover:bg-white/20"
                                    onClick={() => onPlaceClick(place)}
                                >
                                    <p className="text-lg">{place.name}</p>

                                    <div className="flex gap-2">
                                        {place.rating != null && (
                                            <div className="flex gap-2">
                                                <p className="text-gray-400 text-sm">{place.rating}</p> 
                                                <StarRating rating={place.rating} />
                                            </div>
                                        )}
                                        
                                        {place.price_level && priceLevel}
                                    </div>

                                    <p className="text-gray-400 text-sm">{place.category.name} • {place.city.name}</p>
                                    {place.address && address}
                                    {place.opening_status && openingStatus}
                                    {place.distance != null && distance}
                                    <Link
                                        href={`/places/${place.id}`}
                                        onClick={(event) => event.stopPropagation()}
                                        className="mt-2 w-fit text-sm text-primary hover:underline"
                                    >
                                        View details
                                    </Link>
                                </li>
                            )
                        })}
                    </InfiniteScroll>
                </ul>
            )
        }
    }

    return (
        <>
            <button 
                className="flex flex-col justify-evenly items-center h-9 w-9 shrink-0 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`flex h-1 rounded-3xl transition-all
                    ${isOpen ? "w-8 bg-primary rotate-45 translate-y-2.5" : "w-7 bg-gray-500"}`}></span>
                <span className={`flex h-1 rounded-3xl transition-all
                    ${isOpen ? "w-0 bg-primary " : "w-7 bg-gray-500"}`}></span>
                <span className={`flex h-1 rounded-3xl transition-all
                    ${isOpen ? "w-8 bg-primary  -rotate-45 -translate-y-2.5" : "w-7 bg-gray-500"}`}></span>
            </button>

            <div className={`-z-1 top-header left-0 w-full max-w-75 h-main-content bg-dark-primary
                ${isOpen ? "fixed" : "hidden"}`} data-testid="map-list">
                {displayPlacesList()}
            </div>
        </>
    )
}
