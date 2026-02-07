
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  imageUrl?: string; // Add this to allow easy image swapping
}

/**
 * SR StockMaster Logo Component
 * To change the logo to your own image:
 * Pass the 'imageUrl' prop like: <Logo imageUrl="/path/to/your/logo.png" />
 */
const Logo: React.FC<LogoProps> = ({ className = "", size = 40, imageUrl }) => {
  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt="SR StockMaster" 
        style={{ width: size, height: 'auto', objectFit: 'contain' }}
        className={className}
      />
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 400 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Crown */}
      <path 
        d="M200 150L130 50L170 110L200 20L230 110L270 50L200 150Z" 
        fill="#E31E24" 
      />
      <circle cx="130" cy="50" r="12" fill="#E31E24" />
      <circle cx="200" cy="20" r="12" fill="#E31E24" />
      <circle cx="270" cy="50" r="12" fill="#E31E24" />
      <circle cx="170" cy="110" r="8" fill="#E31E24" />
      <circle cx="230" cy="110" r="8" fill="#E31E24" />

      {/* Main Shield Shape - S (Left - Red) */}
      <path 
        d="M100 160H195V280L150 240L100 280V160Z" 
        fill="#E31E24" 
      />
      <path 
        d="M100 295L150 335V400L100 360V295Z" 
        fill="#E31E24" 
      />
      <path 
        d="M165 295L195 320V480L100 375V440L195 480V320L165 295Z" 
        fill="#E31E24" 
      />
      
      {/* Main Shield Shape - R (Right - Black) */}
      <path 
        d="M205 160H300V300L285 320L300 340V440L205 375V160Z" 
        fill="#231F20" 
      />
      
      <rect x="235" y="195" width="35" height="50" fill="white" />
      <path d="M300 300L280 325L300 350V300Z" fill="white" />
      <path d="M195 480L205 480L205 375L195 320V480Z" fill="#231F20" />
    </svg>
  );
};

export default Logo;
