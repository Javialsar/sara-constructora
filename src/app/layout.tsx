import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister"
import Providers from "@/lib/providers";
import SessionTracker from "@/components/SessionTracker";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SARA Constructora | Arquitectura e Ingeniería",
  description: "Diseñamos ideas. Construimos futuro. Especialistas en proyectos de ingeniería civil y diseño arquitectónico.",
  manifest: "/manifest.json",
  keywords: "SARA Constructora, Constructora Cariamanga, Constructora en Cariamanga, Constructora Loja, Arquitectura Cariamanga, Arquitectos Cariamanga, Ingeniería Civil Cariamanga, Ingeniería Civil Loja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-white text-brand-black">
        <PwaRegister />
        <Providers>
          <SessionTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
