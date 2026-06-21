import Link from "next/link";
import { PrimaryButtonLink } from "./PrimaryButton/PrimaryButton";
import { SecondaryButtonLink } from "./SecondaryButton/SecondaryButton";
import { IoLocationSharp } from "react-icons/io5";

export default function Header () {
    return (
        <header className="flex fixed w-full h-14 items-center justify-between px-8 border-b-[0.5px] border-[rgb(35,35,35)]">
            <div className="flex items-center">
                <Link href="/">
                   <IoLocationSharp className="w-5.5 h-5.5 m-0 p-0 text-primary" />
                </Link>
                <Link href="/">
                    <span className="font-bold">Cityscope</span>
                </Link>
            </div>
            <div className="flex items-center gap-3.5">
                <PrimaryButtonLink href="sign-up">Sign Up</PrimaryButtonLink>
                <SecondaryButtonLink href="login">Login</SecondaryButtonLink>
            </div>
        </header>
    )
}