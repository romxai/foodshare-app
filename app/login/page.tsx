"use client";

import LoginForm from "@/components/AuthForms/LoginForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        user={null} 
        onLogout={() => router.push("/login")} 
      />
      <div 
        className="flex-1 flex items-center justify-center py-40 px-4 relative"
        style={{
          backgroundImage: "url('/images/login-signup.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        {/* Form */}
        <div className="relative z-10">
          <LoginForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}
