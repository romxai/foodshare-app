import React from "react";
import Image from "next/image";

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
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative w-full h-full max-w-4xl max-h-[80vh] bg-gray-800 rounded-lg overflow-hidden">
        <Image src={src} alt={alt} layout="fill" objectFit="contain" />
        <button
          className="absolute top-2 right-2 text-white text-2xl bg-gray-900 bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default FullScreenImage;
