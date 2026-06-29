import Link from "next/link";
import { usePathname } from "next/navigation";

type Page = {
    label: string,
    href: string
}

const pages = [
    {label: "Home", href: "/"},
    {label: "Sign Up", href: "/sign-up"},
    {label: "Login", href: "/login"}
]

export default function BurgerMenu ({ isOpen, setIsOpen }: {isOpen: boolean, setIsOpen: (value: boolean) => void }) {
    const pathname = usePathname();
    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="flex flex-col justify-center items-center gap-2 sm:hidden cursor-pointer w-10 h-10 p-1.5 rounded-lg shadow-md border-[0.5px] border-border-primary">
                    <span className={`flex bg- h-0.75 rounded-3xl transition-all
                        ${isOpen ? "w-8 bg-primary rotate-45 translate-y-2.75" : "w-6 bg-gray-500"}`}></span>
                    <span className={`flex bg- h-0.75 rounded-3xl transition-all
                        ${isOpen ? "w-0 bg-primary" : "w-7 bg-gray-500"}`}></span>
                    <span className={`flex h-0.75 rounded-3xl transition-all
                        ${isOpen ? "w-8 bg-primary bg- -rotate-45 -translate-y-2.75" : "w-6 bg-gray-500"}`}></span>
            </button>

            <div className={`fixed z-10000 sm:hidden top-header right-0 bg-[rgb(15,15,15)]/70 backdrop-blur-sm w-full 
                ${isOpen ? "opacity-100 h-full" : "pointer-events-none opacity-0 h-0"} transition`}>
                    <ul className="flex flex-col items-center pt-10">
                        {pages.map((page: Page) => {
                            return (
                                <li key={page.href} className="flex w-full justify-center">
                                    <div className="w-64 py-10 flex justify-center text-center border-b-[0.5px]">
                                        <Link
                                            onClick={() => setIsOpen(false)}
                                            href={page.href} 
                                            className={`text-6xl font-bold font-mono [-webkit-text-stroke:1px_white] text-transparent hover:text-white transition duration-300
                                            ${pathname === page.href && "text-white"}`}>
                                                {page.label}
                                        </Link>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
            </div>
        </>
    )
}