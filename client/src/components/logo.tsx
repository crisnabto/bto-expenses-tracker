import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Logo Container */}
        <div className="flex items-center space-x-3">
          {/* Icon part */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                className="w-7 h-7 text-white"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            {/* Decorative dot */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-md"></div>
          </div>
          
          {/* Text part */}
          <div className="flex flex-col">
            <h1 className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${sizeClasses[size]} leading-tight`}>
              BTO
            </h1>
            <p className="text-sm font-medium text-gray-600 tracking-wide -mt-1">
              EXPENSES
            </p>
          </div>
        </div>
        
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl -z-10 opacity-30 blur-sm transform scale-110"></div>
      </div>
    </div>
  );
}
