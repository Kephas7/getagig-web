import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Get-a-Gig | Find & Post Music Gigs",
  description: "The platform connecting musicians with gig opportunities. Browse live performances, studio sessions, and events — or post your own.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    const theme = localStorage.getItem("theme") || "system";
    const root = document.documentElement;

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", theme);
    }
  } catch (e) {}
})();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <SocketProvider>
            {children}
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
