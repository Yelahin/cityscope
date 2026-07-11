import Link from "next/link";

const btnStyle = "bg-gray-500 rounded-md p-1 hover:bg-gray-400 active:bg-gray-300 transition cursor-pointer";

export function SecondaryButtonLink ({ href, children }: {
    href: string, children: React.ReactNode
}) {
    return (
        <Link href={href} className={btnStyle}> 
            {children}
        </Link>
    )
}

export function SecondaryButton ({ onClick, children }: {
    onClick: React.MouseEventHandler<HTMLButtonElement>, children: React.ReactNode
}) {
    return (
        <button onClick={onClick} className={btnStyle}>
            {children}
        </button>
    )
}