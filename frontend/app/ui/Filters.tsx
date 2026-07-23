import { useState, useEffect } from "react";
import PlaceFilter from "./PlaceFilter";
import ScrollableRow from "./ScrollableRow";
import ListFilter from "./ListFilter";
import RadiusFilter from "./RadiusFilter";
import fetchApi, {PaginatedResponse} from "../lib/api/client";
import { useRouter, useSearchParams } from "next/navigation";
import RatingFilter from "./RatingFilter";
import OpeningStatusFilter from "./OpeningStatusFilter";
import SaveSearch from "./SaveSearch";


export interface FilterOption {
    id: number,
    name: string
}

export default function Filters ({position}: {position: [number, number] | undefined}) {
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const [categories, setCategories] = useState<FilterOption[]>([]);
    const [cities, setCities] = useState<FilterOption[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get("search");
    const [selectedFilters, setSelectedFilters] = useState<Record<string, number | string | number[] | string[]>>({});
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
            fetchApi<PaginatedResponse<FilterOption>>("categories/")
            .then((categories) => setCategories(categories.results))
            .catch(() => setCategories([]));

            fetchApi<PaginatedResponse<FilterOption>>("cities/")
            .then((cities) => setCities(cities.results))
            .catch(() => setCities([]));
        }
        fetchFilters();
    }, [])

    function toggleFilter (name: string) {
        setOpenFilter(prev => (prev === name ? null : name));
    }

    function handleClear () {
        setSelectedFilters({});
        setOpenFilter(null);
        router.push(search ? `?search=${search}` : "?")
    }

    function handleApply () {
        const params = new URLSearchParams(search ? `search=${search}` : "");
        Object.entries(selectedFilters).forEach(([key, value]) => {
            params.set(key, Array.isArray(value) ? value.join(",") : String(value));
        });
        router.push("?" + params.toString());
    }

    return (
        <div className="flex max-w-75 w-full gap-2.5">
            <ScrollableRow >
                <PlaceFilter
                    placeholder="City" 
                    selectedFilters={selectedFilters}
                    isOpen={openFilter === "City"} 
                    onToggle={() => toggleFilter("City")}
                    filter={
                        <ListFilter 
                            objects={cities} 
                            placeholder="City" 
                            setOpenFilter={setOpenFilter}
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                        />
                    }
                />
                <PlaceFilter 
                    placeholder="Category" 
                    selectedFilters={selectedFilters}
                    isOpen={openFilter === "Category"} 
                    onToggle={() => toggleFilter("Category")}
                    filter={
                        <ListFilter 
                            objects={categories} 
                            placeholder="Category" 
                            setOpenFilter={setOpenFilter}
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                        />
                    }
                />

                {position &&
                    <PlaceFilter
                        placeholder="Radius"
                        selectedFilters={selectedFilters}
                        isOpen={openFilter === "Radius"}
                        onToggle={() => toggleFilter("Radius")}
                        filter={
                            <RadiusFilter 
                                setOpenFilter={setOpenFilter} 
                                selectedFilters={selectedFilters}
                                setSelectedFilters={setSelectedFilters}
                            />
                        }
                    />
                }
                <PlaceFilter
                    placeholder="Rating"
                    param="rating_max"
                    selectedFilters={selectedFilters}
                    isOpen={openFilter === "Rating"}
                    onToggle={() => toggleFilter("Rating")}
                    filter={
                        <RatingFilter 
                            setOpenFilter={setOpenFilter} 
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                        />
                    }
                />
                <PlaceFilter
                    placeholder="Price level"
                    param="price_level"
                    selectedFilters={selectedFilters}
                    isOpen={openFilter === "Price level"}
                    onToggle={() => toggleFilter("Price level")}
                    filter={
                        <ListFilter 
                            selectById={false} 
                            objects={priceLevels} 
                            placeholder="Price level" 
                            param="price_level"
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                            setOpenFilter={setOpenFilter} 
                        />
                    }
                />
                <PlaceFilter
                    placeholder="Opening status"
                    param="opening_status"
                    selectedFilters={selectedFilters}
                    isOpen={openFilter === "Opening status"}
                    onToggle={() => toggleFilter("Opening status")}
                    filter={
                        <OpeningStatusFilter 
                            setOpenFilter={setOpenFilter}
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                        />
                    }
                />
                <SaveSearch />
                <button 
                    className="flex whitespace-nowrap justify-center items-center bg-dark-primary hover:bg-[rgb(75,75,75)] text-sm text-red-500 hover:text-white border border-white-500 px-2 rounded-full cursor-pointer"
                    onClick={handleClear} 
                >
                    Clear All
                </button>
            </ScrollableRow>
            <button 
                className="text-sm rounded-full px-2 cursor-pointer whitespace-nowrap text-white bg-primary hover:bg-blue-400 active:bg-blue-300 transition"
                onClick={handleApply}
            >Apply</button>
        </div>
    );
}
