import { useState } from "react";
import Input from "./Input";
import { useSearchParams } from "next/navigation";

export default function SearchBar ({
    handleSubmit,
    className,
    limit,
}: {
    handleSubmit: (value: string) => void,
    className?: string,
    limit?: number,
}) {
    const search = useSearchParams().get("search");
    const [searchValue, setSearchValue] = useState(search ? search : "");

    return (
        <Input 
        className={className}
        isButton={true}
        placeholder="Search..." 
        value={searchValue} 
        onChange={(e) => setSearchValue(e.target.value) }
        onSubmit={() => handleSubmit(searchValue)}
        limit={limit}
        />
    )
}