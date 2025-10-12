import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ComingSoon = ({ 
  title = "Coming Soon", 
  subtitle = "Subscribe to the newsletter to stay in the latest news.",
  showCountdown = true,
  targetDate = "2024-12-31",
  showNotifyButton = true,
  brandName = "Shivesh Panel"
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (!showCountdown || !targetDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [showCountdown, targetDate]);

  const handleSubscribe = () => {
    if (!email.trim()) return;
    
    // Here you would typically send the email to your backend
    console.log("Subscribe email:", email);
    setIsSubscribed(true);
    setEmail("");
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubscribed(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Brand Name */}
        <h2 className="text-2xl font-bold text-gray-800 mb-16">
          {brandName}
        </h2>

        {/* Countdown Timer */}
        {showCountdown && (
          <div className="mb-16">
            <div className="flex justify-center space-x-8 mb-4">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="text-center">
                  <div className="text-6xl font-light text-gray-800 mb-2">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-orange-400 uppercase tracking-wider">
                    {unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Under Construction Badge */}
        <div className="inline-block px-4 py-1 bg-gray-200 text-gray-600 text-xs uppercase tracking-wide rounded-full mb-8">
          #underconstruction
        </div>

        {/* Main Title */}
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Coming Soon
        </h1>

       
      
      </div>
    </div>
  );
};

export default ComingSoon;