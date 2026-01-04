import { useEffect, useState, useRef } from "react";
import carGif from "@/assets/car-rotating.gif";

const ScrollingCar = () => {
  const [rotation, setRotation] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the section is visible
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Start rotating when section enters viewport
      if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
        const progress = (windowHeight - sectionTop) / (windowHeight + sectionHeight);
        const newRotation = progress * 360;
        setRotation(newRotation);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 bg-black overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <div 
          className="flex justify-center items-center"
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative transition-transform duration-100 ease-out"
            style={{
              transform: `rotateY(${rotation}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <img
              src={carGif}
              alt="Rotating car"
              className="w-64 h-auto md:w-80 lg:w-96 object-contain drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]"
            />
          </div>
        </div>
        
        {/* Decorative glow under car */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-red-600/20 blur-xl rounded-full" />
      </div>
    </section>
  );
};

export default ScrollingCar;
