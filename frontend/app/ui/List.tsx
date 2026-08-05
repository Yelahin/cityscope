export default function List({ children }: { children: React.ReactNode }) {
  return (
    <ul className="h-32.5 rounded-b-md overflow-auto overscroll-contain border-border-primary border-b-[0.5px] border-x-[0.5px]">
      {children}
    </ul>
  );
}
