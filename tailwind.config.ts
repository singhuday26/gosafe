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
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tourism: {
          DEFAULT: "hsl(var(--tourism))",
          foreground: "hsl(var(--tourism-foreground))",
        },
        safety: {
          DEFAULT: "hsl(var(--safety))",
          foreground: "hsl(var(--safety-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
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
        // North East India Themed Colors (Additive)
        ne: {
          'tea-brown': 'hsl(var(--ne-tea-brown))', // Assam Tea Brown
          'mist-gray': 'hsl(var(--ne-mist-gray))', // Meghalaya Mist Gray
          'sunset-orange': 'hsl(var(--ne-sunset-orange))', // Nagaland Sunset Orange
          'forest-green': 'hsl(var(--ne-forest-green))', // Arunachal Green
          'sky-blue': 'hsl(var(--ne-sky-blue))', // Sikkim Sky Blue
          'maroon': 'hsl(var(--ne-maroon))', // Manipur Maroon
          'primary': 'hsl(var(--ne-primary))',
          'accent': 'hsl(var(--ne-accent))',
          'soft': 'hsl(var(--ne-soft))',
        },
      },
      fontFamily: {
        // North East Themed Typography
        'heading': ['Montserrat', 'Poppins', 'sans-serif'],
        'body': ['Lato', 'Roboto', 'sans-serif'],
        'sans': ['Lato', 'Roboto', 'sans-serif'],
        // Keep existing fonts
        'montserrat': ['Montserrat', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        // North East Themed Animations
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1"
          }
        },
        "pulse-ne": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 hsl(var(--ne-sunset-orange) / 0.7)"
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 0 10px hsl(var(--ne-sunset-orange) / 0)"
          }
        },
        "tribal-shimmer": {
          "0%": {
            backgroundPosition: "-200% center"
          },
          "100%": {
            backgroundPosition: "200% center"
          }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // North East Themed Animations
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-ne": "pulse-ne 2s ease-in-out infinite",
        "tribal-shimmer": "tribal-shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
