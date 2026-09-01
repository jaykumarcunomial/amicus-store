import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNavigation from "./components/TopNavigation";
import SidebarFilters from "./components/SidebarFilters";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CompareProvider } from "./context/CompareContext";
import CartDrawer from "./components/CartDrawer";
import CompareFloatingBar from "./components/CompareFloatingBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextStore — DummyJSON Modern E-Commerce Platform",
  description: "Browse products, filter, search, compare, add to cart, and manage products with multi-step forms and JWT auth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <AuthProvider>
          <CartProvider>
            <CompareProvider>
              <TopNavigation />
              <SidebarFilters>
                {children}
              </SidebarFilters>
              <CartDrawer />
              <CompareFloatingBar />
            </CompareProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

