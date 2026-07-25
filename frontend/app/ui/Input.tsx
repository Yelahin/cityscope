"use client";

import { FaSearch } from "react-icons/fa";

interface InputProps {
    placeholder: string,
    type?: React.HTMLInputTypeAttribute,
    className?: string,
    value: string | number,
    isButton: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onSubmit?: () => void,
    limit?: number,
}

export default function Input ({ placeholder, type, className, value, isButton, onChange, onSubmit, limit }: InputProps) {
    return (
        <div className={`flex gap-1 items-center border-[0.5px] border-border-primary p-2 inset-shadow-sm bg-dark-primary
        ${className}`}>
            <input
                min={0}
                placeholder={placeholder} 
                type={type} 
                value={value} 
                onChange={onChange} 
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") {
                        onSubmit?.();
                    }
                }}
                className="outline-none w-full h-full" 
            />
            {isButton &&
                <button 
                    type="submit" 
                    onClick={onSubmit}
                    className={
                        `cursor-pointer 
                        ${limit 
                            ? String(value).length >= limit || String(value).length == 0 ? "text-primary" : "text-red-500"
                            : "text-primary"
                        }`
                    }>
                    <FaSearch />
                </button>
            }           
        </div>
    )
}