import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Header from "@/components/ui/Header";
import "./globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "./context";
import Footer from "@/components/ui/Footer";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Glow Temperature Tracker - GTA Water Temperature Monitoring",
  description:
    "Track, analyze, and visualize water temperature data across GTA beaches. Upload readings, view historical trends, and learn about Great Lakes temperature patterns. Mobile-optimized for easy data contribution.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 p-4 flex flex-col items-center">
                <div className="mt-6 md:mt-8 w-full">{children}</div>
              </main>
              {/* <Footer /> */}
            </div>
          </UserProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
