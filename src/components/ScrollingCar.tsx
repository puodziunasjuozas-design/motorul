import { useEffect, useState, useRef } from "react";
import carGif from "@/assets/car-rotating.gif";

const ScrollingCar = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
  const [gifKey, setGifKey] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Detect scroll direction
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up");
      }
      lastScrollY.current = currentScrollY;

      // Start playing when scrolling
      if (!isScrolling) {
        setIsScrolling(true);
        setGifKey(prev => prev + 1);
      }

      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to stop GIF when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isScrolling]);

  return (
    <section className="relative py-16 bg-black overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="relative">
            <img
              key={isScrolling ? gifKey : "static"}
              src={carGif}
              alt="Rotating car"
              className="w-64 h-auto md:w-80 lg:w-96 object-contain transition-transform duration-100"
              style={{ 
                transform: scrollDirection === "up" ? "scaleX(-1)" : "scaleX(1)"
              }}
            />
            {/* Blur overlay to hide watermark at bottom */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
              style={{
                background: "linear-gradient(to top, black 0%, black 40%, transparent 100%)"
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollingCar;
