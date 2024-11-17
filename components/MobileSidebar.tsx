import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Heart,
  Info,
  User2,
  Settings,
  Activity,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileSidebarProps {
  user: User | null;
  onLogout: () => void;
  onClose: () => void;
}

// Define menu items
const menuItems = [
  {
    title: "Donate Food!",
    url: "/listings",
    icon: Heart,
  },
  {
    title: "About Us",
    url: "/#about",
    icon: Info,
  },
];

export function MobileSidebar({ user, onLogout, onClose }: MobileSidebarProps) {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar
        collapsible="none"
        className="bg-[#F9F3F0] border-l border-[#ADA8B3] min-h-screen w-full flex flex-col"
      >
        <SidebarContent className="flex-1 overflow-auto">
          <SidebarGroup className="h-full pt-16">
            <SidebarGroupContent className="h-full">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="flex items-center gap-2 w-full p-4 text-[#1C716F] hover:text-[#065553] hover:bg-[#CCD9BF] font-['Verdana Pro Cond']"
                    >
                      <button
                        onClick={() => handleNavigation(item.url)}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {user && (
          <SidebarFooter className="border-t border-[#ADA8B3]">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-2 w-full p-4 text-[#1C716F] hover:text-[#065553] hover:bg-[#CCD9BF] font-['Verdana Pro Cond']">
                      <User2 className="h-5 w-5" />
                      <span className="underline italic">{user.name}</span>
                      <ChevronUp className="ml-auto h-5 w-5" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width] bg-[#F9F3F0] border-[#ADA8B3]"
                  >
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      className="font-['Verdana Pro Cond'] text-[#1C716F] hover:text-[#065553] hover:bg-[#CCD9BF] cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/account")}
                      className="font-['Verdana Pro Cond'] text-[#1C716F] hover:text-[#065553] hover:bg-[#CCD9BF] cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Your Listings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onLogout}
                      className="font-['Verdana Pro Cond'] text-[#1C716F] hover:text-[#065553] hover:bg-[#CCD9BF] cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        )}
      </Sidebar>
    </SidebarProvider>
  );
}
