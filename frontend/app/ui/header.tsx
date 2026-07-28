"use client";

import Link from "next/link";
import { IoLocationSharp } from "react-icons/io5";
import BurgerMenu from "./BurgerMenu";
import { useState} from "react";
import AuthNavigation from "./AuthNavigation";


export default function Header () {
    const [isBurgerMenu, setIsBurgerMenu] = useState(false);
    return (
        <header className="flex z-10000 fixed w-full h-header items-center justify-between px-2.5 border-b-[0.5px] border-border-primary">
            <div className="flex items-center">
                <Link href="/" onClick={() => setIsBurgerMenu(false)} data-testid="cityscope-icon-link">
                   <IoLocationSharp className="w-5.5 h-5.5 m-0 p-0 text-primary" />
                </Link>
                <Link href="/" onClick={() => setIsBurgerMenu(false)} data-testid="cityscope-logo-link">
                    <span className="font-bold">Cityscope</span>
                </Link>
            </div>
            <nav className="hidden sm:flex items-center gap-3.5">
                <AuthNavigation />
            </nav>

            <BurgerMenu isOpen={isBurgerMenu} setIsOpen={setIsBurgerMenu} />            
        </header>
    )
}
