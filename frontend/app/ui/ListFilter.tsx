import { Dispatch, SetStateAction, useMemo, useState} from "react";
import Input from "./Input";
import { IoCheckmark } from "react-icons/io5";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterOption {
    id: number, 
    name: string
}


export default function ListFilter ({
    objects,
    placeholder,
    setOpenFilter
}: {
    objects: FilterOption[], 
    placeholder: string,
    setOpenFilter: Dispatch<SetStateAction<string | null>>
}) {
    const key = placeholder.toLowerCase();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedObjects, setSelectedObjects] = useState<number[]>(
        searchParams.get(key)?.split(",").map(Number) ?? []
    );


    const filtered = useMemo(() => {
        if (!searchValue) return objects;
        return objects.filter((obj) => obj.name.toLowerCase().includes(searchValue.toLowerCase()));
    }, [objects, searchValue])

    function handleApply () {
        const params = new URLSearchParams(searchParams.toString());
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
        const params = new URLSearchParams(searchParams.toString());
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
            <ul className="h-32.5 rounded-b-md overflow-auto overscroll-contain border-border-primary border-b-[0.5px] border-x-[0.5px]">
                {filtered.map((object) => {
                    return (
                        <li key={object.id} className="flex justify-between border-[0.5px] py-1 px-2 border-border-primary cursor-pointer" onClick={() => 
                            selectedObjects.includes(object.id)
                            ? setSelectedObjects(selectedObjects.filter((obj) => obj !== object.id))
                            : setSelectedObjects([...selectedObjects, object.id])
                        }>
                            {object.name}
                            <div className="flex justify-center items-center p-0 m-0 w-7.5">
                                {selectedObjects.includes(object.id) && <IoCheckmark className="text-xl text-primary" />}
                            </div>
                        </li>
                    )
                })}
            </ul>
            <div className="flex items-center gap-2.5 mt-2.5">
                <PrimaryButton onClick={handleApply}>Apply</PrimaryButton>
                <SecondaryButton onClick={handleClear}>Clear All</SecondaryButton>
            </div>
        </div>
    )
}