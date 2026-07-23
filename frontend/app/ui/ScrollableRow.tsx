import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { IoChevronForward } from "react-icons/io5";



export default function ScrollableRow ({
    children,
    requiredToSelect,
    scrollTrigger,
}: {
    children: React.ReactNode,
    requiredToSelect: string[],
    scrollTrigger: number,
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
    const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

    function checkScroll () {
        const element = scrollRef.current;

        if (!element) return;

        setCanScrollLeft(element.scrollLeft > 0);
        setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth -1);
    }

    useEffect(() => {
        checkScroll();
    }, [])

    useEffect(() => {
        if (requiredToSelect.length > 0) {
            scrollRef.current?.scrollTo({left: 0, behavior: "smooth"});
        }
    }, [scrollTrigger, requiredToSelect])


    function scroll(direction: "left" | "right") {
        scrollRef.current?.scrollBy({left: direction === "left" ? -200 : 200, behavior: "smooth"})
    }

    return (
        <div className="relative flex items-center min-w-0 max-w-65 h-[calc(var(--height-header)/2)]">
            {canScrollLeft && (<button onClick={() => scroll("left")} className="absolute -left-0.5 flex justify-center items-center bg-dark-primary border border-border-primary text-primary rounded-sm h-full aspect-square cursor-pointer shrink-0">
                <IoChevronBack className="text-primary" />
            </button>)}
            <div ref={scrollRef} onScroll={checkScroll} className="flex w-full h-full gap-2.5 overflow-x-auto overscroll-x-contain scrollbar-none">
                {children}
            </div>
            {canScrollRight && (<button onClick={() => scroll("right")} className="absolute -right-0.5 flex justify-center items-center bg-dark-primary border border-border-primary text-primary rounded-sm h-full aspect-square cursor-pointer">
                <IoChevronForward className="text-primary" />
            </button>)}
        </div>
    )
}