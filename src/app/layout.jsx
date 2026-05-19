import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NewsMonkey - Get your daily dose of news for free!",
  description: "NewsMonkey is a news app which can be used to grab daily news headlines from across the globe in various categories.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
