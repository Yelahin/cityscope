import { IoCheckmark } from "react-icons/io5"
import List from "./List"
import ListItem from "./ListItem"
import { Dispatch, SetStateAction } from "react"
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

export default function OpeningStatusFilter ({
    setOpenFilter,
    selectedFilters,
    setSelectedFilters,
}: {
    setOpenFilter: Dispatch<SetStateAction<string | null>>,
    selectedFilters: Record<string, number | string | number[] | string[]>,
    setSelectedFilters: Dispatch<SetStateAction<Record<string, number | string | number[] | string[]>>>,
}) {
    const key = "opening_status";
    const openingStatus = ["OPEN", "CLOSED"];

    function handleClear () {
        setSelectedFilters(prev => {
            const {[key]: _, ...rest} = prev;
            return rest;
        });
        setOpenFilter(null);
    }
    

    return (
        <div className="flex flex-col gap-2.5">
            <List>
                {openingStatus.map((object) => {
                    return (
                        <ListItem key={object} className="h-6.5" onClick={() => {
                            if (key in selectedFilters && selectedFilters[key] === object) {
                                setSelectedFilters(prev => {
                                    const {[key]: _, ...rest} = prev;
                                    return rest;
                                })
                            } else {
                                setSelectedFilters(prev => {
                                    return {...prev, [key]: object};
                                })
                            }
                        }}>
                                <p className={`${object === "OPEN" ? "text-green-500" : "text-red-500"}`}>{object}</p>
                                {selectedFilters[key] === object && <IoCheckmark className="text-xl text-primary" />}
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