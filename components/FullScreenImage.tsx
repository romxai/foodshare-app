import React from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface FullScreenImageProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const FullScreenImage: React.FC<FullScreenImageProps> = ({
  src,
  alt,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative w-full h-full max-w-5xl max-h-[85vh] rounded-xl overflow-hidden">
        <div className="relative w-full h-full bg-[#F9F3F0]/10 rounded-xl">
          <Image 
            src={src} 
            alt={alt} 
            layout="fill" 
            objectFit="contain" 
            className="backdrop-blur-sm"
            quality={100}
            priority
          />
        </div>

        <button
          className="absolute top-4 right-4 text-[#F9F3F0] bg-[#1C716F] hover:bg-[#065553] 
                     transition-colors duration-200 rounded-full p-2 shadow-lg
                     flex items-center justify-center group"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close fullscreen image"
        >
          <X className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

export default FullScreenImage;
