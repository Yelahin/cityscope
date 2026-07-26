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

export default function Filters ({position}: {position: [number, number] | undefined}) {
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const [categories, setCategories] = useState<FilterOption[]>([]);
    const [cities, setCities] = useState<FilterOption[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get("search");
    const [selectedFilters, setSelectedFilters] = useState<Record<string, number | string | number[] | string[]>>({});
    const [requiredToSelect, setRequiredToSelect] = useState<string[]>([]);
    const [scrollTrigger, setScrollTrigger] = useState<number>(0);

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

        const category = searchParams.get("category");
        const city = searchParams.get("city");
        const radius = searchParams.get("radius");
        const minRating = searchParams.get("rating_min");
        const maxRating = searchParams.get("rating_max");
        const priceLevel = searchParams.get("price_level");
        const openingStatus = searchParams.get("opening_status");

        const filtersFromUrl: Record<string, number | string | number[] | string[]> = {};

        if (category) filtersFromUrl["category"] = category.split(",").map(Number);
        if (city) filtersFromUrl["city"] = city.split(",").map(Number);
        if (radius) filtersFromUrl["radius"] = Number(radius);
        if (minRating) filtersFromUrl["rating_min"] = Number(minRating);
        if (maxRating) filtersFromUrl["rating_max"] = Number(maxRating);
        if (priceLevel) filtersFromUrl["price_level"] = priceLevel.split(",");
        if (openingStatus) filtersFromUrl["opening_status"] = openingStatus;

        async function setFilters () {
            if (Object.keys(filtersFromUrl).length > 0) {
                setSelectedFilters(prev => ({ ...prev, ...filtersFromUrl }));
            }
        }

        setFilters();
    }, [searchParams])

    function toggleFilter (name: string) {
        setOpenFilter(prev => (prev === name ? null : name));
    }

    function handleClear () {
        setSelectedFilters({});
        setOpenFilter(null);
        router.push(search ? `?search=${search}` : "?")
    }

    function handleApply () {
        if ((search && search !== "") || ("category" in selectedFilters && "city" in selectedFilters)) {
            const params = new URLSearchParams(search ? `search=${search}` : "");
            Object.entries(selectedFilters).forEach(([key, value]) => {
                params.set(key, Array.isArray(value) ? value.join(",") : String(value));
            });
            router.push("?" + params.toString());
        } else {
            if (!("city" in selectedFilters) && !(requiredToSelect.includes("city"))) setRequiredToSelect(prev => [...prev, "city"]);
            if (!("category" in selectedFilters) && !(requiredToSelect.includes("category"))) setRequiredToSelect(prev => [...prev, "category"]);

            setScrollTrigger(prev => prev + 1);
        }
    }

    return (
        <div className="flex max-w-75 w-full gap-2.5">
            <ScrollableRow requiredToSelect={requiredToSelect} scrollTrigger={scrollTrigger}>
                <PlaceFilter
                    placeholder="City" 
                    selectedFilters={selectedFilters}
                    isOpen={openFilter === "City"} 
                    onToggle={() => toggleFilter("City")}
                    requiredToSelect={requiredToSelect}
                    filter={
                        <ListFilter 
                            objects={cities} 
                            placeholder="City" 
                            setOpenFilter={setOpenFilter}
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                            limit={1}
                            setRequiredToSelect={setRequiredToSelect}
                        />
                    }
                />
                <PlaceFilter 
                    placeholder="Category" 
                    selectedFilters={selectedFilters}
                    isOpen={openFilter === "Category"} 
                    onToggle={() => toggleFilter("Category")}
                    requiredToSelect={requiredToSelect}
                    filter={
                        <ListFilter 
                            objects={categories} 
                            placeholder="Category" 
                            setOpenFilter={setOpenFilter}
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                            limit={3}
                            setRequiredToSelect={setRequiredToSelect}
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
                            limit={priceLevels.length}
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
