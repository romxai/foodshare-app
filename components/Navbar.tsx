import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types";
import { Settings, Activity, LogOut, ChevronDown, Heart } from "lucide-react";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const router = useRouter();

  const handleDonateClick = () => {
    if (user) {
      router.push("/listings");
    } else {
      router.push("/login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#F9F3F0] border-b border-gray-200 z-50 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo/Site Name */}
          <div
            className="text-2xl font-bold text-[#1C716F] cursor-pointer font-korolev tracking-wide"
            onClick={() => router.push("/")}
          >
            FoodShare
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-8">
            {/* Donate Food Button */}
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-[#1C716F] hover:text-[#065553] transition-colors font-['Verdana Pro Cond']"
              onClick={handleDonateClick}
            >
              <Heart className="h-4 w-4 mr-1" />
              Donate Food!
            </Button>

            {/* About Us Button */}
            <Button
              variant="ghost"
              className="text-[#1C716F] hover:text-[#065553] transition-colors font-['Verdana Pro Cond']"
              onClick={() => {
                if (window.location.pathname === "/") {
                  document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
                } else {
                  router.push("/#about");
                }
              }}
            >
              About Us
            </Button>

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-[#1C716F] hover:text-[#065553] font-['Verdana Pro Cond']"
                  >
                    <span className="underline italic">{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#F9F3F0] border-[#ADA8B3] border-2" align="end">
                  <DropdownMenuLabel className="font-korolev text-[#1C716F] tracking-wide">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#ADA8B3]" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={() => router.push("/settings")}
                      className="font-['Verdana Pro Cond'] text-gray-600 hover:text-[#065553] hover:bg-[#CCD9BF] cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push("/account")}
                      className="font-['Verdana Pro Cond'] text-gray-600 hover:text-[#065553] hover:bg-[#CCD9BF] cursor-pointer"
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      <span>Listings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-[#ADA8B3]" />
                  <DropdownMenuItem 
                    onClick={onLogout}
                    className="font-['Verdana Pro Cond'] text-gray-600 hover:text-[#065553] hover:bg-[#CCD9BF] cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
