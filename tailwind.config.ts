import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // CodeLock Custom Colors
        neon: {
          DEFAULT: "hsl(var(--neon))",
          blue: "hsl(var(--neon-blue))",
          cyan: "hsl(var(--neon-cyan))",
          purple: "hsl(var(--neon-purple))",
          soft: "hsl(var(--neon-soft))",
        },
        arena: {
          dark: "hsl(var(--arena-dark))",
          surface: "hsl(var(--arena-surface))",
          border: "hsl(var(--arena-border))",
        },
        rank: {
          bronze: "hsl(var(--rank-bronze))",
          silver: "hsl(var(--rank-silver))",
          gold: "hsl(var(--rank-gold))",
          platinum: "hsl(var(--rank-platinum))",
          diamond: "hsl(var(--rank-diamond))",
          master: "hsl(var(--rank-master))",
          legend: "hsl(var(--rank-legend))",
        },
        status: {
          success: "hsl(var(--success))",
          warning: "hsl(var(--warning))",
          info: "hsl(var(--info))",
        },
        // Blue Lock — Egoist Command Center palette
        void: "hsl(var(--void))",
        deep: "hsl(var(--deep))",
        panel: {
          DEFAULT: "hsl(var(--panel))",
          2: "hsl(var(--panel-2))",
        },
        line: {
          DEFAULT: "hsl(var(--line))",
          bright: "hsl(var(--line-bright))",
        },
        electric: "hsl(var(--electric))",
        "blue-mid": "hsl(var(--blue-mid))",
        "blue-deep": "hsl(var(--blue-deep))",
        ember: {
          DEFAULT: "hsl(var(--ember))",
          soft: "hsl(var(--ember-soft))",
        },
        blood: "hsl(var(--blood))",
        gold: "hsl(var(--gold))",
        text: {
          DEFAULT: "hsl(var(--text))",
          dim: "hsl(var(--text-dim))",
          mute: "hsl(var(--text-mute))",
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'Orbitron', 'sans-serif'],
        heading: ['Space Grotesk', 'Rajdhani', 'sans-serif'],
        sans: ['Inter', 'Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsla(199, 100%, 50%, 0.3)" },
          "50%": { boxShadow: "0 0 40px hsla(199, 100%, 50%, 0.6)" },
        },
        "electric-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "typing": {
          "from": { width: "0" },
          "to": { width: "100%" },
        },
        "streak-flame": {
          "0%": { filter: "drop-shadow(0 0 5px hsl(45 93% 47%))" },
          "100%": { filter: "drop-shadow(0 0 15px hsl(45 93% 47%)) brightness(1.2)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "slide-in-left": "slide-in-left 0.4s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "electric-flow": "electric-flow 3s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "typing": "typing 3.5s steps(40, end)",
        "streak-flame": "streak-flame 1.5s ease-in-out infinite alternate",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-electric': 'linear-gradient(135deg, hsl(var(--neon-blue)), hsl(var(--neon-cyan)))',
        'gradient-legendary': 'linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--rank-legend)), hsl(var(--neon-blue)))',
        'gradient-arena': 'linear-gradient(135deg, hsl(var(--arena-dark)), hsl(var(--arena-surface)), hsl(var(--arena-dark)))',
      },
      boxShadow: {
        'neon': '0 0 20px hsla(199, 100%, 50%, 0.3)',
        'neon-strong': '0 0 40px hsla(199, 100%, 50%, 0.5)',
        'neon-cyan': '0 0 20px hsla(185, 100%, 50%, 0.3)',
        'arena': '0 4px 20px hsla(0, 0%, 0%, 0.3)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
