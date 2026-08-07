"use client";

import { PrimaryButtonLink } from "./ui/PrimaryButton";
import { OutlineButton } from "./ui/OutlineButton";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="h-main-content flex flex-col justify-center items-center">
      <h1 className="text-3xl xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl font-bold font-mono [-webkit-text-stroke:1px_var(--color-secondary)] text-transparent mb-5">
        Something went wrong!
      </h1>
      <div className="flex gap-4">
        <PrimaryButtonLink href="/">Return Home</PrimaryButtonLink>
        <OutlineButton onClick={reset}>Try again</OutlineButton>
      </div>
    </div>
  );
}
