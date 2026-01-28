import { useMemo } from 'react';

type CrownVariant = 'solo' | 'duo' | 'clan' | 'clan-alt';

interface CrownIconProps {
  size?: number;
  variant?: CrownVariant;
  className?: string;
}

export function CrownIcon({ size = 140, variant = 'solo', className = '' }: CrownIconProps) {
  const uniqueId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  
  // Variant-specific adjustments
  const gemIntensity = variant === 'clan' || variant === 'clan-alt' ? 1.2 : 1;
  const glowIntensity = variant === 'solo' ? 0.5 : variant === 'duo' ? 0.6 : 0.7;
  
  return (
    <svg 
      width={size} 
      height={size * 0.75} 
      viewBox="0 0 280 210" 
      className={className}
      style={{
        filter: `drop-shadow(0 4px 20px hsla(45, 100%, 50%, ${glowIntensity})) drop-shadow(0 0 40px hsla(45, 100%, 45%, 0.3))`,
      }}
    >
      <defs>
        {/* === GOLD GRADIENTS === */}
        {/* Main gold body gradient */}
        <linearGradient id={`goldBody-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8E1" />
          <stop offset="8%" stopColor="#FFE082" />
          <stop offset="20%" stopColor="#FFD54F" />
          <stop offset="35%" stopColor="#FFCA28" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="65%" stopColor="#FFB300" />
          <stop offset="80%" stopColor="#FF8F00" />
          <stop offset="92%" stopColor="#E65100" />
          <stop offset="100%" stopColor="#BF360C" />
        </linearGradient>
        
        {/* Rich metallic highlight */}
        <linearGradient id={`goldHighlight-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="15%" stopColor="#FFF9C4" />
          <stop offset="40%" stopColor="#FFE082" />
          <stop offset="60%" stopColor="#FFD54F" />
          <stop offset="85%" stopColor="#FFCA28" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
        
        {/* Deep gold shadow */}
        <linearGradient id={`goldShadow-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF8F00" />
          <stop offset="30%" stopColor="#E65100" />
          <stop offset="60%" stopColor="#BF360C" />
          <stop offset="100%" stopColor="#4E342E" />
        </linearGradient>
        
        {/* Warm edge highlight */}
        <linearGradient id={`goldEdge-${uniqueId}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="50%" stopColor="#FFE082" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
        
        {/* Crown base band gradient */}
        <linearGradient id={`bandGold-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="15%" stopColor="#FFD54F" />
          <stop offset="35%" stopColor="#FFCA28" />
          <stop offset="55%" stopColor="#FFB300" />
          <stop offset="75%" stopColor="#FF8F00" />
          <stop offset="100%" stopColor="#6D4C00" />
        </linearGradient>
        
        {/* Band inner shadow */}
        <linearGradient id={`bandShadow-${uniqueId}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3E2723" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3E2723" stopOpacity="0" />
        </linearGradient>
        
        {/* === GEM GRADIENTS === */}
        {/* Blue diamond main */}
        <linearGradient id={`gemBlue-${uniqueId}`} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#E0F7FA" />
          <stop offset="15%" stopColor="#80DEEA" />
          <stop offset="35%" stopColor="#26C6DA" />
          <stop offset="55%" stopColor="#00ACC1" />
          <stop offset="75%" stopColor="#0097A7" />
          <stop offset="100%" stopColor="#006064" />
        </linearGradient>
        
        {/* Gem facet light */}
        <linearGradient id={`gemFacetLight-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#B2EBF2" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4DD0E1" stopOpacity="0.3" />
        </linearGradient>
        
        {/* Gem facet dark */}
        <linearGradient id={`gemFacetDark-${uniqueId}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00838F" />
          <stop offset="50%" stopColor="#006064" />
          <stop offset="100%" stopColor="#004D40" />
        </linearGradient>
        
        {/* Gem inner glow */}
        <radialGradient id={`gemGlow-${uniqueId}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#00FFFF" stopOpacity={0.9 * gemIntensity} />
          <stop offset="40%" stopColor="#00BCD4" stopOpacity={0.5 * gemIntensity} />
          <stop offset="100%" stopColor="#006064" stopOpacity="0" />
        </radialGradient>
        
        {/* Gem bloom effect */}
        <radialGradient id={`gemBloom-${uniqueId}`} cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#00BCD4" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#00BCD4" stopOpacity="0" />
        </radialGradient>
        
        {/* === FILTERS === */}
        <filter id={`gemBlur-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <filter id={`innerShadow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dx="0" dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite operator="out" in="SourceGraphic" result="shadow" />
          <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0  0 0 0 0.5 0" />
          <feComposite operator="over" in="SourceGraphic" />
        </filter>
        
        {/* Metallic noise texture */}
        <pattern id={`noise-${uniqueId}`} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="transparent" />
          {Array.from({ length: 30 }).map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 100}
              cy={Math.random() * 100}
              r={Math.random() * 0.8 + 0.2}
              fill="#FFFFFF"
              opacity={Math.random() * 0.15 + 0.05}
            />
          ))}
        </pattern>
      </defs>
      
      {/* === AMBIENT SHADOW === */}
      <ellipse cx="140" cy="195" rx="80" ry="12" fill="#000000" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.4;0.3" dur="3s" repeatCount="indefinite" />
      </ellipse>
      
      {/* === CROWN BASE BAND === */}
      <g filter={`url(#innerShadow-${uniqueId})`}>
        {/* Band main shape */}
        <path 
          d="M40 165 
             Q45 150, 80 145 
             L200 145 
             Q235 150, 240 165 
             L245 180 
             Q140 188, 35 180 
             Z"
          fill={`url(#bandGold-${uniqueId})`}
        />
        
        {/* Band inner shadow overlay */}
        <path 
          d="M40 165 
             Q45 150, 80 145 
             L200 145 
             Q235 150, 240 165 
             L245 180 
             Q140 188, 35 180 
             Z"
          fill={`url(#bandShadow-${uniqueId})`}
          opacity="0.4"
        />
        
        {/* Band highlight line top */}
        <path 
          d="M55 152 Q140 146, 225 152"
          fill="none"
          stroke="#FFFDE7"
          strokeWidth="2"
          opacity="0.8"
        />
        
        {/* Band decorative ridge */}
        <path 
          d="M50 162 Q140 158, 230 162"
          fill="none"
          stroke="#FFB300"
          strokeWidth="1.5"
          opacity="0.6"
        />
        
        {/* Band texture overlay */}
        <path 
          d="M40 165 Q45 150, 80 145 L200 145 Q235 150, 240 165 L245 180 Q140 188, 35 180 Z"
          fill={`url(#noise-${uniqueId})`}
          opacity="0.3"
        />
      </g>
      
      {/* === CROWN MAIN BODY === */}
      <g filter={`url(#innerShadow-${uniqueId})`}>
        {/* Crown main silhouette - elegant curved tips */}
        <path 
          d="M80 145
             L55 115 
             Q50 95, 55 75 
             Q60 55, 48 30
             Q55 45, 75 50
             Q85 35, 90 20
             Q95 35, 110 45
             Q125 25, 140 12
             Q155 25, 170 45
             Q185 35, 190 20
             Q195 35, 205 50
             Q225 45, 232 30
             Q220 55, 225 75
             Q230 95, 225 115
             L200 145
             Z"
          fill={`url(#goldBody-${uniqueId})`}
        />
        
        {/* Crown highlight overlay */}
        <path 
          d="M80 145
             L55 115 
             Q50 95, 55 75 
             Q60 55, 48 30
             Q55 45, 75 50
             Q85 35, 90 20
             Q95 35, 110 45
             Q125 25, 140 12
             Q155 25, 170 45
             Q185 35, 190 20
             Q195 35, 205 50
             Q225 45, 232 30
             Q220 55, 225 75
             Q230 95, 225 115
             L200 145
             Z"
          fill={`url(#goldHighlight-${uniqueId})`}
          opacity="0.4"
        />
        
        {/* Texture overlay */}
        <path 
          d="M80 145 L55 115 Q50 95, 55 75 Q60 55, 48 30 Q55 45, 75 50 Q85 35, 90 20 Q95 35, 110 45 Q125 25, 140 12 Q155 25, 170 45 Q185 35, 190 20 Q195 35, 205 50 Q225 45, 232 30 Q220 55, 225 75 Q230 95, 225 115 L200 145 Z"
          fill={`url(#noise-${uniqueId})`}
          opacity="0.2"
        />
        
        {/* Crown edge highlights */}
        <path 
          d="M48 30 Q55 45, 75 50 Q85 35, 90 20 Q95 35, 110 45 Q125 25, 140 12 Q155 25, 170 45 Q185 35, 190 20 Q195 35, 205 50 Q225 45, 232 30"
          fill="none"
          stroke="#FFFDE7"
          strokeWidth="2.5"
          opacity="0.9"
          strokeLinecap="round"
        />
        
        {/* Secondary edge glow */}
        <path 
          d="M48 30 Q55 45, 75 50 Q85 35, 90 20 Q95 35, 110 45 Q125 25, 140 12 Q155 25, 170 45 Q185 35, 190 20 Q195 35, 205 50 Q225 45, 232 30"
          fill="none"
          stroke="#FFE082"
          strokeWidth="4"
          opacity="0.3"
          strokeLinecap="round"
        />
        
        {/* Inner architectural lines */}
        <path d="M75 50 L85 100" stroke="#BF360C" strokeWidth="1" opacity="0.3" />
        <path d="M110 45 L115 95" stroke="#BF360C" strokeWidth="1" opacity="0.3" />
        <path d="M140 12 L140 90" stroke="#BF360C" strokeWidth="1.5" opacity="0.25" />
        <path d="M170 45 L165 95" stroke="#BF360C" strokeWidth="1" opacity="0.3" />
        <path d="M205 50 L195 100" stroke="#BF360C" strokeWidth="1" opacity="0.3" />
        
        {/* Decorative engraving lines */}
        <path d="M90 80 Q140 70, 190 80" stroke="#FFE082" strokeWidth="1" opacity="0.4" fill="none" />
        <path d="M100 100 Q140 92, 180 100" stroke="#FFE082" strokeWidth="1" opacity="0.3" fill="none" />
      </g>
      
      {/* === DIAMOND GEMS === */}
      
      {/* CENTER GEM (Largest) */}
      <g filter={`url(#gemBlur-${uniqueId})`}>
        {/* Bloom effect */}
        <ellipse cx="140" cy="35" rx="22" ry="20" fill={`url(#gemBloom-${uniqueId})`} />
        
        {/* Glow base */}
        <ellipse cx="140" cy="35" rx="16" ry="14" fill={`url(#gemGlow-${uniqueId})`} />
        
        {/* Diamond shape - main body */}
        <path 
          d="M140 15 L156 30 L156 42 L140 55 L124 42 L124 30 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        
        {/* Left facet (light) */}
        <path 
          d="M140 15 L124 30 L124 42 L140 35 Z"
          fill={`url(#gemFacetLight-${uniqueId})`}
          opacity="0.6"
        />
        
        {/* Right facet (dark) */}
        <path 
          d="M140 15 L156 30 L156 42 L140 35 Z"
          fill={`url(#gemFacetDark-${uniqueId})`}
          opacity="0.4"
        />
        
        {/* Bottom facet */}
        <path 
          d="M124 42 L140 55 L156 42 L140 35 Z"
          fill="#004D40"
          opacity="0.5"
        />
        
        {/* Top highlight */}
        <path 
          d="M135 18 L140 15 L145 18 L142 24 L138 24 Z"
          fill="#FFFFFF"
          opacity="0.85"
        />
        
        {/* Sparkle */}
        <circle cx="132" cy="25" r="2" fill="#FFFFFF" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* LEFT-CENTER GEM */}
      <g filter={`url(#gemBlur-${uniqueId})`}>
        <ellipse cx="90" cy="42" rx="16" ry="14" fill={`url(#gemBloom-${uniqueId})`} />
        <ellipse cx="90" cy="42" rx="12" ry="10" fill={`url(#gemGlow-${uniqueId})`} />
        
        <path 
          d="M90 26 L103 38 L103 48 L90 58 L77 48 L77 38 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <path 
          d="M90 26 L77 38 L77 48 L90 42 Z"
          fill={`url(#gemFacetLight-${uniqueId})`}
          opacity="0.6"
        />
        <path 
          d="M90 26 L103 38 L103 48 L90 42 Z"
          fill={`url(#gemFacetDark-${uniqueId})`}
          opacity="0.4"
        />
        <path 
          d="M86 29 L90 26 L94 29 L91 34 L89 34 Z"
          fill="#FFFFFF"
          opacity="0.8"
        />
        <circle cx="83" cy="34" r="1.5" fill="#FFFFFF" opacity="0.85">
          <animate attributeName="opacity" values="0.85;0.3;0.85" dur="2.5s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* RIGHT-CENTER GEM */}
      <g filter={`url(#gemBlur-${uniqueId})`}>
        <ellipse cx="190" cy="42" rx="16" ry="14" fill={`url(#gemBloom-${uniqueId})`} />
        <ellipse cx="190" cy="42" rx="12" ry="10" fill={`url(#gemGlow-${uniqueId})`} />
        
        <path 
          d="M190 26 L203 38 L203 48 L190 58 L177 48 L177 38 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <path 
          d="M190 26 L177 38 L177 48 L190 42 Z"
          fill={`url(#gemFacetLight-${uniqueId})`}
          opacity="0.6"
        />
        <path 
          d="M190 26 L203 38 L203 48 L190 42 Z"
          fill={`url(#gemFacetDark-${uniqueId})`}
          opacity="0.4"
        />
        <path 
          d="M186 29 L190 26 L194 29 L191 34 L189 34 Z"
          fill="#FFFFFF"
          opacity="0.8"
        />
        <circle cx="183" cy="34" r="1.5" fill="#FFFFFF" opacity="0.85">
          <animate attributeName="opacity" values="0.85;0.5;0.85" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* LEFT OUTER GEM (smaller) */}
      <g filter={`url(#gemBlur-${uniqueId})`}>
        <ellipse cx="58" cy="55" rx="12" ry="10" fill={`url(#gemBloom-${uniqueId})`} />
        <ellipse cx="58" cy="55" rx="9" ry="7" fill={`url(#gemGlow-${uniqueId})`} />
        
        <path 
          d="M58 43 L68 52 L68 60 L58 68 L48 60 L48 52 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <path 
          d="M58 43 L48 52 L48 60 L58 55 Z"
          fill={`url(#gemFacetLight-${uniqueId})`}
          opacity="0.6"
        />
        <path 
          d="M55 45 L58 43 L61 45 L59 49 L57 49 Z"
          fill="#FFFFFF"
          opacity="0.75"
        />
        <circle cx="52" cy="49" r="1.2" fill="#FFFFFF" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* RIGHT OUTER GEM (smaller) */}
      <g filter={`url(#gemBlur-${uniqueId})`}>
        <ellipse cx="222" cy="55" rx="12" ry="10" fill={`url(#gemBloom-${uniqueId})`} />
        <ellipse cx="222" cy="55" rx="9" ry="7" fill={`url(#gemGlow-${uniqueId})`} />
        
        <path 
          d="M222 43 L232 52 L232 60 L222 68 L212 60 L212 52 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <path 
          d="M222 43 L212 52 L212 60 L222 55 Z"
          fill={`url(#gemFacetLight-${uniqueId})`}
          opacity="0.6"
        />
        <path 
          d="M219 45 L222 43 L225 45 L223 49 L221 49 Z"
          fill="#FFFFFF"
          opacity="0.75"
        />
        <circle cx="216" cy="49" r="1.2" fill="#FFFFFF" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2.7s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* === BAND DECORATIVE GEMS === */}
      {/* Left band gem */}
      <g>
        <ellipse cx="90" cy="162" rx="8" ry="6" fill={`url(#gemBloom-${uniqueId})`} opacity="0.5" />
        <path 
          d="M90 155 L97 160 L97 166 L90 171 L83 166 L83 160 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <circle cx="86" cy="158" r="1" fill="#FFFFFF" opacity="0.8" />
      </g>
      
      {/* Center band gem (larger) */}
      <g>
        <ellipse cx="140" cy="160" rx="10" ry="8" fill={`url(#gemBloom-${uniqueId})`} opacity="0.6" />
        <path 
          d="M140 151 L149 157 L149 165 L140 172 L131 165 L131 157 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <circle cx="135" cy="154" r="1.5" fill="#FFFFFF" opacity="0.85" />
      </g>
      
      {/* Right band gem */}
      <g>
        <ellipse cx="190" cy="162" rx="8" ry="6" fill={`url(#gemBloom-${uniqueId})`} opacity="0.5" />
        <path 
          d="M190 155 L197 160 L197 166 L190 171 L183 166 L183 160 Z"
          fill={`url(#gemBlue-${uniqueId})`}
        />
        <circle cx="186" cy="158" r="1" fill="#FFFFFF" opacity="0.8" />
      </g>
      
      {/* === FLOATING PARTICLE SPARKLES === */}
      <g opacity="0.8">
        <circle cx="45" cy="60" r="1" fill="#FFE082">
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="0s" />
          <animate attributeName="cy" values="60;55;60" dur="3s" repeatCount="indefinite" begin="0s" />
        </circle>
        <circle cx="235" cy="65" r="1.2" fill="#FFE082">
          <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
          <animate attributeName="cy" values="65;60;65" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="120" cy="25" r="0.8" fill="#FFFFFF">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s" />
        </circle>
        <circle cx="160" cy="28" r="0.8" fill="#FFFFFF">
          <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="70" cy="45" r="0.6" fill="#00FFFF">
          <animate attributeName="opacity" values="0;0.8;0" dur="1.8s" repeatCount="indefinite" begin="0.7s" />
        </circle>
        <circle cx="210" cy="48" r="0.6" fill="#00FFFF">
          <animate attributeName="opacity" values="0;0.8;0" dur="2.1s" repeatCount="indefinite" begin="1.2s" />
        </circle>
        <circle cx="140" cy="5" r="1" fill="#FFD54F">
          <animate attributeName="opacity" values="0;1;0" dur="2.8s" repeatCount="indefinite" begin="0.2s" />
        </circle>
        <circle cx="55" cy="100" r="0.5" fill="#FFE082">
          <animate attributeName="opacity" values="0;0.6;0" dur="3.2s" repeatCount="indefinite" begin="1.5s" />
        </circle>
        <circle cx="225" cy="95" r="0.5" fill="#FFE082">
          <animate attributeName="opacity" values="0;0.6;0" dur="2.9s" repeatCount="indefinite" begin="0.8s" />
        </circle>
      </g>
      
      {/* Variant-specific marks */}
      {variant === 'duo' && (
        <g opacity="0.5">
          <path d="M130 125 L140 115 L150 125" stroke="#FFE082" strokeWidth="1.5" fill="none" />
          <path d="M130 130 L140 120 L150 130" stroke="#FFE082" strokeWidth="1" fill="none" />
        </g>
      )}
      
      {(variant === 'clan' || variant === 'clan-alt') && (
        <g opacity="0.5">
          <path d="M125 125 L140 110 L155 125" stroke="#FFE082" strokeWidth="1.5" fill="none" />
          <path d="M128 130 L140 118 L152 130" stroke="#FFE082" strokeWidth="1" fill="none" />
          <path d="M131 135 L140 126 L149 135" stroke="#FFE082" strokeWidth="0.8" fill="none" />
        </g>
      )}
    </svg>
  );
}
