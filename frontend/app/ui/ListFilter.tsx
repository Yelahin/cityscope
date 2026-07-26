import { Dispatch, SetStateAction, useMemo, useState} from "react";
import Input from "./Input";
import { IoCheckmark } from "react-icons/io5";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import List from "./List";
import ListItem from "./ListItem";

interface FilterOption {
    id: number, 
    name: string
}


export default function ListFilter ({
    objects,
    placeholder,
    param,
    setOpenFilter,
    selectedFilters,
    setSelectedFilters,
    selectById = true,
    limit,
    setRequiredToSelect,
}: {
    objects: FilterOption[], 
    placeholder: string,
    param?: string,
    setOpenFilter: Dispatch<SetStateAction<string | null>>,
    selectedFilters: Record<string, number | string | number[] | string[]>,
    setSelectedFilters: Dispatch<SetStateAction<Record<string, number | string | number[] | string[]>>>,
    selectById?: boolean,
    limit?: number,
    setRequiredToSelect?: Dispatch<SetStateAction<string[]>>,
}) {
    const key = param ? param : placeholder.toLowerCase();
    const [searchValue, setSearchValue] = useState<string>("");

    const objArray = Array.isArray(selectedFilters[key]) ? selectedFilters[key] : [];


    const filtered = useMemo(() => {
        if (!searchValue) return objects;
        return objects.filter((obj) => obj.name.toLowerCase().includes(searchValue.toLowerCase()));
    }, [objects, searchValue])

    function handleClear () {
        setSelectedFilters(prev => {
            const {[key]: _, ...rest} = prev;
            return rest;
        })
        setOpenFilter(null);
    }

    return (
        <div>
            {(limit && limit > 1) &&
                <div className="flex mb-1.5">
                    <span className="text-sm text-primary">{objArray.length}</span>
                    <p className="text-sm text-gray-400">{`/${limit}`}</p>
                </div>
            }
            <Input 
                className="rounded-t-md"
                placeholder={`Enter ${placeholder.toLowerCase()}`}
                value={searchValue}
                isButton={false}
                onChange={(e) => setSearchValue(e.target.value)}
            />
            <List>
                {filtered.map((object) => {
                    const value = selectById ? object.id : object.name;
                    return (
                        <ListItem key={object.id} onClick={() => {
                            setSelectedFilters(prev => {
                                const currentArray: (string | number)[] = Array.isArray(prev[key]) ? prev[key] : [];
                                
                                let updated; 
                                if (currentArray.includes(value)) {
                                    updated = currentArray.filter(v => v !== value);
                                } else  {
                                    updated = limit
                                        ? limit === 1 ? [value] : [...currentArray, value].length <= limit ? [...currentArray, value] : currentArray
                                        : [...currentArray, value]
                                }

                                const result = updated as number[] | string[];                                

                                if (result.length === 0) {
                                    const {[key]: _, ...rest} = prev;
                                    return rest;
                                }
                                
                                return {...prev, [key]: result};
                            });
                            if (setRequiredToSelect) setRequiredToSelect(prev => prev.filter((fil) => fil !== key));
                        }}>
                            {object.name}
                            <div className="flex justify-center items-center p-0 m-0 w-7.5">
                                {(() => {
                                    const currentArray: (string | number)[] = Array.isArray(selectedFilters[key]) ? selectedFilters[key] : [];
                                    return currentArray.includes(value) && <IoCheckmark className="text-xl text-primary" />
                                })()}
                            </div>
                        </ListItem>
                    )
                })}
            </List>
            <div className="flex items-center gap-2.5 mt-2.5">
                <PrimaryButton onClick={() => setOpenFilter(null)}>Close</PrimaryButton>
                <SecondaryButton onClick={handleClear}>Clear All</SecondaryButton>
            </div>
        </div>
    )
}