import { IoCheckmark } from "react-icons/io5"
import List from "./List"
import ListItem from "./ListItem"
import { useState, Dispatch, SetStateAction } from "react"
import StarRating from "./StarRatings";
import { PrimaryButton } from "./PrimaryButton";
import { useRouter, useSearchParams } from "next/navigation";
import { SecondaryButton } from "./SecondaryButton";

export default function RatingFilter ({setOpenFilter}: {setOpenFilter: Dispatch<SetStateAction<string | null>>}) {
    const key = "rating";
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams.toString());
    const ratingParams = searchParams.get("rating_min")
    const [selectedRating, setSelectedRating] = useState<number | null>(ratingParams ? Number(ratingParams) : null);

    const rating = [0, 1, 2, 3, 4, 5];

    function handleApply () {
        if (selectedRating === null) {
            params.delete(key + "_min");
            params.delete(key + "_max");
        } else {
            params.set(key + "_min", String(selectedRating));
            params.set(key + "_max", String(selectedRating+1));
        }
        router.push("?" + params.toString());
        setOpenFilter(null);
    }

    function handleClear () {
        setOpenFilter(null);
        params.delete(key + "_min");
        params.delete(key + "_max");
        router.push("?" + params.toString);
    }
    

    return (
        <div className="flex flex-col gap-2.5">
            <List>
                {rating.map((object) => {
                    return (
                        <ListItem key={object} className="h-6.5" onClick={() => setSelectedRating(object !== selectedRating ? object : null)}>
                            <StarRating rating={object} />
                            <div className="flex justify-center items-center p-0 m-0 w-7.5">
                                {selectedRating === object && <IoCheckmark className="text-xl text-primary" />}
                            </div>
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