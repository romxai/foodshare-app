import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#065553] text-[#F9F3F0] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-korolev tracking-wide">FoodShare</h3>
            <p className="text-sm font-['Verdana Pro Cond']">
              Making food sharing simple and accessible for everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-korolev tracking-wide">Quick Links</h3>
            <ul className="space-y-2 font-['Verdana Pro Cond']">
              <li>
                <a href="/" className="hover:text-[#CCD9BF] transition-colors">Home</a>
              </li>
              <li>
                <a href="/#about" className="hover:text-[#CCD9BF] transition-colors">About Us</a>
              </li>
              <li>
                <a href="/listings" className="hover:text-[#CCD9BF] transition-colors">Food Listings</a>
              </li>
              <li>
                <a href="/signup" className="hover:text-[#CCD9BF] transition-colors">Sign Up</a>
              </li>
            </ul>
          </div>

          {/* User Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-korolev tracking-wide">User</h3>
            <ul className="space-y-2 font-['Verdana Pro Cond']">
              <li>
                <a href="/account" className="hover:text-[#CCD9BF] transition-colors">My Account</a>
              </li>
              <li>
                <a href="/settings" className="hover:text-[#CCD9BF] transition-colors">Settings</a>
              </li>
              <li>
                <a href="/create-listing" className="hover:text-[#CCD9BF] transition-colors">Create Listing</a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-xl font-korolev tracking-wide">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#CCD9BF] transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#CCD9BF] transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#CCD9BF] transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#CCD9BF] transition-colors"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="mailto:contact@foodshare.com"
                className="hover:text-[#CCD9BF] transition-colors"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-[#F9F3F0] opacity-60 text-center font-['Verdana Pro Cond']">
          <p>&copy; {new Date().getFullYear()} FoodShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 