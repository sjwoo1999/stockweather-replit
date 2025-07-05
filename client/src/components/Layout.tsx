import { ReactNode, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={toggleMobileMenu} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </div>
  );
}
