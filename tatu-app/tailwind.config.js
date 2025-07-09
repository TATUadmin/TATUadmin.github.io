const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
        // Dark Tattoo Theme
        'ink': {
          50: '#1a1a1a',
          100: '#222222',
          200: '#2a2a2a',
          300: '#404040',
          400: '#525252',
          500: '#737373',
          600: '#a3a3a3',
          700: '#d4d4d4',
          800: '#e5e5e5',
          900: '#f5f5f5',
          950: '#ffffff',
        },
        'charcoal': '#1a1a1a',
        'smoke': '#2a2a2a',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#ff6b35", // Vibrant orange/red
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f7931e", // Gold accent
          foreground: "#000000",
        },
        accent: {
          DEFAULT: "#e74c3c", // Red highlight  
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        // Tattoo-specific fonts
        'inter': ['Inter', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        'oswald': ['Oswald', 'sans-serif'],
        'bebas': ['Bebas Neue', 'sans-serif'],
        'righteous': ['Righteous', 'sans-serif'],
        'black-ops': ['Black Ops One', 'sans-serif'],
        'creepster': ['Creepster', 'sans-serif'],
        'monoton': ['Monoton', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'teko': ['Teko', 'sans-serif'],
        'permanent-marker': ['Permanent Marker', 'cursive'],
        'amatic': ['Amatic SC', 'cursive'],
        'bangers': ['Bangers', 'cursive'],
        'metal': ['Metal Mania', 'cursive'],
        'nosifer': ['Nosifer', 'cursive'],
        'abril': ['Abril Fatface', 'serif'],
        'anton': ['Anton', 'sans-serif'],
        'russo': ['Russo One', 'sans-serif'],
        'bungee': ['Bungee', 'cursive'],
        'fredoka': ['Fredoka One', 'cursive'],
        'passion': ['Passion One', 'cursive'],
        'crimson': ['Crimson Text', 'serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        // Custom tattoo animations
        'glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px #ff6b35',
          },
          '50%': {
            boxShadow: '0 0 20px #ff6b35, 0 0 30px #ff6b35',
          },
        },
        'pulse-ink': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.7',
          },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'fadeInUp': {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fadeInDown': {
          from: {
            opacity: '0',
            transform: 'translateY(-30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slideInLeft': {
          from: {
            opacity: '0',
            transform: 'translateX(-30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'slideInRight': {
          from: {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Custom tattoo animations
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-ink': 'pulse-ink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 3s ease-in-out infinite',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'fadeInDown': 'fadeInDown 0.6s ease-out',
        'slideInLeft': 'slideInLeft 0.6s ease-out',
        'slideInRight': 'slideInRight 0.6s ease-out',
      },
      // Custom shadows for dark theme
      boxShadow: {
        'glow-primary': '0 0 20px rgba(255, 107, 53, 0.3)',
        'glow-secondary': '0 0 20px rgba(247, 147, 30, 0.3)',
        'glow-accent': '0 0 20px rgba(231, 76, 60, 0.3)',
        'ink': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        'ink-lg': '0 20px 40px rgba(0, 0, 0, 0.4)',
        'ink-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      },
      // Custom gradients
      backgroundImage: {
        'gradient-fire': 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #e74c3c 100%)',
        'gradient-ink': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        'gradient-smoke': 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      },
      // Custom spacing for tattoo elements
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Custom typography
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '10xl': ['10rem', { lineHeight: '1' }],
        '11xl': ['12rem', { lineHeight: '1' }],
        '12xl': ['14rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 