import Link from "next/link";

const btnStyle =
  "bg-primary rounded-md p-1 hover:bg-blue-400 active:bg-blue-300 transition cursor-pointer";

export function PrimaryButtonLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={btnStyle}>
      {children}
    </Link>
  );
}

export function PrimaryButton({
  onClick,
  children,
  disabled,
  type = "button",
}: {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${btnStyle} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}
