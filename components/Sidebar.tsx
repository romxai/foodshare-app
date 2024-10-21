import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  MessageSquareIcon,
  SettingsIcon,
  LogOutIcon,
  ActivityIcon,
} from "lucide-react";

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-16"
      } bg-gray-800 transition-all duration-300 ease-in-out`}
    >
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Image src="/icons/hamburger.svg" alt="Menu" width={24} height={24} />
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
              onClick={() => router.push("/messages")}
            >
              <MessageSquareIcon className="h-5 w-5 mr-2" />
              {sidebarOpen && "Messages"}
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
  );
};

export default Sidebar;
