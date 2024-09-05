import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { config as configDotenv } from 'dotenv';
import StoreProvider from "./StoreProvider";
import Search from '@/components/search';
import Mangas from '@/components/mangas';
import "./globals.css";

configDotenv();
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-screen flex-row items-center justify-between p-0">
          <StoreProvider>
            <div className="grow-0 shrink-0 w-60 h-screen bg-slate-900 pt-4 overflow-y-scroll scroll-my-2">
              <Mangas />
            </div>
            <div className="h-screen flex-grow flex flex-col">
              <div className="grow-0 shrink-0 w-full h-24 bg-slate-50 shadow-md">
                <Search className="" />
              </div>
              <div className="w-full flex-grow overflow-y-scroll">
                { children }
              </div>
            </div>
          </StoreProvider>
        </main>
      </body>
    </html>
  );
}
