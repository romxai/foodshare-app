import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

interface ImageCarouselProps {
  images: string[];
  onImageClick: (image: string) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, onImageClick }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (current === images.length - 1) {
        api.scrollTo(0, false);
      } else {
        api.scrollNext();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [api, current, images.length]);

  return (
    <Carousel className="w-full h-48" setApi={setApi}>
      <CarouselContent className="h-full">
        {images.map((image, index) => (
          <CarouselItem key={index} className="h-full">
            <div 
              className="relative w-full h-48" 
              onClick={() => onImageClick(image)}
            >
              <Image
                src={image}
                alt={`Image ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
                quality={75}
                loading={index === 0 ? "eager" : "lazy"}
                className="rounded-lg"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default ImageCarousel; 