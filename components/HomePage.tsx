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
            <h1 className="text-4xl md:text-6xl font-korolev text-[#F9F3F0] mb-6 tracking-wide">
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
            <h2 className="text-3xl md:text-4xl font-korolev text-[#065553] mb-6 tracking-wide">
              About Us
            </h2>
            <div className="space-y-6 text-gray-600 font-['Verdana Pro Cond']">
              <p className="text-lg">
                Welcome to FoodShare, a heartfelt initiative founded by Ishaan
                Taparia, a 17-year-old passionate cook and change-maker from
                Mumbai.
              </p>
              <p className="text-lg">
                My journey with food began when I was 9 years old, experimenting in
                the kitchen by grilling vegetables. Over the years, cooking became
                more than a skill—it became my creative outlet, allowing me to
                craft any dish I could dream of. However, as I grew older, I came
                to realize the stark contrast between the joy of cooking and the
                harsh reality that millions of people face: the lack of food on
                their plates.
              </p>
              <p className="text-lg">
                At 16, this realization became a turning point. I knew I had to
                act. A year later, FoodShare was born with a mission to bridge the
                gap between surplus and scarcity. Our platform is dedicated to
                redistributing leftover food from homes, events, and restaurants to
                those in need.
              </p>
              <p className="text-lg">
                Through innovation, community collaboration, and compassion, we
                strive to ensure that good food never goes to waste and that no one
                goes to bed hungry.
              </p>
              <p className="text-lg">
                Join us in making a difference—because together, we can turn excess
                into empowerment.
              </p>
              <p className="text-lg italic text-[#065553] font-medium">
                "Food is not just nourishment; it's a symbol of care, hope, and
                humanity."
                <br />~ Ishaan Taparia
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
            <h2 className="text-3xl md:text-4xl font-korolev text-[#065553] mb-6 tracking-wide">
              Our Story
            </h2>
            <div className="space-y-6 text-gray-600 font-['Verdana Pro Cond']">
              <p className="text-lg">
                It all started when I was 9 years old. I discovered my love for
                cooking by grilling vegetables in my kitchen, and over time, it
                became something much more than just a hobby. Cooking gave me the
                freedom to bring any dish I imagined to life, and it became a big
                part of who I am.
              </p>
              <p className="text-lg">
                But as I grew older, I started noticing something that didn't sit
                right with me. While I was experimenting with flavors and creating
                meals, there were people out there who didn't even have access to
                basic food. This realization hit me hard when I turned 16, and I
                couldn't shake the thought of how much food gets wasted while so
                many people go hungry.
              </p>
              <p className="text-lg">
                That's when the idea for this platform began. At 17, I decided to
                take action. I created FoodShare, a space where leftover food could
                be given a second chance—redistributed to people who need it most.
              </p>
              <p className="text-lg">
                This isn't just about food for me; it's about dignity, kindness,
                and building a community where we look out for each other. Every
                meal we save, every smile we see, reminds me why this is so
                important.
              </p>
              <p className="text-lg">
                This is my story, but it's also about us—about how we can all play
                a part in creating a world where food brings people together, not
                apart. Let's make it happen, one plate at a time.
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
