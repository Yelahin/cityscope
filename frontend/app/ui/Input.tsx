"use client";

import { FaSearch } from "react-icons/fa";

interface InputProps {
    placeholder: string,
    type?: React.HTMLInputTypeAttribute,
    className?: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onSubmit: () => void
}

export default function Input ({ placeholder, type, className, value, onChange, onSubmit }: InputProps) {
    return (
        <div className={`flex gap-1 items-center border-[0.5px] border-border-primary p-2 rounded-xl inset-shadow-sm bg-dark-primary
        ${className}`}>
            <input 
                placeholder={placeholder} 
                type={type} 
                value={value} 
                onChange={onChange} 
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") {
                        onSubmit();
                    }
                }}
                className="outline-none w-full h-full" 
            />
            <button 
                type="submit" 
                onSubmit={onSubmit}
                className="cursor-pointer text-primary">
                <FaSearch />
            </button>
        </div>
    )
}