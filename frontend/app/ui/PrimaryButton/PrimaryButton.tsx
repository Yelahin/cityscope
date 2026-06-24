import Link from "next/link";

const btnStyle = "bg-primary rounded-md p-1 hover:bg-blue-400 active:bg-blue-300 transition"

export function PrimaryButtonLink ({ href, children }: {
    href: string, children: React.ReactNode
}) {
    return (
        <Link href={href} className={btnStyle}> 
            {children}
        </Link>
    )
}

export function PrimaryButton ({ onClick, children }: {
    onClick: React.MouseEventHandler<HTMLButtonElement>, children: React.ReactNode
}) {
    return (
        <button onClick={onClick} className={btnStyle}>
            {children}
        </button>
    )
}