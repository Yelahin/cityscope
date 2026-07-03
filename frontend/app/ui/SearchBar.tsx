import { useState } from "react";
import Input from "./Input";

export default function SearchBar ({handleSubmit, className}: {handleSubmit: (value: string) => void, className?: string}) {
    const [searchValue, setSearchValue] = useState("");

    return (
        <Input 
        className={className}
        isButton={true}
        placeholder="Search..." 
        value={searchValue} 
        onChange={(e) => setSearchValue(e.target.value) }
        onSubmit={() => handleSubmit(searchValue)}
        />
    )
}