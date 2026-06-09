import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/CartDrawer"; // 1. IMPORTAMOS EL CARRITO

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tienda Deportiva",
  description: "Equípate para el rendimiento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Aquí cargan todas las páginas */}
        {children}
        
        {/* 2. AQUÍ INYECTAMOS EL CARRITO PARA QUE EXISTA EN TODA LA WEB */}
        <CartDrawer />
      </body>
    </html>
  );
}
