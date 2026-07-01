import { useState } from "react";
import { Place } from "./Map";
import { IoSearch } from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";
import StarRating from "./StarRatings";

export default function MapList ({places, search, onPlaceClick}: {
        places: Place[], 
        search: string | null,
        onPlaceClick: (place: Place) => void}) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const startSearching = (
        <div className="flex flex-col h-full w-full justify-center items-center gap-2 text-gray-500">
            <IoSearch className="text-8xl"/>
            <p className="text-xl">Start Searching!</p>
        </div>)

    const placeResults = places.length > 0 
        ? (
            <ul className="mt-14 w-full h-[calc(var(--height-main-content)-var(--height-header))] overflow-auto">
                {places.map((place: Place) => {
                    const priceLevel = <p className="text-gray-400 text-sm">{place?.price_level}</p>
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
                            {place.distance != null && distance}
                        </li>
                    )
                })}
            </ul>
        )
        : (
            <div className="flex flex-col h-full w-full justify-center items-center gap-2 text-gray-500">
                <MdErrorOutline className="text-8xl"/>
                <p className="text-xl text-center">No results found</p>
            </div>
        )

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

            <div className={`-z-1 top-header left-0 w-75 bg-dark-primary
                ${isOpen ? "fixed" : "hidden"}`}>
                {search ? placeResults : startSearching}
            </div>
        </>
    )
}