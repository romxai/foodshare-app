import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ImageCarouselProps {
  images: string[];
  onImageClick: (image: string) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, onImageClick }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 2000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative h-full">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] h-full min-w-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative h-full w-full cursor-pointer"
                onClick={() => onImageClick(image.startsWith("/") ? image : `/${image}`)}
              >
                <Image
                  src={image.startsWith("/") ? image : `/${image}`}
                  alt={`Image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-xl md:rounded-t-none md:rounded-l-xl"
                  priority={index === 0}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === selectedIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel; 