export default function ListItem ({
    children, 
    onClick,
    className
}: {
    children: React.ReactNode, 
    onClick: () => void,
    className?: string
}) {
    return (
        <li className={`${className} flex items-center justify-between border-[0.5px] py-1 px-2 border-border-primary cursor-pointer`} onClick={onClick}>
            {children}
        </li>
    )
}