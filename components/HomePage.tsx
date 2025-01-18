"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { User } from "@/types";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Mail,
} from "lucide-react";
import Footer from "@/components/Footer";

const HomePage: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const handleDonateClick = () => {
    if (currentUser) {
      router.push("/listings");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F3F0]">
      <Navbar user={currentUser} onLogout={() => router.push("/login")} />

      {/* Hero Section */}
      <section className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero-image.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-[#065553] bg-opacity-70" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-joane font-semibold font-semibold text-[#F9F3F0] mb-6 tracking-wide">
              Share Food, Share Love
            </h1>
            <p className="text-xl md:text-2xl text-[#F9F3F0] mb-8 font-['Verdana Pro Cond']">
              Join our community in reducing food waste and helping those in
              need. Every meal shared is a step towards a better world.
            </p>
            <Button
              onClick={handleDonateClick}
              className="bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0] text-lg px-8 py-6 rounded-full font-['Verdana Pro Cond'] transform transition-all hover:scale-105"
            >
              Donate Food Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-[#F9F3F0]">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-joane font-semibold font-semibold text-[#065553] mb-6 tracking-wide">
              About Us
            </h2>
            <div className="space-y-6 text-gray-600 font-['Verdana Pro Cond']">
              <p className="text-lg">
                Welcome to the Giving Table, an initiative founded by Ishaan
                Taparia, a 17-year-old in Mumbai. We believe that every meal has
                the potential to make a difference in someone's life.
              </p>
              <p className="text-lg">
                Our mission is to create a sustainable and compassionate food
                sharing ecosystem where surplus food finds its way to those who
                need it most. Whether you're a restaurant with extra meals, a
                home cook with leftovers, or someone looking to help your
                community, FoodShare provides a platform to make that
                connection.
              </p>
              <p className="text-lg">
                This realization soon became a turning point. FoodShare serves
                as a testament to the power of community action. Our platform
                has facilitated countless connections, prevented tons of food
                waste, and helped nurture a more sustainable and caring society.
              </p>
              <p className="text-lg">
                We continue to grow and evolve, driven by our commitment to
                making sharing as simple and accessible as possible. Every
                shared meal represents a step towards our vision of a world
                where food brings people together and never goes to waste.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-[#ECFDED]">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-joane font-semibold text-[#065553] mb-6 tracking-wide">
              Our Story
            </h2>
            <div className="space-y-6 text-gray-600 font-['Verdana Pro Cond']">
              <p className="text-lg">
                FoodShare began with a simple observation: while some had
                surplus food that would go to waste, others in our community
                were in need. This realization sparked the idea for a platform
                that could bridge this gap.
              </p>
              <p className="text-lg">
                Founded in 2024, our journey started in Mumbai, where we
                witnessed firsthand the disconnect between food surplus and
                scarcity. What began as a small local initiative has grown into
                a vibrant community of food-sharing enthusiasts.
              </p>
              <p className="text-lg">
                Today, FoodShare serves as a testament to the power of community
                action. Our platform has facilitated countless connections,
                prevented tons of food waste, and helped nurture a more
                sustainable and caring society.
              </p>
              <p className="text-lg">
                We continue to grow and evolve, driven by our commitment to
                making food sharing as simple and accessible as possible. Every
                shared meal represents a step towards our vision of a world
                where food brings people together and never goes to waste.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;
