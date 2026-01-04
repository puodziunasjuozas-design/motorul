import { useEffect, useState, useRef } from "react";
import carGif from "@/assets/car-rotating.gif";

const ScrollingCar = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [gifKey, setGifKey] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Start playing when scrolling
      if (!isScrolling) {
        setIsScrolling(true);
        // Force GIF to restart by changing key
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
            {isScrolling ? (
              <img
                key={gifKey}
                src={carGif}
                alt="Rotating car"
                className="w-64 h-auto md:w-80 lg:w-96 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              />
            ) : (
              <img
                src={carGif}
                alt="Car"
                className="w-64 h-auto md:w-80 lg:w-96 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                style={{ 
                  // Pause the GIF by using animation-play-state workaround
                  animationPlayState: "paused"
                }}
              />
            )}
          </div>
        </div>
        
        {/* Decorative glow under car */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-white/10 blur-xl rounded-full" />
      </div>
    </section>
  );
};

export default ScrollingCar;
