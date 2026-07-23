import { useState, Dispatch, SetStateAction, useEffect } from "react"
import Input from "./Input"
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

export default function RadiusFilter ({
    setOpenFilter,
    selectedFilters,
    setSelectedFilters,
}: {
    setOpenFilter: Dispatch<SetStateAction<string | null>>,
    selectedFilters: Record<string, number | string | number[] | string[]>,
    setSelectedFilters: Dispatch<SetStateAction<Record<string, number | string | number[] | string[]>>>,
}) {
    const key = "radius";
    const [radius, setRadius] = useState<number | null>(selectedFilters[key] ? selectedFilters[key] as number : null);

    useEffect(() => {
        if (radius) {
            setSelectedFilters(prev => {
                return {...prev, [key]: radius}
            });
        } else {
            setSelectedFilters(prev => {
                if (!(key in prev)) return prev;   
                const {[key]: _, ...rest} = prev;
                return rest;
            })
        }
    }, [radius, setSelectedFilters])

    function handleClear () {
        setRadius(null);
        setSelectedFilters(prev => {
            const {[key]: _, ...rest} = prev;
            return rest;
        });
        setOpenFilter(null);
    }

    return (
        <div>
            <Input 
                placeholder="Enter radius in km"
                type="number"
                onChange={(e) => {
                    const value = e.target.value;
                    setRadius(value === "" ? null : Number(value));
                }}
                value={radius ?? ""}
                isButton={false}
            />
            <div className="flex gap-2.5 mt-2.5">
                <PrimaryButton onClick={() => setOpenFilter(null)}>Close</PrimaryButton>
                <SecondaryButton onClick={handleClear}>Clear</SecondaryButton>
            </div>
        </div>
    )
}