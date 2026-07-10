import { useState, useEffect } from "react";
import PlaceFilter from "./PlaceFilter";
import ScrollableRow from "./ScrollableRow";
import ListFilter from "./ListFilter";
import RadiusFilter from "./RadiusFilter";
import fetchApi from "../lib/api/client";
import { useRouter, useSearchParams } from "next/navigation";
import RatingFilter from "./RatingFilter";
import OpeningStatusFilter from "./OpeningStatusFilter";


export interface FilterOption {
    id: number,
    name: string
}

export default function Filters ({position}: {position: [number, number] | undefined}) {
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const [categories, setCategories] = useState<FilterOption[]>([]);
    const [cities, setCities] = useState<FilterOption[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams()
    const search = searchParams.get("search");
    const isRequiredFiltersSelected = search || searchParams.get("category") || searchParams.get("city");
    const priceLevels = [
        "0$ - 10$",
        "5$ - 12$",
        "7$ - 16$",
        "10$ - 20$",
        "10$ - 25$",
        "15$ - 25$",
        "15$ - 30$",
        "20$ - 30$",
        "20$ - 35$",
        "25$ - 40$",
        "25$ - 45$",
        "30$ - 50$",
        "30$ - 60$",
        "35$ - 65$",
        "40$ - 80$",
        "45$ - 85$",
        "55$ - 95$",
        "50$ - 100$",
        "60$ - 110$",
        "75$ - 130$",
        "100$+"
    ].map((name, id) => ({id: id, name: name}));

    useEffect(() => {
        function fetchFilters () {
            fetchApi("categories/")
            .then((categories) => setCategories(categories.results))
            .catch((err) => console.error("Failed to load categories", err));

            fetchApi("cities/")
            .then((cities) => setCities(cities.results))
            .catch(((err) => console.error("Failed to load cities", err)));
        }
        fetchFilters();
    }, [])

    function toggleFilter (name: string) {
        setOpenFilter(prev => (prev === name ? null : name));
    }

    function handleClear () {
        if (search) {
            router.push(`?search=${search}`);
        } else {
            router.push("?");
        }
        setOpenFilter(null);
    }

    return (
        <ScrollableRow reload={isRequiredFiltersSelected}>
            <PlaceFilter
                placeholder="City" 
                isOpen={openFilter === "City"} 
                onToggle={() => toggleFilter("City")}
                filter={<ListFilter objects={cities} placeholder="City" setOpenFilter={setOpenFilter} />}
            />
            <PlaceFilter 
                placeholder="Category" 
                isOpen={openFilter === "Category"} 
                onToggle={() => toggleFilter("Category")}
                filter={<ListFilter objects={categories} placeholder="Category" setOpenFilter={setOpenFilter} />}
            />

            {position && isRequiredFiltersSelected &&
            <PlaceFilter
                placeholder="Radius"
                isOpen={openFilter === "Radius"}
                onToggle={() => toggleFilter("Radius")}
                filter={<RadiusFilter setOpenFilter={setOpenFilter} />}
            />
            }
            {isRequiredFiltersSelected &&
                <>
                    <PlaceFilter
                        placeholder="Rating"
                        param="rating_max"
                        isOpen={openFilter === "Rating"}
                        onToggle={() => toggleFilter("Rating")}
                        filter={<RatingFilter setOpenFilter={setOpenFilter} />}
                    />
                    <PlaceFilter
                        placeholder="Price level"
                        param="price_level"
                        isOpen={openFilter === "Price level"}
                        onToggle={() => toggleFilter("Price level")}
                        filter={<ListFilter selectById={false} objects={priceLevels} placeholder="Price level" param="price_level" setOpenFilter={setOpenFilter} />}
                    />
                    <PlaceFilter
                        placeholder="Opening status"
                        param="opening_status"
                        isOpen={openFilter === "Opening status"}
                        onToggle={() => toggleFilter("Opening status")}
                        filter={<OpeningStatusFilter setOpenFilter={setOpenFilter} />}
                    />
                </>
            }
            <button onClick={handleClear} className="flex whitespace-nowrap justify-center items-center bg-dark-primary hover:bg-[rgb(75,75,75)] text-sm text-red-500 hover:text-white border border-white-500 px-2 rounded-full cursor-pointer">Clear All</button>
        </ScrollableRow>
    );
}