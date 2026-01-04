import carGif from "@/assets/car-rotating.gif";

const ScrollingCar = () => {
  return (
    <section className="relative py-20 bg-black overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="relative animate-fade-in">
            <img
              src={carGif}
              alt="Rotating car"
              className="w-80 h-auto md:w-[400px] lg:w-[500px] object-contain"
            />
            {/* Blur overlay to hide watermark at bottom */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
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
