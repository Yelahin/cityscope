export default function ListItem ({
    children, 
    onClick,
    className,
    ariaLabel,
}: {
    children: React.ReactNode, 
    onClick: () => void,
    className?: string,
    ariaLabel?: string,
}) {
    return (
        <li
            aria-label={ariaLabel}
            className={`${className} flex items-center justify-between border-[0.5px] py-1 px-2 border-border-primary cursor-pointer`}
            onClick={onClick}
        >
            {children}
        </li>
    )
}
