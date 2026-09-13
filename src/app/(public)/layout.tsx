import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileActionBar from "@/components/layout/MobileActionBar";
import SplashScreen from "@/components/ui/SplashScreen";
import Chatbot from "@/components/ui/Chatbot";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SplashScreen />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileActionBar />
      <Chatbot />
    </>
  );
}
