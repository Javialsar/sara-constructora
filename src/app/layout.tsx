import type { Metadata, Viewport } from "next";
import { Montserrat, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import "./leaflet.css";
import "./gantt.css";
import Providers from "@/lib/providers";
import SessionTracker from "@/components/SessionTracker";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import RealtimeProvider from "@/components/RealtimeProvider";
import { createClient } from "@supabase/supabase-js";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sara-constructora.vercel.app'),
  title: {
    default: "GRUPO SARA | Ingeniería, Construcción & Tecnología Integral",
    template: "%s | GRUPO SARA"
  },
  description: "Holding multisectorial líder en Ecuador: Ingeniería civil, cálculo estructural NEC-15, catálogo inmobiliario, suites tipo Airbnb, software APU, fletes satelitales y marketplace de materiales.",
  manifest: "/manifests/constructora",
  keywords: [
    "Grupo SARA",
    "SARA Constructora",
    "SARA Inmobiliaria",
    "SARA Stays",
    "SARA APU",
    "Construcción Ecuador",
    "Ingeniería Civil Cuenca",
    "Cálculo Estructural NEC",
    "Fletes Pesados Ecuador",
    "Marketplace Materiales Construcción"
  ],
  authors: [{ name: "GRUPO SARA", url: "https://sara-constructora.vercel.app" }],
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: "https://sara-constructora.vercel.app",
    title: "GRUPO SARA | Ingeniería, Construcción & Tecnología Integral",
    description: "Holding multisectorial líder en Ecuador: Ingeniería civil, obras arquitectónicas, catálogo inmobiliario, suites tipo Airbnb y software APU.",
    siteName: "GRUPO SARA",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "GRUPO SARA - Ingeniería & Tecnología Integral",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GRUPO SARA | Ingeniería, Construcción & Tecnología",
    description: "Holding multisectorial oficial en Ecuador: Ingeniería civil, obras, catálogo inmobiliario, suites y software APU.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: { capable: true, title: "SARA", statusBarStyle: "default" },
};

async function getActiveTheme(): Promise<string> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return "";
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await supabase
      .from("parametros_globales")
      .select("indirectos_default->tema_activo")
      .eq("id", 1)
      .single();
    return (data as any)?.tema_activo || "";
  } catch {
    return "";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeTheme = await getActiveTheme();

  return (
    <html lang="es" className={`${montserrat.variable} ${plusJakartaSans.variable} ${geist.variable} ${activeTheme}`.trim()} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var serverTheme = ${JSON.stringify(activeTheme)};
                  var saved = localStorage.getItem('sara_theme');
                  var valid = ['theme-ocean', 'theme-gold', 'theme-apucons', 'theme-sunset', 'theme-nordic', 'theme-ruby'];
                  var themeToUse = saved !== null ? saved : (serverTheme || '');
                  valid.forEach(function(cls) { document.documentElement.classList.remove(cls); });
                  if (themeToUse && valid.indexOf(themeToUse) !== -1) {
                    document.documentElement.classList.add(themeToUse);
                  }
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body className={`min-h-screen flex flex-col font-sans bg-white text-brand-black ${activeTheme}`.trim()}>
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
