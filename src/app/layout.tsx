import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SARA Constructora | Arquitectura e Ingeniería",
  description: "Diseñamos ideas. Construimos futuro. Especialistas en proyectos de ingeniería civil y diseño arquitectónico.",
  keywords: "SARA Constructora, Constructora Cariamanga, Constructora en Cariamanga, Constructora Loja, Arquitectura Cariamanga, Arquitectos Cariamanga, Ingeniería Civil Cariamanga, Ingeniería Civil Loja",
};

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileActionBar from "@/components/layout/MobileActionBar";
import SplashScreen from "@/components/ui/SplashScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-white text-brand-black">
        <SplashScreen />
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
