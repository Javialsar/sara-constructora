import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import SessionTracker from "@/components/SessionTracker";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import RealtimeProvider from "@/components/RealtimeProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});


export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "SARA Constructora | Arquitectura e Ingeniería",
  description: "Diseñamos ideas. Construimos futuro. Especialistas en proyectos de ingeniería civil y diseño arquitectónico.",
  manifest: "/manifests/constructora",
  keywords: "SARA Constructora, Constructora Cariamanga, Constructora en Cariamanga, Constructora Loja, Arquitectura Cariamanga, Arquitectos Cariamanga, Ingeniería Civil Cariamanga, Ingeniería Civil Loja",
  appleWebApp: { capable: true, title: "SARA", statusBarStyle: "default" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('sara_theme');
                  var valid = ['theme-ocean', 'theme-gold', 'theme-apucons', 'theme-sunset', 'theme-nordic', 'theme-ruby'];
                  if (saved && valid.indexOf(saved) !== -1) {
                    document.documentElement.classList.add(saved);
                  }
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-brand-black">
        <Providers>
          <RealtimeProvider>
            <SessionTracker />
            <RegisterServiceWorker />
            {children}
          </RealtimeProvider>
        </Providers>
      </body>
    </html>
  );
}
