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
            className="text-2xl font-bold text-emerald-600 cursor-pointer"
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
              className="text-gray-600 hover:text-emerald-600 transition-colors"
              onClick={() => {
                if (window.location.pathname === "/") {
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" });
                } else {
                  router.push("/#about");
                }
              }}
            >
              About Us
            </Button>

            {/* User Menu - Added underline and italics */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600"
                  >
                    <span className="underline italic">{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/account")}>
                      <Activity className="mr-2 h-4 w-4" />
                      <span>Activity</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
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
