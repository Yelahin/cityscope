export default function FormContainer ({children, className}: {children: React.ReactNode, className?: string}) {
    return (
        <div className={`flex flex-col gap-4 max-w-100 min-h-65 w-full bg-neutral-900 rounded-2xl p-5 border border-primary
        ${className}`}>
            {children}
        </div>
    )
}