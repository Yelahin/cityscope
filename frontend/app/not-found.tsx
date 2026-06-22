import { PrimaryButtonLink } from "./ui/PrimaryButton/PrimaryButton";

export default function NotFound() {
    return (
        <div className="h-main-content flex flex-col justify-center items-center">
            <h1 className="text-9xl font-bold [-webkit-text-stroke:1px_var(--color-secondary)] text-transparent">404</h1>
            <p className="text-lg font-light mb-5">Page not found</p>

            <PrimaryButtonLink href="/">Return Home</PrimaryButtonLink>
        </div>
    );
}