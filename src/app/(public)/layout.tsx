import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileActionBar from "@/components/layout/MobileActionBar";
import SplashScreen from "@/components/ui/SplashScreen";
import Chatbot from "@/components/ui/Chatbot";
import PublicLayoutChrome from "@/components/layout/PublicLayoutChrome";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PublicLayoutChrome
      header={<Header />}
      footer={<Footer />}
      mobileActionBar={<MobileActionBar />}
      chatbot={<Chatbot />}
      splashScreen={<SplashScreen />}
    >
      {children}
    </PublicLayoutChrome>
  );
}
