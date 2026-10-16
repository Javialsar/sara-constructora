import type { Metadata, Viewport } from "next";
import { Montserrat, Syne } from "next/font/google";
import "./globals.css";
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

const syne = Syne({
  variable: "--font-syne",
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
  title: "Grupo SARA | Ingeniería, Construcción & Tecnología",
  description: "Holding multisectorial oficial en Ecuador: Ingeniería civil, obras arquitectónicas, catálogo inmobiliario, suites boutique y software APU.",
  manifest: "/manifests/constructora",
  keywords: "Grupo SARA, SARA Constructora, SARA Inmobiliaria, SARA Stays, SARA APU, Construcción Ecuador, Arquitectura Cuenca",
  appleWebApp: { capable: true, title: "SARA", statusBarStyle: "default" },
};

async function getActiveTheme(): Promise<string> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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
    <html lang="es" className={`${montserrat.variable} ${syne.variable} ${activeTheme}`.trim()} suppressHydrationWarning>
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
