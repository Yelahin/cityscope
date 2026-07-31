export default function PlaceFilter ({
    placeholder,
    param,
    selectedFilters,
    isOpen,
    onToggle,
    requiredToSelect,
    filter
}: {
    placeholder: string, 
    param?: string,
    selectedFilters: Record<string, number | string | number[] | string[]>,
    isOpen: boolean,
    onToggle: () => void,
    requiredToSelect?: string[],
    filter: React.ReactNode
}) {
    const key = param ? param : placeholder.toLowerCase();
    let selectedCount;
    if (key in selectedFilters) {
        selectedCount = Array.isArray(selectedFilters[key]) ? selectedFilters[key].length : 1;
    } else {
        selectedCount = 0;
    }

    if (requiredToSelect && requiredToSelect.includes(key)) {
        return (
            <>
                <button onClick={() => onToggle()} className={`
                    text-sm rounded-full px-2 cursor-pointer whitespace-nowrap border
                    ${isOpen
                        ? "bg-[rgb(75,75,75)]" 
                        : "border-red-500 text-red-500 hover:border-white hover:text-white bg-dark-primary hover:bg-[rgb(75,75,75)] "}
                    `}
                    data-testid="required-to-select">
                    <p>{placeholder}</p>
                </button>

                {isOpen && (
                    <div className="absolute top-10 w-full p-2.5 bg-dark-primary rounded-xl border-[0.5px] border-border-primary">
                        {filter}
                    </div>
                )}
            </>
        )
    }

    return (
        <>
            {selectedCount > 0 
            ? (
                <button onClick={() => onToggle()} className={`
                    text-sm rounded-full px-2 cursor-pointer flex gap-1 justify-center items-center border border-primary whitespace-nowrap
                    ${isOpen
                        ? "text-white bg-[rgb(75,75,75)]" 
                        : "text-gray-400 hover:text-white bg-dark-primary hover:bg-[rgb(75,75,75)] "}
                    `}>
                    <p>{placeholder}</p> 
                    <span className="text-primary">{selectedCount}</span>
                </button>
            )
            : (
                <button onClick={() => onToggle()} className={`
                    text-sm rounded-full px-2 cursor-pointer whitespace-nowrap
                    ${isOpen
                        ? "border text-white bg-[rgb(75,75,75)]" 
                        : "border-border-primary text-gray-400 hover:text-white border-[0.5px] bg-dark-primary hover:bg-[rgb(75,75,75)] "}
                    `}>
                    <p>{placeholder}</p>
                </button>
            )}

            {isOpen && (
                <div className="absolute top-10 w-full p-2.5 bg-dark-primary rounded-xl border-[0.5px] border-border-primary">
                    {filter}
                </div>
            )}
        </>
    )
}