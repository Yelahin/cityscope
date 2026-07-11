import { useState, Dispatch, SetStateAction } from "react"
import Input from "./Input"
import { useRouter, useSearchParams } from "next/navigation";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

export default function RadiusFilter ({setOpenFilter}: {setOpenFilter: Dispatch<SetStateAction<string | null>>}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const key = "radius";
    const [radius, setRadius] = useState<number | null>(searchParams.get(key) ? Number(searchParams.get(key)) : null);
    const params = new URLSearchParams(searchParams.toString());

    function handleApply () {
        if (!radius) {
            params.delete(key);
        } else {
            params.set(key, String(radius));
        }
        router.push("?" + params.toString());
        setOpenFilter(null);
    }

    function handleClear () {
        params.delete(key);
        router.push("?" + params);
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
                <PrimaryButton onClick={handleApply}>Apply</PrimaryButton>
                <SecondaryButton onClick={handleClear}>Clear</SecondaryButton>
            </div>
        </div>
    )
}