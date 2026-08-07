import { Metadata } from "next";
import Providers from "./Providers";

export const metadata: Metadata = {
  title: "CityScope",
  description:
    "CityScope helps you discover nearby places, including cafes, restaurants, coworking spaces, gyms, and libraries. Search by city, distance, category, rating, price, and opening status, save favorites, and explore locations on an interactive map.",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  keywords: [
    "nearby places",
    "local search",
    "city guide",
    "place finder",
    "restaurants",
    "cafes",
    "coworking spaces",
    "gyms",
    "libraries",
    "interactive map",
    "location discovery",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
