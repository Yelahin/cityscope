import { FilterOption } from "@/app/lib/types";

export function isNumeric (value: string): boolean {
    return value.trim() !== "" && !isNaN(Number(value));
}

export function categoriesCheck (category: string | null, categories: FilterOption[]): boolean {
    if (category && category.split(",").every(cat => isNumeric(cat) && categories.some(option => Number(cat) === option.id))) return true;
    return false;
}

export function cityCheck (city: string | null, cities: FilterOption[]): boolean {
    if (city && isNumeric(city) && cities.some(option => Number(city) === option.id)) return true;
    return false;
}

export function ratingCheck (minRating: string | null, maxRating: string | null): boolean {
    if (!minRating || !maxRating) return false;
    if (!isNumeric(minRating) || !isNumeric(maxRating)) return false;
    const min = Number(minRating);
    const max = Number(maxRating);
    return min >= 0 && min <= 5 && max >= 1 && max <= 6 && min <= max;
}

export function priceLevelCheck(priceLevel: string | null, priceLevels: FilterOption[]): boolean {
    if (priceLevel && priceLevel.split(",").every(price => priceLevels.some(option => option.name === price))) return true;
    return false;
}

export function openingStatusCheck(openingStatus: string | null): boolean {
    if (openingStatus && (openingStatus === "OPEN" || openingStatus === "CLOSED")) return true;
    return false;
}