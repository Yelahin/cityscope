"use client";

import Header from "./ui/header";
import Footer from "./ui/footer";

import "./globals.css";
import { AuthProvider } from "./ui/AuthContext";

export default function Providers ({ children }: {children: React.ReactNode}) {
    return (
        <AuthProvider>
            <Header />
            <main className="pt-header min-h-[calc(100vh-var(--height-header))]">
                {children}
            </main>
            <Footer />
        </AuthProvider>
    )
}