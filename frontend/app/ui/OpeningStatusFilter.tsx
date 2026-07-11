import { IoCheckmark } from "react-icons/io5"
import List from "./List"
import ListItem from "./ListItem"
import { useState, Dispatch, SetStateAction } from "react"
import StarRating from "./StarRatings";
import { PrimaryButton } from "./PrimaryButton";
import { useRouter, useSearchParams } from "next/navigation";
import { SecondaryButton } from "./SecondaryButton";

export default function OpeningStatusFilter ({setOpenFilter}: {setOpenFilter: Dispatch<SetStateAction<string | null>>}) {
    const key = "opening_status";
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams.toString());
    const statusParams = searchParams.get(key)
    const [selectedOpeningStatus, setSelectedOpeningStatus] = useState<string | null>(statusParams ?? null);

    const openingStatus = ["OPEN", "CLOSED"];

    function handleApply () {
        if (selectedOpeningStatus === null) {
            params.delete(key);
        } else {
            params.set(key, selectedOpeningStatus);
        }
        router.push("?" + params.toString());
        setOpenFilter(null);
    }

    function handleClear () {
        setOpenFilter(null);
        params.delete(key);
        router.push("?" + params.toString());
    }
    

    return (
        <div className="flex flex-col gap-2.5">
            <List>
                {openingStatus.map((object) => {
                    return (
                        <ListItem key={object} className="h-6.5" onClick={() => setSelectedOpeningStatus(object !== selectedOpeningStatus ? object : null)}>
                                <p className={`${object === "OPEN" ? "text-green-500" : "text-red-500"}`}>{object}</p>
                                {selectedOpeningStatus === object && <IoCheckmark className="text-xl text-primary" />}
                        </ListItem>
                    )
                })}
            </List>
            <div className="flex gap-2.5">
                <PrimaryButton onClick={handleApply}>Apply</PrimaryButton>
                <SecondaryButton onClick={handleClear}>Clear</SecondaryButton>
            </div>
        </div>
    )
}