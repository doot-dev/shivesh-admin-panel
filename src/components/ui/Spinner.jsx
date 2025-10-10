import React from "react";

const Spinner = () => {
  // Default spinner with gradient
  //   if (variant === "default") {
  //     return (
  //       <div className="flex items-center justify-center">
  //         <div className="relative">
  //           <div
  //             className={`rounded-full border-4 border-gray-200 ${size} animate-spin`}
  //             style={{
  //               borderTopColor: '#3B82F6',
  //               borderRightColor: '#60A5FA',
  //               borderBottomColor: 'transparent',
  //               borderLeftColor: 'transparent',
  //               animationDuration: '1s',
  //               filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
  //             }}
  //             role="status"
  //             aria-label="Loading"
  //           ></div>
  //           {/* Inner glow effect */}
  //           <div
  //             className={`absolute inset-0 rounded-full ${size} animate-pulse`}
  //             style={{
  //               background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
  //               animationDuration: '2s'
  //             }}
  //           ></div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   // Pulsing dots variant
  //   if (variant === "dots") {
  //     return (
  //       <div className="flex items-center justify-center space-x-2">
  //         <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
  //         <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
  //         <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
  //       </div>
  //     );
  //   }

  //   // Double ring variant
  //   if (variant === "ring") {
  //     return (
  //       <div className="flex items-center justify-center">
  //         <div className="relative">
  //           {/* Outer ring */}
  //           <div
  //             className={`rounded-full border-4 border-transparent ${size} animate-spin`}
  //             style={{
  //               borderTopColor: '#3B82F6',
  //               borderRightColor: '#60A5FA',
  //               animationDuration: '1s'
  //             }}
  //           ></div>
  //           {/* Inner ring */}
  //           <div
  //             className="absolute inset-2 rounded-full border-4 border-transparent animate-spin"
  //             style={{
  //               borderTopColor: '#93C5FD',
  //               borderLeftColor: '#DBEAFE',
  //               animationDuration: '1.5s',
  //               animationDirection: 'reverse'
  //             }}
  //           ></div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   // Elegant pulse variant
  //   if (variant === "pulse") {
  //     return (
  //       <div className="flex items-center justify-center">
  //         <div className="relative">
  //           <div
  //             className={`rounded-full bg-gradient-to-r from-blue-400 to-blue-600 ${size} animate-pulse`}
  //             style={{ animationDuration: '1.5s' }}
  //           ></div>
  //           <div
  //             className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-300 to-blue-500 ${size} animate-ping opacity-75`}
  //             style={{ animationDuration: '2s' }}
  //           ></div>
  //         </div>
  //       </div>
  //     );
  //   }

  // Original spinner (fallback)
  return (
    <div
      className="w-20 h-20 rounded-full animate-spin
                    border-y-2 border-solid border-blue-500 border-t-transparent"
    ></div>
  );
};

export default Spinner;
