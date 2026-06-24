import Header from "./ui/header";
import Footer from "./ui/footer";

import "./globals.css";

export default function Layout ({ children }: {children: React.ReactNode}) {
    return (
        <html lang="en">
            <body>
                <Header />
                <main className="pt-header min-h-[calc(100vh-var(--height-header))]">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    )
}