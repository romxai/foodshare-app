import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  SettingsIcon,
  LogOutIcon,
  ActivityIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 425);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    if (!isSmallScreen) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 transition-all duration-300 ease-in-out z-50 flex flex-col ${
          sidebarOpen ? "w-64" : isSmallScreen ? "w-12" : "w-16"
        }`}
      >
        <div className="p-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {sidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2">
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/")}
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Home"}
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/account")}
              >
                <ActivityIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Activity"}
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/settings")}
              >
                <SettingsIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Settings"}
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={onLogout}
              >
                <LogOutIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Logout"}
              </Button>
            </li>
          </ul>
        </nav>
      </div>
      {sidebarOpen && !isSmallScreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
