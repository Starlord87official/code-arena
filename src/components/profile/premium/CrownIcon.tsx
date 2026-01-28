interface CrownIconProps {
  size?: number;
  className?: string;
}

export function CrownIcon({ size = 120, className = '' }: CrownIconProps) {
  const uniqueId = Math.random().toString(36).substr(2, 9);
  
  return (
    <svg 
      width={size} 
      height={size * 0.7} 
      viewBox="0 0 200 140" 
      className={className}
      style={{
        filter: `drop-shadow(0 0 12px hsla(45, 90%, 50%, 0.4)) drop-shadow(0 0 24px hsla(45, 90%, 50%, 0.2))`,
      }}
    >
      <defs>
        {/* Gold gradient - base metal */}
        <linearGradient id={`goldBase-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="30%" stopColor="#FFC200" />
          <stop offset="50%" stopColor="#DAA520" />
          <stop offset="70%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        
        {/* Gold gradient - highlights */}
        <linearGradient id={`goldHighlight-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="20%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="80%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        
        {/* Gold gradient - darker shade for depth */}
        <linearGradient id={`goldDark-${uniqueId}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#5C4A1F" />
          <stop offset="40%" stopColor="#8B6914" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        
        {/* Gem gradient - blue faceted */}
        <radialGradient id={`gemBlue-${uniqueId}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="15%" stopColor="#00FFFF" />
          <stop offset="40%" stopColor="#00BFFF" />
          <stop offset="70%" stopColor="#1E90FF" />
          <stop offset="100%" stopColor="#0066CC" />
        </radialGradient>
        
        {/* Gem inner glow */}
        <radialGradient id={`gemGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0066CC" stopOpacity="0" />
        </radialGradient>
        
        {/* Crown base band gradient */}
        <linearGradient id={`bandGold-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="25%" stopColor="#FFC200" />
          <stop offset="50%" stopColor="#DAA520" />
          <stop offset="75%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#6B4E0B" />
        </linearGradient>
        
        {/* Subtle blue rim light for gems */}
        <filter id={`gemFilter-${uniqueId}`}>
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Crown Base Band */}
      <path 
        d="M25 115 Q30 105, 50 102 L150 102 Q170 105, 175 115 L180 125 Q100 130, 20 125 Z"
        fill={`url(#bandGold-${uniqueId})`}
        stroke="#8B6914"
        strokeWidth="1"
      />
      
      {/* Band highlight line */}
      <path 
        d="M35 108 Q100 104, 165 108"
        fill="none"
        stroke="#FFE4B5"
        strokeWidth="1.5"
        opacity="0.6"
      />
      
      {/* Crown Body - Main shape with 5 points */}
      <path 
        d="M50 102 
           L35 75 L55 55 L45 25
           L65 45 L85 20
           L100 8
           L115 20 L135 45
           L155 25 L145 55 L165 75
           L150 102
           Z"
        fill={`url(#goldBase-${uniqueId})`}
        stroke="#8B6914"
        strokeWidth="1.5"
      />
      
      {/* Crown inner detail lines - left side */}
      <path 
        d="M50 100 L42 78 L58 58 L52 35"
        fill="none"
        stroke="#B8860B"
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Crown inner detail lines - right side */}
      <path 
        d="M150 100 L158 78 L142 58 L148 35"
        fill="none"
        stroke="#B8860B"
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Crown inner detail lines - center */}
      <path 
        d="M100 95 L100 20"
        fill="none"
        stroke="#B8860B"
        strokeWidth="1"
        opacity="0.3"
      />
      
      {/* Highlight edges on crown points */}
      <path 
        d="M45 25 L65 45 L85 20 L100 8 L115 20 L135 45 L155 25"
        fill="none"
        stroke="#FFE4B5"
        strokeWidth="2"
        opacity="0.7"
      />
      
      {/* Secondary highlight */}
      <path 
        d="M55 55 L65 45 L85 20 L100 8 L115 20 L135 45 L145 55"
        fill="none"
        stroke="#FFFACD"
        strokeWidth="1"
        opacity="0.4"
      />
      
      {/* CENTER GEM (Largest) */}
      <g filter={`url(#gemFilter-${uniqueId})`}>
        {/* Gem glow background */}
        <ellipse cx="100" cy="22" rx="14" ry="12" fill={`url(#gemGlow-${uniqueId})`} opacity="0.6" />
        {/* Main gem shape - faceted */}
        <path 
          d="M100 10 L112 18 L110 30 L100 34 L90 30 L88 18 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        {/* Gem facet lines */}
        <path d="M100 10 L100 34" stroke="#0088CC" strokeWidth="0.5" opacity="0.5" />
        <path d="M88 18 L112 18" stroke="#0088CC" strokeWidth="0.5" opacity="0.3" />
        {/* Gem highlight */}
        <ellipse cx="94" cy="16" rx="4" ry="3" fill="#FFFFFF" opacity="0.7" />
      </g>
      
      {/* LEFT-CENTER GEM */}
      <g filter={`url(#gemFilter-${uniqueId})`}>
        <ellipse cx="72" cy="38" rx="10" ry="9" fill={`url(#gemGlow-${uniqueId})`} opacity="0.5" />
        <path 
          d="M72 29 L81 35 L79 45 L72 48 L65 45 L63 35 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <ellipse cx="68" cy="33" rx="3" ry="2" fill="#FFFFFF" opacity="0.6" />
      </g>
      
      {/* RIGHT-CENTER GEM */}
      <g filter={`url(#gemFilter-${uniqueId})`}>
        <ellipse cx="128" cy="38" rx="10" ry="9" fill={`url(#gemGlow-${uniqueId})`} opacity="0.5" />
        <path 
          d="M128 29 L137 35 L135 45 L128 48 L121 45 L119 35 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <ellipse cx="124" cy="33" rx="3" ry="2" fill="#FFFFFF" opacity="0.6" />
      </g>
      
      {/* LEFT OUTER GEM (smaller) */}
      <g filter={`url(#gemFilter-${uniqueId})`}>
        <ellipse cx="50" cy="48" rx="8" ry="7" fill={`url(#gemGlow-${uniqueId})`} opacity="0.4" />
        <path 
          d="M50 41 L57 46 L55 54 L50 57 L45 54 L43 46 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <ellipse cx="47" cy="44" rx="2" ry="1.5" fill="#FFFFFF" opacity="0.6" />
      </g>
      
      {/* RIGHT OUTER GEM (smaller) */}
      <g filter={`url(#gemFilter-${uniqueId})`}>
        <ellipse cx="150" cy="48" rx="8" ry="7" fill={`url(#gemGlow-${uniqueId})`} opacity="0.4" />
        <path 
          d="M150 41 L157 46 L155 54 L150 57 L145 54 L143 46 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <ellipse cx="147" cy="44" rx="2" ry="1.5" fill="#FFFFFF" opacity="0.6" />
      </g>
      
      {/* Crown band decorative gems */}
      <circle cx="70" cy="112" r="4" fill={`url(#gemBlue-${uniqueId})`} />
      <circle cx="100" cy="110" r="5" fill={`url(#gemBlue-${uniqueId})`} />
      <circle cx="130" cy="112" r="4" fill={`url(#gemBlue-${uniqueId})`} />
      
      {/* Band gem highlights */}
      <circle cx="68" cy="110" r="1.5" fill="#FFFFFF" opacity="0.7" />
      <circle cx="98" cy="108" r="2" fill="#FFFFFF" opacity="0.7" />
      <circle cx="128" cy="110" r="1.5" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
}
