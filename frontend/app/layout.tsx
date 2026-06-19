export default function Layout ({ children }: {children: React.ReactNode}) {
    return (
        <html lang="en">
            <body>
                <nav>
                    Navigation
                </nav>
                <main>
                    {children}
                </main>
                <footer>
                    Footer
                </footer>
            </body>
        </html>
    )
}