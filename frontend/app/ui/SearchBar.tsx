import { useState } from "react";
import Input from "./Input";

export default function SearchBar ({handleSubmit}: {handleSubmit: (value: string) => void}) {
    const [searchValue, setSearchValue] = useState("");

    return (
        <Input 
        className="pointer-events-auto"
        placeholder="Search..." 
        value={searchValue} 
        onChange={(e) => setSearchValue(e.target.value) }
        onSubmit={() => handleSubmit(searchValue)}
        />
    )
}