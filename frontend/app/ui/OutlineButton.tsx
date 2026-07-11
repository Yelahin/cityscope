import Link from "next/link";

const btnStyle = "rounded-md p-1 hover:text-primary active:text-blue-300 border not-hover:border-transparent hover:border-primary active:border-blue-300 transition"

export function OutlineButtonLink ({ href, children }: {
    href: string, children: React.ReactNode
}) {
    return (
        <Link href={href} className={btnStyle}> 
            {children}
        </Link>
    )
}

export function OutlineButton ({ onClick, children }: {
    onClick: React.MouseEventHandler<HTMLButtonElement>, children: React.ReactNode
}) {
    return (
        <button onClick={onClick} className={btnStyle}>
            {children}
        </button>
    )
}