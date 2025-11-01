import { useEffect, useState } from 'react';
import splashLogo from '@/assets/splash-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start fade out after 1.7 seconds (leaving 0.2s for fade out animation)
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1700);

    // Call onComplete after full 1.9 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="animate-fade-in">
        <img 
          src={splashLogo} 
          alt="Minibørs" 
          className="w-[500px] max-w-[90vw] h-auto"
        />
      </div>
    </div>
  );
};
