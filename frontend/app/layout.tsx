import Header from "./ui/header";
import Footer from "./ui/footer";

export default function Layout ({ children }: {children: React.ReactNode}) {
    return (
        <html lang="en">
            <body>
                <main>
                    <Header />
                    {children}
                    <Footer />
                </main>
            </body>
        </html>
    )
}