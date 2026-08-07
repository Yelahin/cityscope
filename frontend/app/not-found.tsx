import { Metadata } from "next";
import { PrimaryButtonLink } from "./ui/PrimaryButton";

export const metadata: Metadata = {
  title: "Not Found",
  robots: {
    index: false,
    follow: true,
    nocache: false,
  },
};

export default function NotFound() {
  return (
    <div className="h-main-content flex flex-col justify-center items-center">
      <h1 className="text-9xl font-mono font-bold [-webkit-text-stroke:1px_var(--color-secondary)] text-transparent">
        404
      </h1>
      <p className="text-lg font-light mb-5">Page not found</p>

      <PrimaryButtonLink href="/">Return Home</PrimaryButtonLink>
    </div>
  );
}
