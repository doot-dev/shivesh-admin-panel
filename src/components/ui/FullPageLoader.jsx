import React from "react";
import Spinner from "./Spinner";

const FullPageLoader = ({ 
  isVisible = false, 
  message = "Loading...", 
  spinnerSize = "w-16 h-16",
  spinnerVariant = "default"
}) => {
  // Temporarily keep loader visible for testing/development
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[#ffffff2b]  backdrop-blur-xs flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center p-8 ">
        <Spinner size={spinnerSize} variant={spinnerVariant} />
        {message && (
          <p className="mt-6 text-lg font-semibold text-gray-800 animate-pulse tracking-wide">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FullPageLoader;