import { TypewriterEffectSmooth } from "../components/ui/Typewriter";
import { Link } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";

const HomePage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const words = useMemo(
    () => [
      { text: "Welcome", className: "text-green-800 text-xl sm:text-2xl md:text-3xl lg:text-4xl" },
      { text: "to", className: "text-gray-600 text-xl sm:text-2xl md:text-3xl lg:text-4xl" },
      { text: "Lawyal", className: "text-green-600 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl" },
      { text: "Tech", className: "text-gray-700 text-xl sm:text-2xl md:text-3xl lg:text-4xl" },
    ],
    []
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-green-100 p-4 sm:p-8 md:p-12 text-center">
      <header className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="sr-only">Welcome to Lawyal Tech</h1>
        <div className="mb-6 sm:mb-10 flex justify-center">
          <TypewriterEffectSmooth
            words={words}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center"
            cursorClassName="h-6 sm:h-8 md:h-10"
            aria-label="Welcome to Lawyal Tech"
          />
        </div>
        <nav className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4 justify-center`}>
          <Link to="/login" className="w-full sm:w-auto" aria-label="Navigate to login page">
            <button className="w-full sm:w-48 px-4 sm:px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-xl text-base bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Login
            </button>
          </Link>
          <Link to="/signup" className="w-full sm:w-auto" aria-label="Navigate to signup page">
            <button className="w-full sm:w-48 px-4 sm:px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-xl text-base bg-white text-green-600 border border-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Signup
            </button>
          </Link>
        </nav>
      </header>
      <section className="w-full max-w-5xl mt-10" aria-label="Product demonstration">
        <div className="rounded-xl overflow-hidden shadow-xl border-2 sm:border-4 border-white">
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <video
              className="absolute top-0 left-0 w-full h-full object-cover"
              controls
              autoPlay
              muted
              loop
              playsInline
              aria-label="Demo video of Lawyal Tech gaming technology"
              poster="/video-poster.jpg"
              preload="metadata"
            >
              <source src="/video.mp4" type="video/mp4" />
              <track kind="captions" src="/captions.vtt" srcLang="en" label="English" default />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;