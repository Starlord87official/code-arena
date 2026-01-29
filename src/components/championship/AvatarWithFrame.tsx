import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { FrameRarity, FRAMES, TrackType } from "@/lib/championshipData";

interface AvatarWithFrameProps {
  src?: string;
  username: string;
  size?: "sm" | "md" | "lg" | "xl";
  frame?: FrameRarity;
  crown?: {
    track: TrackType;
    year: number;
  };
  showHoverCard?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20"
};

const frameSizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24"
};

const crownSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6"
};

const crownOffsetClasses = {
  sm: "-top-1.5 -right-0.5",
  md: "-top-2 -right-1",
  lg: "-top-2.5 -right-1.5",
  xl: "-top-3 -right-2"
};

const TrackIcon = ({ track, className }: { track: TrackType; className?: string }) => {
  switch (track) {
    case 'solo':
      return <User className={className} />;
    case 'duo':
      return <Users className={className} />;
    case 'clan':
      return <Shield className={className} />;
    default:
      return null;
  }
};

export function AvatarWithFrame({
  src,
  username,
  size = "md",
  frame,
  crown,
  showHoverCard = true,
  className,
  onClick
}: AvatarWithFrameProps) {
  const frameConfig = frame ? FRAMES[frame] : null;
  const initials = username.slice(0, 2).toUpperCase();

  const avatarContent = (
    <div 
      className={cn(
        "relative inline-flex items-center justify-center cursor-pointer",
        onClick && "hover:scale-105 transition-transform",
        className
      )}
      onClick={onClick}
    >
      {/* Frame Ring */}
      {frameConfig && (
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            frameSizeClasses[size]
          )}
          style={{
            background: `conic-gradient(from 0deg, ${frameConfig.borderColor}, ${frameConfig.glowColor}, ${frameConfig.borderColor})`,
            padding: size === 'xl' ? '3px' : size === 'lg' ? '2.5px' : '2px',
            boxShadow: `0 0 ${size === 'xl' ? '20px' : size === 'lg' ? '15px' : '10px'} ${frameConfig.glowColor}`,
            animation: frame === 'champion' ? 'championGlow 2s ease-in-out infinite' : undefined
          }}
        >
          <div className="w-full h-full rounded-full bg-background" />
        </div>
      )}

      {/* Avatar */}
      <Avatar className={cn(
        sizeClasses[size],
        frameConfig && "relative z-10",
        "ring-2 ring-background"
      )}>
        <AvatarImage src={src} alt={username} />
        <AvatarFallback className="bg-secondary text-secondary-foreground font-display text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Crown Badge */}
      {crown && (
        <div
          className={cn(
            "absolute z-20 flex items-center justify-center",
            crownOffsetClasses[size]
          )}
        >
          <div 
            className="relative"
            style={{
              filter: 'drop-shadow(0 0 4px hsla(45, 90%, 55%, 0.8))'
            }}
          >
            <Crown 
              className={cn(crownSizeClasses[size], "text-yellow-400 fill-yellow-400")} 
            />
          </div>
        </div>
      )}

      {/* Year notch for frames */}
      {frameConfig && frame !== 'participant' && (
        <div 
          className={cn(
            "absolute -bottom-1 left-1/2 -translate-x-1/2 z-20",
            "text-[8px] font-display font-bold px-1 rounded",
            "bg-background border"
          )}
          style={{
            borderColor: frameConfig.borderColor,
            color: frameConfig.borderColor
          }}
        >
          2026
        </div>
      )}
    </div>
  );

  if (!showHoverCard) {
    return avatarContent;
  }

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        {avatarContent}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-64 bg-card/95 backdrop-blur-sm border-border"
        align="center"
      >
        <div className="flex flex-col items-center gap-3 p-2">
          {/* Large Avatar Preview */}
          <AvatarWithFrame
            src={src}
            username={username}
            size="xl"
            frame={frame}
            crown={crown}
            showHoverCard={false}
          />

          {/* Username */}
          <div className="text-center">
            <p className="font-display font-semibold text-foreground">{username}</p>
            
            {/* Crown Badge */}
            {crown && (
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Crown className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">
                  {crown.track.charAt(0).toUpperCase() + crown.track.slice(1)} Champion — India {crown.year}
                </span>
              </div>
            )}

            {/* Frame Badge */}
            {frameConfig && (
              <Badge 
                variant="outline" 
                className="mt-2 text-xs"
                style={{
                  borderColor: frameConfig.borderColor,
                  color: frameConfig.borderColor
                }}
              >
                {frameConfig.name} Frame
              </Badge>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// Simpler version for lists and tables
export function AvatarWithCrown({
  src,
  username,
  size = "sm",
  isPastChampion,
  className
}: {
  src?: string;
  username: string;
  size?: "sm" | "md";
  isPastChampion?: boolean;
  className?: string;
}) {
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className={cn("relative inline-flex", className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={src} alt={username} />
        <AvatarFallback className="bg-secondary text-secondary-foreground font-display text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      {isPastChampion && (
        <Crown 
          className={cn(
            "absolute -top-1 -right-1 h-3 w-3 text-yellow-400 fill-yellow-400",
            "drop-shadow-[0_0_3px_hsla(45,90%,55%,0.8)]"
          )} 
        />
      )}
    </div>
  );
}

// Add the keyframes animation to the component
const styles = `
@keyframes championGlow {
  0%, 100% { 
    box-shadow: 0 0 15px hsla(45, 90%, 55%, 0.5);
  }
  50% { 
    box-shadow: 0 0 25px hsla(45, 90%, 55%, 0.8), 0 0 40px hsla(45, 90%, 55%, 0.4);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
