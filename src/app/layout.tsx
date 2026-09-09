import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SARA Constructora | Ingeniería · Arquitectura · Construcción",
  description: "Diseñamos ideas. Construimos futuro. SARA CONSTRUCTORA brinda soluciones integrales en Ingeniería Civil, Arquitectura, Construcción y Consultoría en Cariamanga, Loja, Ecuador.",
  keywords: "SARA Constructora, Constructora Cariamanga, Constructora en Cariamanga, Constructora Loja, Arquitectura Cariamanga, Arquitectos Cariamanga, Ingeniería Civil Cariamanga, Ingeniería Civil Loja",
};

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileActionBar from "@/components/layout/MobileActionBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} scroll-smooth antialiased`}>
      <body className="min-h-screen flex flex-col font-sans bg-white text-brand-black">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
