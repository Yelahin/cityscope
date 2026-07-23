import { IoCheckmark } from "react-icons/io5"
import List from "./List"
import ListItem from "./ListItem"
import { Dispatch, SetStateAction } from "react"
import StarRating from "./StarRatings";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

export default function RatingFilter ({
    setOpenFilter,
    selectedFilters,
    setSelectedFilters,
}: {
    setOpenFilter: Dispatch<SetStateAction<string | null>>,
    selectedFilters: Record<string, number | string | number[] | string[]>,
    setSelectedFilters: Dispatch<SetStateAction<Record<string, number | string | number[] | string[]>>>,
}) {
    const rating = [0, 1, 2, 3, 4, 5];

    function handleClear () {
        setSelectedFilters(prev => {
            const rest = {...prev};
            delete rest["rating_min"];
            delete rest["rating_max"];
            return rest;
        })
        setOpenFilter(null);
    }
    
    return (
        <div className="flex flex-col gap-2.5">
            <List>
                {rating.map((object) => {
                    return (
                        <ListItem key={object} className="h-6.5" onClick={() => {
                            if (Object.keys(selectedFilters).includes("rating_min") && selectedFilters["rating_min"] === object) {
                                setSelectedFilters(prev => {
                                    const rest = {...prev};
                                    delete rest["rating_min"];
                                    delete rest ["rating_max"];
                                    return rest;
                                })
                            } else {
                                setSelectedFilters(prev => {
                                    return {...prev, "rating_min": object, "rating_max": object+1}
                                })
                            }
                        }}>
                            <StarRating rating={object} />
                            <div className="flex justify-center items-center p-0 m-0 w-7.5">
                                {selectedFilters["rating_min"] === object && <IoCheckmark className="text-xl text-primary" />}
                            </div>
                        </ListItem>
                    )
                })}
            </List>
            <div className="flex gap-2.5">
                <PrimaryButton onClick={() => setOpenFilter(null)}>Close</PrimaryButton>
                <SecondaryButton onClick={handleClear}>Clear</SecondaryButton>
            </div>
        </div>
    )
}