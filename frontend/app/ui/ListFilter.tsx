import { Dispatch, SetStateAction, useMemo, useState} from "react";
import Input from "./Input";
import { IoCheckmark } from "react-icons/io5";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import { useRouter, useSearchParams } from "next/navigation";
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
    selectById = true,
}: {
    objects: FilterOption[], 
    placeholder: string,
    param?: string,
    setOpenFilter: Dispatch<SetStateAction<string | null>>
    selectById?: boolean
}) {
    const key = param ? param : placeholder.toLowerCase();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedObjects, setSelectedObjects] = useState<(number | string)[]>(selectById 
        ? searchParams.get(key)?.split(",").map(Number) ?? []
        : searchParams.get(key)?.split(",") ?? []
    );
    const params = new URLSearchParams(searchParams.toString());


    const filtered = useMemo(() => {
        if (!searchValue) return objects;
        return objects.filter((obj) => obj.name.toLowerCase().includes(searchValue.toLowerCase()));
    }, [objects, searchValue])

    function handleApply () {
        if (selectedObjects.length === 0) {
            params.delete(key);
        } else {
            params.set(key, selectedObjects.join(","));
        }
        router.push("?" + params.toString());
        setOpenFilter(null);
    }

    function handleClear () {
        setSelectedObjects([]);
        params.delete(key);
        router.push("?" + params.toString());
    }

    return (
        <div>
            <Input 
                className="rounded-t-md"
                placeholder={`Enter ${placeholder.toLowerCase()}`}
                value={searchValue}
                isButton={false}
                onChange={(e) => setSearchValue(e.target.value)}
            />
            <List>
                {filtered.map((object) => {
                    return (
                        <ListItem key={object.id} onClick={() => 
                            selectedObjects.includes(selectById ? object.id : object.name)
                            ? setSelectedObjects(selectedObjects.filter((obj) => obj !== (selectById ? object.id : object.name)))
                            : setSelectedObjects([...selectedObjects, selectById ? object.id : object.name])
                        }>
                            {object.name}
                            <div className="flex justify-center items-center p-0 m-0 w-7.5">
                                {selectedObjects.includes(selectById ? object.id : object.name) && <IoCheckmark className="text-xl text-primary" />}
                            </div>
                        </ListItem>
                    )
                })}
            </List>
            <div className="flex items-center gap-2.5 mt-2.5">
                <PrimaryButton onClick={handleApply}>Apply</PrimaryButton>
                <SecondaryButton onClick={handleClear}>Clear All</SecondaryButton>
            </div>
        </div>
    )
}