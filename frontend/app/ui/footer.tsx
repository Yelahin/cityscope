export default function Footer () {
    return (
        <footer className="flex w-full h-header items-center px-8 border-t-[0.5px] border-[rgb(35,35,35)]">
            <p className="text-sm font-light text-secondary">© {new Date().getFullYear()} Illia Yelahin. All rights reserved.</p>
        </footer>
    )
}