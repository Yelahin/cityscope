import { useState, useEffect } from "react";
import PlaceFilter from "./PlaceFilter";
import ScrollableRow from "./ScrollableRow";
import ListFilter from "./ListFilter";
import RadiusFilter from "./RadiusFilter";
import fetchApi from "../lib/api/client";
import { useRouter, useSearchParams } from "next/navigation";
import RatingFilter from "./RatingFilter";


export interface FilterOption {
    id: number,
    name: string
}

export default function Filters ({position}: {position: [number, number] | undefined}) {
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const [categories, setCategories] = useState<FilterOption[]>([]);
    const [cities, setCities] = useState<FilterOption[]>([]);
    const router = useRouter();
    const search = useSearchParams().get("search");


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
        <ScrollableRow>
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
            {position &&
            <PlaceFilter
                placeholder="Radius"
                isOpen={openFilter === "Radius"}
                onToggle={() => toggleFilter("Radius")}
                filter={<RadiusFilter setOpenFilter={setOpenFilter} />}
            />
            }
            <PlaceFilter
                placeholder="Rating"
                param="rating_max"
                isOpen={openFilter === "Rating"}
                onToggle={() => toggleFilter("Rating")}
                filter={<RatingFilter setOpenFilter={setOpenFilter} />}
            />
            <button onClick={handleClear} className="flex whitespace-nowrap justify-center items-center bg-dark-primary hover:bg-[rgb(75,75,75)] text-sm text-red-500 hover:text-white border border-white-500 px-2 rounded-full cursor-pointer">Clear All</button>
        </ScrollableRow>
    );
}